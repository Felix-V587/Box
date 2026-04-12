# TVBox Backend

TVBox Backend 是一个基于 NestJS + SQLite 的视频内容管理系统后端服务，提供数据源配置、多源并发搜索、视频详情查询、播放地址解析等功能。

## 功能特性

- ✅ **数据源管理**：支持 XML/JSON API 和 Spider（JS/Python）数据源
- ✅ **Spider 执行引擎**：支持 QuickJS、Python、HTTP API 三种 Spider 类型
- ✅ **多源并发搜索**：使用 Promise.allSettled 实现容错并发搜索
- ✅ **视频详情查询**：支持剧集解析、缓存管理
- ✅ **播放地址解析**：支持多线路播放、播放记录管理
- ✅ **收藏管理**：视频收藏功能
- ✅ **统一 API 文档**：Swagger 自动生成文档

## 技术栈

- **框架**：NestJS 11.x
- **语言**：TypeScript 6.x
- **数据库**：SQLite (better-sqlite3)
- **ORM**：TypeORM 0.3.x
- **Spider 执行**：QuickJS、Python Shell
- **API 文档**：Swagger

## 项目结构

```
tv-box/backend/
├── src/
│   ├── common/              # 公共模块
│   │   ├── dto/             # DTO
│   │   ├── entities/        # 实体
│   │   ├── exceptions/      # 异常
│   │   ├── filters/         # 过滤器
│   │   ├── interceptors/    # 拦截器
│   │   └── interfaces/      # 接口
│   ├── config/              # 配置
│   ├── modules/             # 业务模块
│   │   ├── spider/          # Spider 模块
│   │   ├── source/          # 数据源模块
│   │   ├── search/          # 搜索模块
│   │   ├── detail/          # 详情模块
│   │   └── player/          # 播放模块
│   ├── app.module.ts
│   └── main.ts
├── data/                    # 数据库文件
├── .env                     # 环境变量
└── package.json
```

## 快速开始

### 1. 安装依赖

```bash
cd tv-box/backend
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

### 3. 启动开发服务器

```bash
npm run start:dev
```

### 4. 访问 API 文档

浏览器打开：http://localhost:3000/api-docs

## API 接口

### 数据源管理

- `POST /api/v1/sources/config` - 上传并解析配置文件
- `GET /api/v1/sources` - 获取数据源列表
- `GET /api/v1/sources/:id` - 获取数据源详情
- `PUT /api/v1/sources/:id` - 更新数据源
- `DELETE /api/v1/sources/:id` - 删除数据源
- `PUT /api/v1/sources/:id/status` - 启用/禁用数据源
- `GET /api/v1/sources/:id/test` - 测试数据源连接

### 搜索

- `POST /api/v1/search` - 执行搜索
- `GET /api/v1/search/history` - 获取搜索历史
- `DELETE /api/v1/search/history` - 清空搜索历史
- `GET /api/v1/search/suggest` - 获取搜索建议

### 详情

- `GET /api/v1/detail` - 获取视频详情

### 播放

- `POST /api/v1/player/parse` - 解析播放地址
- `GET /api/v1/player/record` - 获取播放记录
- `POST /api/v1/player/record` - 保存播放记录
- `GET /api/v1/player/collect` - 获取收藏列表
- `POST /api/v1/player/collect` - 添加收藏
- `DELETE /api/v1/player/collect/:id` - 取消收藏

## 数据库迁移

```bash
# 生成迁移
npm run migration:generate -- -n MigrationName

# 运行迁移
npm run migration:run

# 回滚迁移
npm run migration:revert
```

## 生产部署

### 构建

```bash
npm run build
```

### 启动

```bash
npm run start:prod
```

### Docker 部署

```bash
docker build -t tvbox-backend .
docker run -p 3000:3000 tvbox-backend
```

## 开发指南

### 添加新的 Spider 类型

1. 在 `src/modules/spider/adapters/` 创建新适配器
2. 实现 `Spider` 接口
3. 在 `SpiderService.createExecutor()` 中注册新类型

### 添加新的 API 接口

1. 在对应模块的 `dto/` 目录创建 DTO
2. 在 `*.service.ts` 实现业务逻辑
3. 在 `*.controller.ts` 添加控制器方法
4. 添加 Swagger 注解

## 注意事项

- QuickJS 沙箱需要安装 `quickjs-emscripten`
- Python Spider 需要安装 `python-shell` 和 Python 环境
- 生产环境建议关闭 `DB_SYNCHRONIZE`，使用数据库迁移
- Spider 执行有超时限制（默认 10 秒）

## 许可证

UNLICENSED
