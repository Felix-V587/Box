# Spider 执行机制分析与实现方案

## Spider 机制分析

### Spider 类型

TVBox 中的 Spider 主要有几种类型：

1. **csp_XPath** - XPath解析
2. **csp_AppSx** - App接口
3. **csp_T4** - T4引擎
4. **drpy** - Python爬虫
5. **自定义Spider** - JavaScript爬虫

### Spider 文件格式

Spider 通常打包在 JAR 文件中，包含：
- JavaScript 代码
- Python 代码（drpy）
- 配置文件

### 执行环境

TVBox 应用内提供：
- JavaScript 引擎（QuickJS）
- Python 引擎（可选）
- HTTP 客户端
- 本地服务器

## 实现方案

### 方案一：直接HTTP请求（推荐）

**原理**：
很多站点的 Spider 实际上是调用第三方 API，我们可以直接调用这些 API。

**优点**：
- ✅ 实现简单
- ✅ 不依赖复杂环境
- ✅ 性能好

**缺点**：
- ❌ 需要分析每个站点的API
- ❌ 可能有反爬机制

**实现**：
```typescript
// 直接调用站点API
const response = await axios.get(siteApiUrl, {
  params: { wd: keyword }
});
```

### 方案二：JavaScript Spider 执行

**原理**：
使用 Node.js 的 VM 模块或 QuickJS 执行 Spider 代码。

**优点**：
- ✅ 支持复杂逻辑
- ✅ 接近原生实现

**缺点**：
- ❌ 需要处理依赖
- ❌ 安全性问题
- ❌ 实现复杂

### 方案三：Python Spider 执行

**原理**：
使用 Python 子进程执行 drpy Spider。

**优点**：
- ✅ 支持 drpy Spider
- ✅ 功能完整

**缺点**：
- ❌ 需要 Python 环境
- ❌ 性能开销

## 推荐实现：混合方案

结合方案一和方案二，实现一个灵活的 Spider 执行引擎：

### 架构设计

```
SpiderEngine
├── HttpSpider      # 直接HTTP请求
├── JsSpider        # JavaScript执行
└── PythonSpider    # Python执行（可选）
```

### 实现策略

1. **优先使用HTTP API**
   - 分析站点配置
   - 提取API地址
   - 直接调用

2. **降级到Spider执行**
   - 加载Spider代码
   - 在沙箱环境执行
   - 返回结果

3. **缓存机制**
   - 缓存Spider代码
   - 缓存执行结果
   - 提升性能

## 具体实现

### 1. HTTP Spider 实现

针对常见的站点类型，实现直接的API调用：

**AppSx 类型站点**：
```typescript
// 这类站点通常有固定的API格式
const apiUrl = site.ext?.api || site.api;
const response = await axios.get(`${apiUrl}/api.php/provide/vod`, {
  params: { ac: 'list', wd: keyword }
});
```

**XPath 类型站点**：
```typescript
// 需要解析HTML
const html = await axios.get(siteUrl);
const result = parseHTML(html, xpathRules);
```

### 2. 简化 Spider 执行

对于无法直接API调用的站点，实现简化的Spider执行：

```typescript
class SimpleSpiderEngine {
  async execute(spiderCode: string, action: string, params: any) {
    // 创建沙箱环境
    const sandbox = {
      axios: require('axios'),
      cheerio: require('cheerio'),
      // 其他依赖
    };
    
    // 执行Spider代码
    const result = vm.runInNewContext(spiderCode, sandbox);
    return result;
  }
}
```

## 当前实现计划

### 第一阶段：HTTP API 实现

1. 分析配置中的站点类型
2. 实现常见类型的API调用
3. 处理返回数据格式

### 第二阶段：Spider 执行（可选）

1. 加载 Spider JAR
2. 解析 Spider 代码
3. 沙箱执行

### 第三阶段：优化

1. 添加缓存
2. 错误处理
3. 性能优化

## 技术选型

### 必需依赖
- axios - HTTP请求
- cheerio - HTML解析（XPath站点）

### 可选依赖
- vm2 - JavaScript沙箱
- python-shell - Python执行

## 实现优先级

1. **高优先级**：HTTP API 实现
   - AppSx 站点
   - T4 站点
   - 简单API站点

2. **中优先级**：HTML 解析
   - XPath 站点
   - 自定义规则

3. **低优先级**：Spider 执行
   - JavaScript Spider
   - Python Spider

## 注意事项

1. **反爬机制**
   - User-Agent 设置
   - 请求频率控制
   - Cookie 处理

2. **数据格式**
   - 不同站点格式不同
   - 需要统一处理

3. **错误处理**
   - 网络错误
   - 解析错误
   - 超时处理

4. **性能优化**
   - 并发控制
   - 结果缓存
   - 超时设置

---

**文档版本**: v1.0  
**实现状态**: 规划中  
**优先级**: 高
