# TVBox爬虫移植可行性分析报告

## 一、TVBox爬虫架构分析

### 1.1 核心架构

TVBox的爬虫系统基于以下技术栈：

```
┌─────────────────────────────────────────┐
│         TVBox Android应用               │
├─────────────────────────────────────────┤
│  Spider接口层 (Spider.java)             │
│  ├─ homeContent()     首页数据          │
│  ├─ categoryContent() 分类数据          │
│  ├─ detailContent()   详情数据          │
│  ├─ searchContent()   搜索数据          │
│  └─ playerContent()   播放数据          │
├─────────────────────────────────────────┤
│  Spider加载层 (JsLoader.java)           │
│  ├─ getSpider()       获取Spider实例    │
│  ├─ loadJarInternal()  加载JAR包        │
│  └─ loadClassLoader() 加载DexClassLoader│
├─────────────────────────────────────────┤
│  Spider执行层 (JsSpider.java)           │
│  ├─ QuickJSContext    JavaScript引擎    │
│  ├─ initializeJS()    初始化JS环境      │
│  ├─ call()            调用Spider方法    │
│  └─ execute()         执行JS代码        │
├─────────────────────────────────────────┤
│  JavaScript运行时                        │
│  ├─ QuickJS          轻量级JS引擎       │
│  ├─ cheerio          HTML解析库         │
│  ├─ crypto-js        加密库             │
│  └─ 自定义API        http, pdfh等       │
├─────────────────────────────────────────┤
│  网络请求层 (Connect.java, Req.java)    │
│  ├─ OkHttp           HTTP客户端         │
│  ├─ Cookie管理       会话保持           │
│  └─ 代理支持         请求转发           │
└─────────────────────────────────────────┘
```

### 1.2 Spider接口定义

```java
public interface Spider {
    // 首页数据
    String homeContent(boolean filter);

    // 首页最近更新
    String homeVideoContent();

    // 分类数据
    String categoryContent(String tid, String pg, boolean filter, HashMap<String, String> extend);

    // 详情数据
    String detailContent(List<String> ids);

    // 搜索数据
    String searchContent(String key, boolean quick);

    // 播放数据
    String playerContent(String flag, String id, List<String> vipFlags);

    // 其他功能
    boolean manualVideoCheck();
    boolean isVideoFormat(String url);
}
```

### 1.3 Spider执行流程

```
1. 加载阶段
   ├─ 下载Spider JAR包
   ├─ 缓存到本地
   └─ 使用DexClassLoader加载

2. 初始化阶段
   ├─ 创建QuickJSContext
   ├─ 注册全局API (http, pdfh等)
   ├─ 加载依赖模块 (cheerio, crypto-js)
   └─ 执行Spider初始化代码

3. 执行阶段
   ├─ 调用Spider方法 (home, search等)
   ├─ QuickJS执行JavaScript代码
   ├─ 网络请求获取数据
   └─ 解析HTML/JSON返回结果

4. 清理阶段
   ├─ 取消所有网络请求
   ├─ 销毁QuickJSContext
   └─ 释放资源
```

### 1.4 JavaScript运行时环境

TVBox为Spider提供了丰富的JavaScript API：

#### 全局对象

```javascript
// HTTP请求
http.get(url, headers)      // GET请求
http.post(url, data, headers) // POST请求

// HTML解析
pdfh(html, rule)           // 解析HTML元素
pdfa(html, rule)           // 解析HTML数组
pd(html, rule, add_url)    // 解析并拼接URL
pdfla(html, p1, list_text, list_url, add_url) // 解析列表

// 加密解密
crypto.MD5(text)           // MD5加密
crypto.SHA256(text)        // SHA256加密

// 工具函数
joinUrl(parent, child)     // URL拼接
s2t(text)                  // 简转繁
t2s(text)                  // 繁转简
```

#### Spider标准接口

