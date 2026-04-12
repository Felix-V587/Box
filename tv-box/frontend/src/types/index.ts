// API 响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

// 分页数据
export interface PageData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 数据源
export interface Source {
  id: number
  sourceKey: string
  sourceName: string
  sourceType: number
  sourceUrl?: string
  spiderType?: string
  spiderContent?: string
  status: number
  sort: number
  ext?: string
  createTime: Date
  updateTime: Date
}

// 搜索结果项
export interface SearchResultItem {
  vodId: string
  vodName: string
  vodPic?: string
  vodRemarks?: string
  sourceKey: string
  sourceName: string
}

// 搜索结果
export interface SearchResult {
  list: SearchResultItem[]
  total: number
  page: number
  pageSize: number
  searchTime: number
}

// 搜索历史
export interface SearchHistory {
  id: number
  keyword: string
  searchTime: Date
  resultCount?: number
}

// 剧集信息
export interface Episode {
  name: string
  url: string
}

// 线路信息
export interface Series {
  name: string
  episodes: Episode[]
}

// 视频详情
export interface VodInfo {
  vodId: string
  vodName: string
  vodPic?: string
  vodRemarks?: string
  vodContent?: string
  vodDirector?: string
  vodActor?: string
  vodArea?: string
  vodYear?: string
  vodPlayFrom?: string
  vodPlayUrl?: string
  series?: Series[]
}

// 播放结果
export interface PlayResult {
  url: string
  header?: Record<string, string>
  parse?: number
  jxFrom?: string
}

// 播放记录
export interface VodRecord {
  id: number
  vodName: string
  vodPic?: string
  sourceKey: string
  vodId: string
  episodeIndex?: number
  playPosition?: number
  duration?: number
  createTime: Date
  updateTime: Date
}

// 收藏记录
export interface VodCollect {
  id: number
  vodName: string
  vodPic?: string
  sourceKey: string
  vodId: string
  vodRemarks?: string
  collectTime: Date
}
