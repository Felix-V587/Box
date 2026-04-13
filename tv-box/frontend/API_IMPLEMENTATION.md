# 前端接口实现文档

## 已实现的接口

### 1. 数据源管理 API (sourceApi)

| 接口 | 方法 | 路径 | 功能 | 状态 |
|------|------|------|------|------|
| getList | GET | /sources | 获取数据源列表（分页） | ✅ |
| getEnabled | GET | /sources/enabled | 获取所有启用的数据源 | ✅ |
| getOne | GET | /sources/:id | 获取单个数据源详情 | ✅ |
| create | POST | /sources | 创建数据源 | ✅ |
| update | PUT | /sources/:id | 更新数据源 | ✅ |
| delete | DELETE | /sources/:id | 删除数据源 | ✅ |
| updateStatus | PUT | /sources/:id/status | 启用/禁用数据源 | ✅ |
| testConnection | GET | /sources/:id/test | 测试数据源连接 | ✅ |
| uploadConfig | POST | /sources/config | 上传配置文件 | ✅ |

### 2. 搜索 API (searchApi)

| 接口 | 方法 | 路径 | 功能 | 状态 |
|------|------|------|------|------|
| search | POST | /search | 执行搜索 | ✅ |
| getHistory | GET | /search/history | 获取搜索历史 | ✅ |
| clearHistory | DELETE | /search/history | 清空搜索历史 | ✅ |
| getSuggestions | GET | /search/suggest | 获取搜索建议 | ✅ |

### 3. 详情 API (detailApi)

| 接口 | 方法 | 路径 | 功能 | 状态 |
|------|------|------|------|------|
| getDetail | GET | /detail | 获取视频详情 | ✅ |

### 4. 播放 API (playerApi)

| 接口 | 方法 | 路径 | 功能 | 状态 |
|------|------|------|------|------|
| parsePlayUrl | POST | /player/parse | 解析播放地址 | ✅ |
| getRecords | GET | /player/record | 获取播放记录列表 | ✅ |
| saveRecord | POST | /player/record | 保存播放记录 | ✅ |
| deleteRecord | DELETE | /player/record/:id | 删除播放记录 | ✅ |
| getCollects | GET | /player/collect | 获取收藏列表 | ✅ |
| addCollect | POST | /player/collect | 添加收藏 | ✅ |
| removeCollect | DELETE | /player/collect/:id | 取消收藏 | ✅ |
| checkCollect | GET | /player/collect/check | 检查是否已收藏 | ✅ |

## 已实现的页面

### 1. 视频搜索页面 (SearchView.vue)
- 搜索框和搜索按钮
- 搜索历史展示
- 搜索结果列表（卡片展示）
- 点击跳转到详情页

### 2. 数据源管理页面 (SourceView.vue)
- 数据源列表（表格展示）
- 添加/编辑数据源对话框
- 状态切换开关
- 测试连接功能
- 配置文件上传导入
- 删除确认提示

### 3. 视频详情页面 (DetailView.vue)
- 视频基本信息展示
- 播放线路选择
- 剧集列表
- 播放功能
- 收藏/取消收藏

### 4. 播放记录页面 (RecordView.vue)
- 播放记录列表
- 继续播放功能
- 删除记录功能
- 分页展示

### 5. 收藏页面 (CollectView.vue)
- 收藏列表（卡片展示）
- 播放功能
- 取消收藏功能
- 分页展示

## 路由配置

| 路径 | 名称 | 组件 | 功能 |
|------|------|------|------|
| / | search | SearchView | 视频搜索 |
| /sources | sources | SourceView | 数据源管理 |
| /detail | detail | DetailView | 视频详情 |
| /record | record | RecordView | 播放记录 |
| /collect | collect | CollectView | 我的收藏 |

## 导航菜单

- 视频搜索 (Search 图标)
- 数据源管理 (Setting 图标)
- 播放记录 (VideoPlay 图标)
- 我的收藏 (Star 图标)

## 接口调用流程

### 搜索流程
1. 用户输入关键词
2. 调用 `searchApi.search()` 执行搜索
3. 展示搜索结果
4. 点击结果项跳转到详情页

### 详情流程
1. 从路由参数获取 `sourceKey` 和 `vodId`
2. 调用 `detailApi.getDetail()` 获取详情
3. 调用 `playerApi.checkCollect()` 检查收藏状态
4. 选择线路和剧集
5. 调用 `playerApi.parsePlayUrl()` 解析播放地址
6. 调用 `playerApi.saveRecord()` 保存播放记录
7. 跳转到播放页面

### 收藏流程
1. 点击收藏按钮
2. 调用 `playerApi.addCollect()` 添加收藏
3. 或调用 `playerApi.removeCollect()` 取消收藏
4. 更新收藏状态

### 数据源管理流程
1. 调用 `sourceApi.getList()` 获取列表
2. 添加/编辑：调用 `sourceApi.create()` 或 `sourceApi.update()`
3. 状态切换：调用 `sourceApi.updateStatus()`
4. 测试连接：调用 `sourceApi.testConnection()`
5. 删除：调用 `sourceApi.delete()`
6. 导入配置：调用 `sourceApi.uploadConfig()`

## 总结

✅ 所有后端接口已在前端实现
✅ 所有功能页面已创建完成
✅ 路由配置已完成
✅ 导航菜单已更新
✅ 接口调用流程已打通

前端已完整实现后端所有接口操作！