```javascript
{
    // 初始化
    init(ext) {},

    // 首页
    home(filter) {
        return JSON.stringify({
            class: [{type_id: "1", type_name: "电影"}],
            filters: {}
        });
    },

    // 分类
    category(tid, pg, filter, extend) {
        return JSON.stringify({
            list: [{
                vod_id: "1",
                vod_name: "视频名称",
                vod_pic: "封面URL",
                vod_remarks: "备注"
            }]
        });
    },

    // 详情
    detail(ids) {
        return JSON.stringify({
            list: [{
                vod_id: "1",
                vod_play_from: "线路1$$$线路2",
                vod_play_url: "第1集$url1#第2集$url2$$$第1集$url3"
            }]
        });
    },

    // 搜索
    search(key, quick) {
        return JSON.stringify({
            list: [...]
        });
    },

    // 播放
    play(flag, id, vipFlags) {
        return JSON.stringify({
            parse: 0,
            url: "播放地址",
            jx: 0
        });
    }
}
```

## 二、Node.js移植可行性分析

### 2.1 技术栈对比

| 功能 | TVBox (Android) | Node.js | 可行性 |
|------|----------------|---------|--------|
| JavaScript引擎 | QuickJS | V8 | ✅ 完全兼容 |
| HTTP请求 | OkHttp | axios/undici | ✅ 完全兼容 |
| HTML解析 | cheerio | cheerio | ✅ 完全兼容 |
| 加密解密 | crypto-js | crypto-js | ✅ 完全兼容 |
| 正则表达式 | JS原生 | JS原生 | ✅ 完全兼容 |
| JSON处理 | JS原生 | JS原生 | ✅ 完全兼容 |
| 异步处理 | ExecutorService | async/await | ✅ 完全兼容 |
| 模块系统 | QuickJS Module | CommonJS/ESM | ✅ 需要适配 |

### 2.2 可行性评估

#### ✅ 高度可行部分

1. **JavaScript代码执行**
   - Node.js的V8引擎比QuickJS更强大
   - 完全支持ES6+语法
   - 性能更优

2. **HTTP请求**
   - axios提供完整的HTTP客户端
   - 支持Cookie、代理、重定向
   - 完全兼容OkHttp功能

3. **HTML解析**
   - cheerio在Node.js中完全可用
   - API与TVBox版本一致
   - 功能完全相同

4. **加密解密**
   - crypto-js在Node.js中可用
   - 功能完全相同
   - 性能更好

#### ⚠️ 需要适配部分

1. **模块系统**
   - TVBox使用QuickJS Module系统
   - Node.js使用CommonJS/ESM
   - 需要实现模块加载器

2. **全局API**
   - TVBox提供http、pdfh等全局对象
   - 需要在Node.js中模拟这些API
   - 需要实现相同的接口

3. **Spider加载**
   - TVBox从JAR包加载Spider
   - Node.js可以直接加载JS文件
   - 需要实现Spider管理器

4. **异步处理**
   - TVBox使用线程池
   - Node.js使用事件循环
   - 需要适配异步模型

#### ❌ 不兼容部分

1. **Android原生API**
   - TVBox使用Android Context
   - Node.js无法访问Android API
   - 不影响核心Spider功能

2. **JAR包加载**
   - TVBox使用DexClassLoader
   - Node.js无法加载JAR/Dex
   - 需要提取JS代码

3. **WebView集成**
   - TVBox支持WebView解析
   - Node.js无法使用WebView
   - 需要使用headless浏览器

### 2.3 移植难度评估

| 模块 | 难度 | 工作量 | 风险 |
|------|------|--------|------|
| JavaScript执行环境 | 低 | 2天 | 低 |
| HTTP请求模块 | 低 | 1天 | 低 |
| HTML解析模块 | 低 | 1天 | 低 |
| 加密解密模块 | 低 | 1天 | 低 |
| 全局API实现 | 中 | 3天 | 中 |
| 模块加载器 | 中 | 3天 | 中 |
| Spider管理器 | 中 | 2天 | 中 |
| 异步处理适配 | 中 | 2天 | 中 |
| 错误处理 | 低 | 1天 | 低 |
| 性能优化 | 高 | 5天 | 中 |
| 测试验证 | 中 | 3天 | 低 |

