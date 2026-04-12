# 调试指南

## 浏览器已打开

- **前端应用**: http://localhost:5173
- **后端 API 文档**: http://localhost:3000/api-docs

## 常见问题排查

### 1. 前端无法访问

**症状**: 浏览器显示"无法访问此网站"

**解决方案**:
```bash
# 检查前端是否启动
cd tv-box/frontend
pnpm run dev
```

### 2. API 请求失败

**症状**: 控制台显示 CORS 错误或网络错误

**检查步骤**:
1. 确认后端已启动: http://localhost:3000/api-docs
2. 检查 API 基础路径: `src/api/request.ts` 中的 `baseURL`
3. 查看浏览器控制台网络请求

### 3. Element Plus 组件未显示

**症状**: 页面空白或组件样式异常

**解决方案**:
```bash
# 重新安装依赖
cd tv-box/frontend
pnpm install
```

### 4. TypeScript 编译错误

**症状**: 控制台显示类型错误

**解决方案**:
```bash
# 检查类型
cd tv-box/frontend
pnpm run type-check
```

## 调试工具

### 1. Vue DevTools
- 安装 Vue DevTools 浏览器扩展
- 可以查看组件树、状态管理、路由等

### 2. 浏览器控制台
- 打开开发者工具 (F12)
- 查看 Console、Network、Application 标签

### 3. Network 标签
- 查看 API 请求和响应
- 检查请求状态码、响应时间
- 查看请求头和响应头

## 测试 API

### 使用 Swagger 文档
1. 访问: http://localhost:3000/api-docs
2. 点击任意 API 接口
3. 点击 "Try it out"
4. 输入参数并执行

### 测试搜索 API
```bash
curl -X POST http://localhost:3000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"keyword":"测试","page":1,"pageSize":20}'
```

## 日志查看

### 后端日志
- 查看终端输出
- 日志级别在 `.env` 中配置: `LOG_LEVEL=debug`

### 前端日志
- 浏览器控制台 Console 标签
- 使用 `console.log()` 调试

## 性能优化

### 1. 检查加载时间
- Network 标签查看资源加载时间
- 优化大图片、大文件

### 2. 检查内存使用
- Performance 标签录制性能
- 查看内存泄漏

### 3. 优化建议
- 使用懒加载路由
- 压缩图片资源
- 启用 Gzip 压缩

## 错误代码参考

| 状态码 | 说明 | 解决方案 |
|--------|------|----------|
| 200 | 成功 | 正常 |
| 400 | 请求参数错误 | 检查请求参数 |
| 401 | 未授权 | 添加认证 Token |
| 404 | 资源不存在 | 检查 URL 路径 |
| 500 | 服务器错误 | 查看后端日志 |

## 联系支持

如果遇到无法解决的问题：
1. 截图错误信息
2. 复制控制台日志
3. 描述复现步骤
4. 提交 Issue
