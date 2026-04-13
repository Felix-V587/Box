# TVBox 全栈应用

这是一个基于 NestJS + SQLite 后端和 Vue3 前端的全栈应用，实现了 TVBox 配置解析、视频搜索和播放地址获取功能。

## 项目结构

```
tvbox-fullstack/
├── backend/          # NestJS 后端服务
│   ├── src/
│   │   ├── modules/
│   │   │   ├── config/     # 配置模块
│   │   │   ├── search/     # 搜索模块
│   │   │   └── player/     # 播放模块
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/         # Vue3 前端应用
│   ├── src/
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 功能特性

### 后端功能 (NestJS)

1. **配置模块** (`/api/config`)
   - POST `/api/config/load` - 加载配置
   - GET `/api/config/current` - 获取当前配置
   - GET `/api/config/sites` - 获取所有站点
   - GET `/api/config/searchable-sites` - 获取支持搜索的站点

2. **搜索模块** (`/api/search`)
   - POST `/api/search` - 搜索视频

3. **播放模块** (`/api/player`)
   - POST `/api/player/info` - 获取播放信息
   - POST `/api/player/m3u8` - 提取M3U8地址

### 前端功能 (Vue3 + Element Plus)

1. **配置加载**
   - 输入配置地址
   - 加载并解析配置

2. **视频搜索**
   - 输入搜索关键词
   - 显示搜索结果
   - 支持多站点聚合搜索

3. **播放地址获取**
   - 选择视频
   - 获取播放线路
   - 显示剧集列表
   - 支持M3U8/MP4格式识别
   - 一键播放和复制地址

## 安装与运行

### 1. 安装后端依赖

```bash
cd backend
npm install
```

### 2. 安装前端依赖

```bash
cd frontend
npm install
```

### 3. 启动后端服务

```bash
cd backend
npm run start:dev
```

后端服务将运行在 `http://localhost:3000`

### 4. 启动前端服务

```bash
cd frontend
npm run dev
```

前端服务将运行在 `http://localhost:5173`

### 5. 访问应用

打开浏览器访问 `http://localhost:5173`

## 使用流程

1. **加载配置**
   - 在配置加载卡片中输入配置地址（默认已填入示例地址）
   - 点击"加载配置"按钮
   - 等待配置加载成功

2. **搜索视频**
   - 在搜索框中输入关键词（如：仙逆）
   - 点击"搜索"按钮或按回车键
   - 查看搜索结果列表

3. **获取播放地址**
   - 在搜索结果中点击"获取播放地址"按钮
   - 查看播放线路和剧集列表
   - 选择剧集，点击"播放"或"复制"按钮

## 技术栈

### 后端
- **NestJS** - Node.js 企业级框架
- **TypeScript** - 类型安全的 JavaScript
- **Axios** - HTTP 客户端
- **SQLite** - 数据库（可扩展）

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Element Plus** - Vue 3 UI 组件库
- **Axios** - HTTP 客户端

## API 文档

### 配置 API

#### POST /api/config/load
加载配置文件

**请求体：**
```json
{
  "url": "http://example.com/config.json"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "spider": "...",
    "sites": [...]
  }
}
```

### 搜索 API

#### POST /api/search
搜索视频

**请求体：**
```json
{
  "keyword": "仙逆",
  "quickSearch": false,
  "timeout": 15000,
  "concurrency": 5
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "keyword": "仙逆",
    "totalSites": 36,
    "successSites": 5,
    "totalVideos": 6,
    "results": [...]
  }
}
```

### 播放 API

#### POST /api/player/info
获取播放信息

**请求体：**
```json
{
  "siteKey": "玩偶",
  "siteName": "👽玩偶哥哥┃4K弹幕",
  "videoId": "1",
  "videoName": "仙逆"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "videoName": "仙逆",
    "sources": [
      {
        "name": "线路1-极速",
        "episodes": [
          {
            "name": "第1集",
            "url": "https://example.com/01.m3u8",
            "isM3U8": true
          }
        ]
      }
    ]
  }
}
```

## 扩展功能

### 可扩展的功能

1. **数据库存储**
   - 使用 SQLite 存储配置、搜索历史等
   - 实现数据持久化

2. **用户系统**
   - 添加用户认证
   - 实现收藏、历史记录功能

3. **播放器集成**
   - 集成视频播放器（如 Video.js）
   - 支持在线播放

4. **高级搜索**
   - 支持筛选、排序
   - 支持多条件搜索

5. **配置管理**
   - 支持多配置源
   - 配置切换功能

## 注意事项

1. **跨域配置**
   - 后端已配置 CORS，允许前端访问
   - 前端使用代理转发 API 请求

2. **模拟数据**
   - 当前搜索和播放功能使用模拟数据
   - 实际使用需要连接 TVBox 本地服务器

3. **性能优化**
   - 搜索支持并发控制
   - 可调整超时时间和并发数

## 许可证

MIT