**总工作量**: 约23天（约4-5周）

## 三、移植方案设计

### 3.1 架构设计

```
┌─────────────────────────────────────────┐
│         Node.js Spider引擎              │
├─────────────────────────────────────────┤
│  Spider接口层 (Spider.ts)               │
│  └─ 与TVBox Spider接口保持一致          │
├─────────────────────────────────────────┤
│  Spider管理器 (SpiderManager.ts)        │
│  ├─ 加载Spider配置                      │
│  ├─ 创建Spider实例                      │
│  ├─ 缓存Spider实例                      │
│  └─ 销毁Spider实例                      │
├─────────────────────────────────────────┤
│  JavaScript运行时 (JSEngine.ts)         │
│  ├─ vm2/v8-compile-cache 沙箱环境      │
│  ├─ 模块加载器 (ModuleLoader.ts)        │
│  ├─ 全局API注入 (GlobalAPI.ts)          │
│  └─ 异步执行器 (AsyncExecutor.ts)       │
├─────────────────────────────────────────┤
│  核心模块                                │
│  ├─ HTTP模块 (HttpModule.ts)            │
│  ├─ HTML解析模块 (HtmlParser.ts)        │
│  ├─ 加密模块 (CryptoModule.ts)          │
│  ├─ 工具模块 (UtilModule.ts)            │
│  └─ 转换模块 (TransModule.ts)           │
├─────────────────────────────────────────┤
│  依赖库                                  │
│  ├─ vm2/v8-compile-cache 沙箱           │
│  ├─ axios HTTP客户端                    │
│  ├─ cheerio HTML解析                    │
│  ├─ crypto-js 加密解密                  │
│  └─ puppeteer 浏览器自动化              │
└─────────────────────────────────────────┘
```

### 3.2 核心模块实现

#### 3.2.1 Spider接口

```typescript
export interface ISpider {
    // 初始化
    init(ext?: string): Promise<void>;

    // 首页
    home(filter?: boolean): Promise<string>;

    // 首页最近更新
    homeVod(): Promise<string>;

    // 分类
    category(tid: string, pg: string, filter?: boolean, extend?: Record<string, string>): Promise<string>;

    // 详情
    detail(ids: string[]): Promise<string>;

    // 搜索
    search(key: string, quick?: boolean, pg?: string): Promise<string>;

    // 播放
    play(flag: string, id: string, vipFlags?: string[]): Promise<string>;

    // 其他
    sniffer(): Promise<boolean>;
    isVideo(url: string): Promise<boolean>;

    // 清理
    destroy(): void;
}
```

#### 3.2.2 Spider管理器

```typescript
export class SpiderManager {
    private spiders: Map<string, ISpider> = new Map();
    private config: SpiderConfig;

    async loadSpider(key: string, api: string, ext?: string, jar?: string): Promise<ISpider> {
        // 检查缓存
        if (this.spiders.has(key)) {
            return this.spiders.get(key)!;
        }

        // 创建Spider实例
        const spider = await this.createSpider(key, api, ext, jar);
        this.spiders.set(key, spider);
        return spider;
    }

    private async createSpider(key: string, api: string, ext?: string, jar?: string): Promise<ISpider> {
        // 加载Spider代码
        const spiderCode = await this.loadSpiderCode(api, jar);

        // 创建JS引擎
        const engine = new JSEngine();

        // 注入全局API
        engine.injectGlobalAPI(new GlobalAPI());

        // 执行Spider代码
        await engine.execute(spiderCode);

        // 创建Spider包装器
        return new SpiderWrapper(engine, key);
    }

    destroy(key: string): void {
        const spider = this.spiders.get(key);
        if (spider) {
            spider.destroy();
            this.spiders.delete(key);
        }
    }

    destroyAll(): void {
        this.spiders.forEach(spider => spider.destroy());
        this.spiders.clear();
    }
}
```

