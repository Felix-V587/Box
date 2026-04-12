# 错误诊断和修复指南

## 已修复的错误

### 1. DTO 拼写错误
**文件**: `src/modules/player/dto/player.dto.ts`
**错误**: 第 122 行 `pageS ize` 拼写错误
**修复**: 改为 `pageSize`

### 2. 搜索服务类型错误
**文件**: `src/modules/search/search.service.ts`
**错误**: `sourceKey: sourceKeys as any` 类型不匹配
**修复**: 使用 `sourceKeys.map(key => ({ sourceKey: key, status: 1 }))`

### 3. 搜索建议查询错误
**文件**: `src/modules/search/search.service.ts`
**错误**: `MoreThan(keyword)` 不适用于字符串搜索
**修复**: 改为 `Like(\`%${keyword}%\`)` 并添加 `Like` 导入

## 常见启动错误及解决方案

### 错误 1: 模块导入失败

**症状**:
```
Error: Cannot find module 'xxx'
```

**解决方案**:
```bash
cd tv-box/backend
npm install
```

### 错误 2: TypeScript 编译错误

**症状**:
```
Type 'xxx' is not assignable to type 'yyy'
```

**解决方案**:
1. 检查 tsconfig.json 配置
2. 确保所有依赖已安装
3. 重启 TypeScript 服务器

### 错误 3: 数据库连接错误

**症状**:
```
Error: SQLITE_CANTOPEN: unable to open database file
```

**解决方案**:
1. 确保 `data/` 目录存在
2. 检查 `.env` 中的 `DB_DATABASE` 路径
3. 确保有文件写入权限

### 错误 4: 端口占用

**症状**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案**:
1. 修改 `.env` 中的 `PORT` 为其他端口
2. 或关闭占用 3000 端口的进程

### 错误 5: 装饰器错误

**症状**:
```
Error: Unable to resolve signature of property decorator
```

**解决方案**:
1. 确保 `tsconfig.json` 中 `experimentalDecorators: true`
2. 确保 `emitDecoratorMetadata: true`
3. 重启开发服务器

## 启动步骤

### 方法 1: 使用批处理脚本（Windows）
```bash
# 在项目根目录运行
start-backend.bat
```

### 方法 2: 手动启动
```bash
cd tv-box/backend

# 安装依赖（首次运行）
npm install

# 启动开发服务器
npm run start:dev
```

### 方法 3: 使用 pnpm（如果可用）
```bash
cd tv-box/backend
pnpm install
pnpm run start:dev
```

## 验证安装

### 1. 检查依赖
```bash
cd tv-box/backend
npm list --depth=0
```

应该看到以下核心依赖：
- @nestjs/common
- @nestjs/core
- @nestjs/typeorm
- typeorm
- better-sqlite3
- class-validator
- @nestjs/swagger

### 2. 检查 TypeScript 编译
```bash
cd tv-box/backend
npm run build
```

如果没有错误输出，说明编译成功。

### 3. 检查数据库
启动后应该自动创建 `data/tvbox.db` 文件。

## 调试技巧

### 1. 查看详细日志
修改 `.env`:
```
LOG_LEVEL=debug
```

### 2. 启用数据库日志
修改 `.env`:
```
DB_LOGGING=true
```

### 3. 检查 API 文档
启动后访问: http://localhost:3000/api-docs

如果能看到 Swagger 文档，说明服务启动成功。

## 如果仍然无法启动

请提供以下信息：
1. 完整的错误日志
2. Node.js 版本 (`node -v`)
3. npm 版本 (`npm -v`)
4. 操作系统版本
5. `package.json` 内容

## 联系支持

如果以上方法都无法解决问题，请：
1. 检查 GitHub Issues
2. 提交新的 Issue 并附上错误日志
