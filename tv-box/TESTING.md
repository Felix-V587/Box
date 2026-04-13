# 测试指南

## 后端测试

### 单元测试

已创建以下单元测试文件：

1. **SourceService 测试** (`src/modules/source/source.service.spec.ts`)
   - 测试数据源创建
   - 测试分页查询
   - 测试更新操作
   - 测试删除操作

2. **SearchService 测试** (`src/modules/search/search.service.spec.ts`)
   - 测试搜索历史获取
   - 测试历史清空

### E2E 测试

已创建 E2E 测试文件 (`test/app.e2e-spec.ts`)：
- 测试数据源列表接口
- 测试搜索接口
- 测试详情接口

### 运行测试

```bash
# 运行单元测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:cov

# 运行 E2E 测试
npm run test:e2e

# 类型检查
npm run typecheck
```

## 前端测试

### 单元测试

已创建以下单元测试文件：

1. **SearchStore 测试** (`src/stores/search.spec.ts`)
   - 测试初始状态
   - 测试搜索功能

2. **SourceStore 测试** (`src/stores/source.spec.ts`)
   - 测试初始状态
   - 测试数据源获取
   - 测试状态更新

3. **API Request 测试** (`src/api/request.spec.ts`)
   - 测试 Axios 实例配置

### 运行测试

```bash
# 运行单元测试
npm run test:unit

# 类型检查
npm run type-check
```

## 测试覆盖范围

### 后端
- ✅ Source 模块 CRUD 操作
- ✅ Search 模块历史管理
- ✅ API 端点响应格式
- ✅ 错误处理

### 前端
- ✅ Pinia Store 状态管理
- ✅ API 请求配置
- ✅ 数据流处理

## 注意事项

1. **Mock 策略**
   - 后端使用 Jest mock 模拟 Repository
   - 前端使用 Vitest mock 模拟 API 调用

2. **测试环境**
   - 后端使用 Node.js 环境
   - 前端使用 jsdom 模拟浏览器环境

3. **类型安全**
   - 所有测试文件都使用 TypeScript
   - 使用类型断言确保类型安全

## 下一步

1. 运行所有测试确保通过
2. 检查测试覆盖率
3. 修复发现的类型错误
4. 添加更多边界情况测试