#### 3.2.3 JavaScript引擎

```typescript
export class JSEngine {
    private vm: any;
    private context: any;
    private moduleLoader: ModuleLoader;

    constructor() {
        // 使用vm2创建沙箱环境
        this.vm = new VM({
            timeout: 30000,
            sandbox: {},
            eval: false,
            wasm: false,
            fixAsync: true
        });

        // 初始化模块加载器
        this.moduleLoader = new ModuleLoader();
    }

    async injectGlobalAPI(api: GlobalAPI): Promise<void> {
        // 注入全局对象
        this.vm.setGlobal('http', api.http);
        this.vm.setGlobal('pdfh', api.pdfh);
        this.vm.setGlobal('pdfa', api.pdfa);
        this.vm.setGlobal('pd', api.pd);
        this.vm.setGlobal('pdfla', api.pdfla);
        this.vm.setGlobal('crypto', api.crypto);
        this.vm.setGlobal('joinUrl', api.joinUrl);
        this.vm.setGlobal('s2t', api.s2t);
        this.vm.setGlobal('t2s', api.t2s);
    }

    async execute(code: string): Promise<void> {
        await this.vm.run(code);
    }

    async call(funcName: string, ...args: any[]): Promise<any> {
        return await this.vm.call(funcName, ...args);
    }

    destroy(): void {
        this.vm.destroy();
    }
}
```

#### 3.2.4 全局API实现

```typescript
export class GlobalAPI {
    // HTTP模块
    http = {
        get: async (url: string, headers?: Record<string, string>) => {
            const response = await axios.get(url, { headers });
            return {
                code: response.status,
                content: response.data,
                headers: response.headers
            };
        },
        post: async (url: string, data: any, headers?: Record<string, string>) => {
            const response = await axios.post(url, data, { headers });
            return {
                code: response.status,
                content: response.data,
                headers: response.headers
            };
        }
    };

    // HTML解析
    pdfh = (html: string, rule: string): string => {
        return HtmlParser.parseDomForUrl(html, rule, '');
    };

    pdfa = (html: string, rule: string): string[] => {
        return HtmlParser.parseDomForArray(html, rule);
    };

    pd = (html: string, rule: string, addUrl: string): string => {
        return HtmlParser.parseDomForUrl(html, rule, addUrl);
    };

    pdfla = (html: string, p1: string, listText: string, listUrl: string, addUrl: string): string[] => {
        return HtmlParser.parseDomForList(html, p1, listText, listUrl, addUrl);
    };

    // 加密
    crypto = {
        MD5: (text: string) => CryptoJS.MD5(text).toString(),
        SHA256: (text: string) => CryptoJS.SHA256(text).toString(),
        AES: {
            encrypt: (data: string, key: string) => CryptoJS.AES.encrypt(data, key).toString(),
            decrypt: (encrypted: string, key: string) => CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8)
        }
    };

    // 工具函数
    joinUrl = (parent: string, child: string): string => {
        return new URL(child, parent).href;
    };

    s2t = (text: string): string => {
        // 简转繁
        return text; // 需要实现
    };

    t2s = (text: string): string => {
        // 繁转简
        return text; // 需要实现
    };
}
```

### 3.3 Spider加载流程

