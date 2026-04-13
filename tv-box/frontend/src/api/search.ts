import { request } from './request'
import type { SearchResult, SearchHistory } from '@/types'

// 搜索 API
export const searchApi = {
  // 执行搜索
  search(params: {
    keyword: string
    sources?: string[]
    quick?: boolean
    page?: number
    pageSize?: number
  }) {
    return request.post<SearchResult>('/search', params)
  },

  // 获取搜索历史
  getHistory(limit: number = 10) {
    return request.get<SearchHistory[]>('/search/history', { params: { limit } })
  },

  // 清空搜索历史
  clearHistory() {
    return request.delete('/search/history')
  },

  // 获取搜索建议
  getSuggestions(keyword: string, limit: number = 10) {
    return request.get<string[]>('/search/suggest', { params: { keyword, limit } })
  },
}
