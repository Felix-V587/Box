# 数据源配置解析问题排查

## 问题描述

从URL `http://www.饭太硬.com/tv` 导入配置时失败，提示：
```
Failed to parse config from URL: Failed to decode data with all methods
```

## 排查步骤

### 1. 手动测试接口

运行深度分析脚本：
```bash
cd tv-box/backend
node deep-analyze.js
```

这个脚本会：
- 获取原始数据
- 尝试多种解码方式
- 保存中间结果到文件
- 输出详细的分析日志

### 2. 检查生成的文件

脚本会生成以下文件：
- `source-raw.bin` - 原始数据
- `decoded-json.json` - 成功解析的JSON（如果成功）
- `source-gzip.bin` - GZIP解压后的数据
- `source-base64.bin` - Base64解码后的数据
- `source-base64-gzip.bin` - Base64+GZIP解码后的数据

### 3. 使用十六进制编辑器分析

如果自动解码都失败，可以使用十六进制编辑器打开 `source-raw.bin`：
- 查看文件头，识别文件类型
- 查找特定字符串（如 "video", "spider", "http"）
- 分析数据结构

### 4. 可能的原因

1. **数据加密**：使用了非标准的加密算法
   - AES加密
   - 自定义加密算法
   - 需要密钥解密

2. **数据压缩**：使用了非标准的压缩格式
   - LZMA压缩
   - Brotli压缩
   - 自定义压缩算法

3. **数据格式**：不是JSON格式
   - XML格式
   - 二进制格式
   - 自定义格式

4. **访问限制**：
   - 需要特定的User-Agent
   - 需要认证token
   - IP限制

## 解决方案

### 方案1：手动获取配置

1. 使用浏览器访问URL
2. 查看返回的数据
3. 如果是加密的，尝试找到解密方法
4. 手动创建JSON配置文件
5. 使用"导入配置文件"功能上传

### 方案2：修改解码逻辑

根据 `deep-analyze.js` 的输出结果，修改后端解码逻辑：

1. 如果发现特定的文件头，添加对应的解码方法
2. 如果发现数据在特定位置，添加提取逻辑
3. 如果发现需要解密，添加解密逻辑

### 方案3：使用Spider

如果配置确实加密，可以：
1. 创建一个Spider来处理这个数据源
2. Spider中实现解密逻辑
3. 使用Spider的homeContent方法返回解析后的数据

## 临时解决方案

### 手动创建配置文件

根据TVBox标准格式创建配置文件：

```json
{
  "video": [
    {
      "key": "饭太硬",
      "name": "饭太硬",
      "type": 0,
      "url": "http://www.饭太硬.com/tv"
    }
  ]
}
```

保存为 `config.json`，然后在前端使用"导入配置文件"功能上传。

## 下一步

1. 运行 `node deep-analyze.js` 查看详细分析结果
2. 根据分析结果确定数据格式
3. 如果需要，添加自定义解码逻辑
4. 或者使用手动配置方式

## 联系支持

如果以上方法都无法解决，请提供：
- `deep-analyze.js` 的完整输出
- `source-raw.bin` 文件（前1000字节即可）
- 数据源的说明文档（如果有）

这将帮助分析具体的数据格式和解码方法。