```
1. 配置解析
   ├─ 读取站点配置
   ├─ 解析Spider API地址
   └─ 解析扩展参数

2. Spider代码获取
   ├─ 从缓存读取
   ├─ 从网络下载
   └─ 解密处理

3. JS环境初始化
   ├─ 创建vm2沙箱
   ├─ 注入全局API
   ├─ 加载依赖模块
   └─ 执行Spider代码

4. Spider实例创建
   ├─ 调用init方法
   ├─ 传递扩展参数
   └─ 缓存实例

5. 方法调用
   ├─ 调用Spider方法
   ├─ 获取返回结果
   └─ 错误处理

6. 资源清理
   ├─ 取消网络请求
   ├─ 销毁JS环境
   └─ 释放内存
```

## 四、技术挑战与解决方案

### 4.1 模块系统适配

**挑战**:
- TVBox使用QuickJS Module系统
- Node.js使用CommonJS/ESM
- Spider代码可能使用import/export

**解决方案**:
```typescript
class ModuleLoader {
    private cache: Map<string, any> = new Map();

    async load(moduleName: string): Promise<any> {
        // 检查缓存
        if (this.cache.has(moduleName)) {
            return this.cache.get(moduleName);
        }

        // 加载模块
        let module;
        if (moduleName === 'cheerio') {
            module = cheerio;
        } else if (moduleName === 'crypto-js') {
            module = CryptoJS;
        } else {
            // 从网络加载
            const code = await this.fetchModule(moduleName);
            module = await this.executeModule(code);
        }

        // 缓存模块
        this.cache.set(moduleName, module);
        return module;
    }

    private async fetchModule(moduleName: string): Promise<string> {
        // 从CDN或本地加载模块代码
        // ...
    }

    private async executeModule(code: string): Promise<any> {
        // 在沙箱中执行模块代码
        // ...
    }
}
```

### 4.2 异步处理适配

**挑战**:
- TVBox使用线程池处理异步
- Node.js使用事件循环
- Spider代码可能使用回调

**解决方案**:
```typescript
class AsyncExecutor {
    private executor: Executor;

    constructor() {
        this.executor = new Executor({
            maxWorkers: 10,
            timeout: 30000
        });
    }

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        try {
            return await this.executor.run(fn);
        } catch (error) {
            throw new SpiderError('Async execution failed', error);
        }
    }

    destroy(): void {
        this.executor.destroy();
    }
}
```

### 4.3 安全性保障

**挑战**:
- Spider代码可能包含恶意代码
- 需要限制Spider的权限
- 防止资源耗尽

**解决方案**:
```typescript
class SecureJSEngine {
    private vm: VM;

    constructor() {
        this.vm = new VM({
            timeout: 30000,           // 超时限制
            sandbox: {},              // 空沙箱
            eval: false,              // 禁用eval
            wasm: false,              // 禁用WASM
            fixAsync: true,           // 修复异步
            allowAsync: false,        // 禁用原生异步
            strict: true,             // 严格模式
            console: 'off',           // 禁用console
            require: {
                external: false,      // 禁用require
                builtin: [],          // 禁用内置模块
                root: './sandbox',    // 限制根目录
                mock: {}              // 模拟模块
            }
        });
    }

    // 只注入必要的全局API
    injectSafeAPI(api: SafeAPI): void {
        const safeMethods = {
            http: {
                get: this.wrapAsync(api.http.get),
                post: this.wrapAsync(api.http.post)
            },
            pdfh: api.pdfh,
            pdfa: api.pdfa,
            // ...
        };

        this.vm.setGlobal(safeMethods);
    }

    private wrapAsync(fn: Function): Function {
        return (...args: any[]) => {
            return new Promise((resolve, reject) => {
                fn(...args).then(resolve).catch(reject);
            });
        };
    }
}
```

### 4.4 性能优化

**挑战**:
- 多个Spider并发执行
- 需要优化内存使用
- 需要提高执行速度

