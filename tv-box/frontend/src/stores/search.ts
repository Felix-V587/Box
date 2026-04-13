import { defineStore } from 'pinia'
import { ref } from 'vue'
import { searchApi } from '@/api'
import type { SearchResult, SearchHistory, SearchResultItem } from '@/types'

export const useSearchStore = defineStore('search', () => {
  const keyword = ref('')
  const results = ref<SearchResultItem[]>([])
  const history = ref<SearchHistory[]>([])
  const loading = ref(false)
  const total = ref(0)
  const searchTime = ref(0)

  // 执行搜索
  const search = async (params: {
    keyword: string
    sources?: string[]
    quick?: boolean
    page?: number
    pageSize?: number
  }) => {
    loading.value = true
    keyword.value = params.keyword
    try {
      const res = await searchApi.search(params)
      results.value = res.data.list
      total.value = res.data.total
      searchTime.value = res.data.searchTime
      return res.data
    } catch (error) {
      console.error('Search failed:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取搜索历史
  const fetchHistory = async (limit: number = 10) => {
    try {
      const res = await searchApi.getHistory(limit)
      history.value = res.data
      return res.data
    } catch (error) {
      console.error('Failed to fetch history:', error)
      throw error
    }
  }

  // 清空搜索历史
  const clearHistory = async () => {
    try {
      await searchApi.clearHistory()
      history.value = []
    } catch (error) {
      console.error('Failed to clear history:', error)
      throw error
    }
  }

  return {
    keyword,
    results,
    history,
    loading,
    total,
    searchTime,
    search,
    fetchHistory,
    clearHistory,
  }
})
