# 数据源配置功能

## 功能概述

前端已添加完整的数据源管理功能，包括：

### 1. 数据源列表
- 查看所有数据源
- 分页显示
- 状态切换（启用/禁用）
- 类型标识（XML/JSON/Spider/扩展）

### 2. 数据源操作
- **添加数据源**：点击"添加数据源"按钮
- **编辑数据源**：点击"编辑"按钮修改配置
- **删除数据源**：点击"删除"按钮移除数据源
- **测试连接**：点击"测试"按钮验证数据源可用性
- **导入配置**：上传 JSON/TXT 配置文件批量导入

### 3. 数据源类型

#### XML 类型 (sourceType=0)
- 传统 XML API 数据源
- 需要配置 URL

#### JSON 类型 (sourceType=1)
- JSON API 数据源
- 需要配置 URL

#### Spider 类型 (sourceType=3)
- 自定义 Spider 数据源
- 支持 JAR/JavaScript/Python 三种类型
- 需要配置 Spider 代码

#### 扩展类型 (sourceType=4)
- 扩展数据源
- 支持自定义逻辑

## 页面导航

访问 http://localhost:5173/sources 进入数据源管理页面

## 配置文件格式

支持导入 JSON 格式的配置文件，格式如下：

```json
[
  {
    "sourceKey": "example1",
    "sourceName": "示例数据源1",
    "sourceType": 0,
    "sourceUrl": "https://example.com/api.xml",
    "status": 1
  },
  {
    "sourceKey": "example2",
    "sourceName": "Spider示例",
    "sourceType": 3,
    "spiderType": "js",
    "spiderContent": "// Spider代码",
    "status": 1
  }
]
```

## API 接口

数据源管理使用以下 API：

- `GET /api/v1/sources` - 获取数据源列表
- `GET /api/v1/sources/:id` - 获取单个数据源
- `POST /api/v1/sources` - 创建数据源
- `PUT /api/v1/sources/:id` - 更新数据源
- `DELETE /api/v1/sources/:id` - 删除数据源
- `PUT /api/v1/sources/:id/status` - 更新状态
- `GET /api/v1/sources/:id/test` - 测试连接
- `POST /api/v1/sources/config` - 上传配置文件

## 使用流程

1. **添加数据源**
   - 点击"添加数据源"按钮
   - 填写表单信息
   - 选择数据源类型
   - 配置 URL 或 Spider 代码
   - 点击"确定"保存

2. **测试数据源**
   - 在列表中找到目标数据源
   - 点击"测试"按钮
   - 查看测试结果

3. **启用/禁用数据源**
   - 直接切换状态开关
   - 状态会自动保存

4. **批量导入**
   - 准备 JSON 配置文件
   - 点击"导入配置文件"按钮
   - 选择文件上传
   - 查看导入结果

## 注意事项

1. 数据源标识（sourceKey）必须唯一
2. Spider 类型需要配置完整的 Spider 代码
3. 测试连接会实际调用数据源接口
4. 删除操作不可恢复，请谨慎操作
