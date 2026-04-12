# TVBox Frontend

TVBox Frontend 是基于 Vue 3 + Element Plus 的视频搜索和管理前端应用。

## 技术栈

- **框架**: Vue 3.5
- **UI 组件库**: Element Plus 2.9
- **状态管理**: Pinia 3.0
- **路由**: Vue Router 5.0
- **HTTP 客户端**: Axios
- **构建工具**: Vite 8.0
- **语言**: TypeScript 6.0

## 项目结构

```
src/
├── api/              # API 接口
│   ├── request.ts    # Axios 实例
│   ├── source.ts     # 数据源 API
│   ├── search.ts     # 搜索 API
│   └── player.ts     # 播放 API
├── stores/           # Pinia Store
│   ├── source.ts     # 数据源状态
│   └── search.ts     # 搜索状态
├── types/            # TypeScript 类型定义
│   └── index.ts
├── views/            # 视图组件
│   └── SearchView.vue
├── components/       # 公共组件
├── router/           # 路由配置
├── App.vue
└── main.ts
```

## 快速开始

### 1. 安装依赖

```bash
cd tv-box/frontend
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm run dev
```

### 3. 访问应用

浏览器打开: http://localhost:5173

## API 配置

API 基础路径配置在 `src/api/request.ts`:

```typescript
const instance: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  timeout: 30000,
})
```

如果后端地址不同，请修改 `baseURL`。

## 功能模块

### 1. 数据源管理
- 数据源列表展示
- 启用/禁用数据源
- 上传配置文件
- 测试连接

### 2. 视频搜索
- 关键词搜索
- 多数据源并发搜索
- 搜索历史
- 结果展示

### 3. 视频详情
- 详情展示
- 剧集列表
- 多线路选择

### 4. 播放功能
- 播放地址解析
- 播放记录
- 收藏管理

## 开发指南

### 添加新页面

1. 在 `src/views/` 创建 Vue 组件
2. 在 `src/router/index.ts` 添加路由
3. 在 `src/stores/` 创建状态管理（如需要）

### 添加新 API

1. 在 `src/types/index.ts` 定义类型
2. 在 `src/api/` 创建 API 模块
3. 在组件中调用

### 使用 Element Plus

```vue
<template>
  <el-button type="primary">按钮</el-button>
</template>
```

## 构建生产版本

```bash
pnpm run build
```

构建产物在 `dist/` 目录。

## 环境要求

- Node.js: ^20.19.0 || >=22.12.0
- pnpm: 最新版本

## 注意事项

- 确保后端服务已启动
- 检查 API 基础路径配置
- 开发时注意跨域问题（后端已配置 CORS）
