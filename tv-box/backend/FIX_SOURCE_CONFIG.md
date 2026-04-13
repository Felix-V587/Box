# 数据源配置错误修复

## 问题描述

使用 curl 创建数据源时报错：
```bash
curl 'http://localhost:3000/api/v1/sources' \
  -H 'Content-Type: application/json' \
  --data-raw '{"sourceKey":"饭太硬","sourceName":"饭太硬","sourceType":1,"spiderType":"","sourceUrl":"http://www.饭太硬.com/tv","spiderContent":"","status":1}'
```

## 问题原因

DTO 中的 `spiderType` 字段使用了 `@IsIn(['jar', 'js', 'py'])` 验证器，但前端传的是空字符串 `""`，导致验证失败。

## 修复方案

移除 `spiderType` 字段的 `@IsIn` 验证，改为仅使用 `@IsOptional` 和 `@IsString`，允许空字符串。

### 修改文件

**tv-box/backend/src/modules/source/dto/source.dto.ts**

```typescript
// 修改前
@ApiPropertyOptional({ description: 'Spider 类型：jar/js/py' })
@IsOptional()
@IsString()
@IsIn(['jar', 'js', 'py'])
spiderType?: string;

// 修改后
@ApiPropertyOptional({ description: 'Spider 类型：jar/js/py' })
@IsOptional()
@IsString()
spiderType?: string;
```

## 验证修复

重启后端服务后，使用以下命令测试：

```bash
# 创建 JSON 类型数据源
curl -X POST 'http://localhost:3000/api/v1/sources' \
  -H 'Content-Type: application/json' \
  -d '{
    "sourceKey": "fantaiying",
    "sourceName": "饭太硬",
    "sourceType": 1,
    "sourceUrl": "http://www.饭太硬.com/tv",
    "status": 1
  }'

# 创建 Spider 类型数据源
curl -X POST 'http://localhost:3000/api/v1/sources' \
  -H 'Content-Type: application/json' \
  -d '{
    "sourceKey": "spider_test",
    "sourceName": "Spider测试",
    "sourceType": 3,
    "spiderType": "js",
    "spiderContent": "// Spider code here",
    "status": 1
  }'
```

## 注意事项

1. `spiderType` 字段仅在 `sourceType=3` (Spider类型) 时有意义
2. 对于其他类型的数据源，`spiderType` 可以为空
3. 前端应该根据 `sourceType` 动态显示/隐藏 `spiderType` 字段