**解决方案**:
```typescript
class SpiderPool {
    private pool: Map<string, ISpider> = new Map();
    private maxSize: number = 10;

    async getSpider(key: string): Promise<ISpider> {
        // 检查缓存
        if (this.pool.has(key)) {
            return this.pool.get(key)!;
        }

        // 检查池大小
        if (this.pool.size >= this.maxSize) {
            // 清理最老的Spider
            const oldest = this.pool.keys().next().value;
            this.destroySpider(oldest);
        }

        // 创建新Spider
        const spider = await this.createSpider(key);
        this.pool.set(key, spider);
        return spider;
    }

    private destroySpider(key: string): void {
        const spider = this.pool.get(key);
        if (spider) {
            spider.destroy();
            this.pool.delete(key);
        }
    }
}
```

## 五、实施计划

### 5.1 开发阶段

#### 第一阶段：基础框架（1周）
- [x] Spider接口定义
- [x] Spider管理器框架
- [x] JSEngine基础实现
- [ ] 单元测试

#### 第二阶段：核心模块（1周）
- [ ] HTTP模块实现
- [ ] HTML解析模块
- [ ] 加密模块实现
- [ ] 工具模块实现

#### 第三阶段：Spider执行（1周）
- [ ] 模块加载器
- [ ] 全局API注入
- [ ] 异步处理适配
- [ ] 错误处理

#### 第四阶段：优化测试（1周）
- [ ] 性能优化
- [ ] 安全加固
- [ ] 集成测试
- [ ] 文档完善

### 5.2 测试计划

#### 单元测试
- [ ] JSEngine测试
- [ ] 各模块功能测试
- [ ] 错误处理测试

#### 集成测试
- [ ] Spider加载测试
- [ ] Spider执行测试
- [ ] 并发测试

#### 性能测试
- [ ] 内存使用测试
- [ ] 执行速度测试
- [ ] 并发性能测试

### 5.3 风险评估

| 风险 | 影响 | 概率 | 应对措施 |
|------|------|------|---------|
| Spider代码不兼容 | 高 | 中 | 提供适配层 |
| 性能不达标 | 中 | 低 | 优化算法 |
| 安全漏洞 | 高 | 低 | 沙箱隔离 |
| 内存泄漏 | 中 | 中 | 资源管理 |

## 六、总结

### 6.1 可行性结论

✅ **高度可行**

TVBox爬虫移植到Node.js在技术上完全可行，主要原因：

1. **JavaScript生态成熟**
   - Node.js的V8引擎比QuickJS更强大
   - 所有依赖库都有Node.js版本
   - 社区支持完善

2. **架构相似**
   - TVBox的Spider接口清晰
   - 执行流程可以复制
   - API可以完全模拟

3. **工作量可控**
   - 预计4-5周完成
   - 风险可控
   - 可分阶段实施

### 6.2 技术优势

相比TVBox Android版本，Node.js版本具有以下优势：

1. **性能更好**
   - V8引擎比QuickJS更快
   - 异步处理更高效
   - 内存管理更好

2. **部署灵活**
   - 可部署到任何服务器
   - 不依赖Android环境
   - 易于扩展

3. **开发便利**
   - 调试工具完善
   - 生态丰富
   - 维护成本低

### 6.3 应用场景

移植后的Spider引擎可用于：

1. **独立服务**
   - 作为独立的爬虫服务
   - 提供API接口
   - 支持多租户

2. **微服务**
   - 集成到微服务架构
   - 支持水平扩展
   - 高可用部署

3. **云端部署**
   - 部署到云服务器
   - 支持容器化
   - 易于扩展

### 6.4 建议

1. **分阶段实施**
   - 先实现核心功能
   - 逐步完善细节
   - 持续优化

2. **充分测试**
   - 单元测试覆盖
   - 集成测试验证
   - 性能测试优化

3. **安全优先**
   - 沙箱隔离
   - 权限限制
   - 资源控制

---

**结论**: TVBox爬虫移植到Node.js在技术上完全可行，预计4-5周完成，具有显著的技术优势和广阔的应用前景。

**文档版本**: v1.0
**分析时间**: 2026-04-11
**维护人员**: CodeArts代码智能体
