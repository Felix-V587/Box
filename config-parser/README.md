# TVBox 配置解析器

这是一个使用 Node.js + TypeScript 实现的 TVBox 配置解析器，复刻了原 Android 项目中的配置解析功能。

## 功能特性

- ✅ 支持普通 JSON 配置
- ✅ 支持 Base64 编码配置
- ✅ 支持 AES-ECB 加密配置
- ✅ 支持 AES-CBC 加密配置
- ✅ 支持 Clan 协议地址
- ✅ 支持相对路径修复
- ✅ 支持加密密钥提取 (`;pk;` 分隔符)

## 项目结构

```
config-parser/
├── src/
│   ├── index.ts      # 主入口
│   ├── parser.ts     # 配置解析器
│   ├── aes.ts        # AES加解密工具
│   └── types.ts      # 类型定义
├── output/           # 解析结果输出目录
├── package.json
└── tsconfig.json
```

## 安装依赖

```bash
cd config-parser
npm install
```

## 使用方法

### 方式一：直接运行

```bash
npm start
```

### 方式二：编译后运行

```bash
npm run build
node dist/index.js
```

## 配置地址格式

支持以下格式的配置地址：

1. **普通 HTTP 地址**
   ```
   http://example.com/config.json
   ```

2. **加密配置 (带密钥)**
   ```
   http://example.com/config.json;pk;your-secret-key
   ```

3. **Clan 协议**
   ```
   clan://localhost/config.json
   clan://example.com/path/config.json
   ```

4. **Base64 编码配置**
   - 以 `********` 开头的配置会自动进行 Base64 解码

5. **AES-CBC 加密配置**
   - 以 `2423` 开头的配置会自动提取密钥并解密

## 输出结果

解析成功后会在 `output` 目录生成以下文件：

- `config.json` - 解析后的完整配置（格式化JSON）
- `decrypted-content.json` - 解密后的原始内容

## 核心实现

### 配置解析流程

```
1. 获取配置 URL
   ↓
2. 处理特殊格式
   - clan:// → 转换为 HTTP 地址
   - ;pk; → 提取解密密钥
   ↓
3. 网络请求获取配置内容
   ↓
4. 内容解密处理
   - Base64 解码
   - AES-ECB 解密
   - AES-CBC 解密
   ↓
5. JSON 解析
   ↓
6. 输出解析结果
```

### 关键类

- **ConfigParser** - 配置解析器主类
- **AES** - AES 加解密工具类

## 技术栈

- Node.js
- TypeScript
- Axios (HTTP 请求)
- Crypto (AES 加解密)

## 参考

本项目复刻自 TVBox Android 项目的配置解析功能，核心逻辑参考：
- `ApiConfig.java` - 配置加载和解析
- `AES.java` - AES 加解密工具
