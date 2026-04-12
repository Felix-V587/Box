import { defineStore } from 'pinia'
import { ref } from 'vue'
import { sourceApi } from '@/api'
import { Source } from '@/types'

export const useSourceStore = defineStore('source', () => {
  const sources = ref<Source[]>([])
  const loading = ref(false)
  const total = ref(0)

  // 获取数据源列表
  const fetchSources = async (params?: {
    page?: number
    pageSize?: number
    status?: number
    keyword?: string
  }) => {
    loading.value = true
    try {
      const res = await sourceApi.getList(params)
      sources.value = res.data.list
      total.value = res.data.total
      return res.data
    } catch (error) {
      console.error('Failed to fetch sources:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 更新数据源状态
  const updateStatus = async (id: number, status: number) => {
    try {
      await sourceApi.updateStatus(id, status)
      const source = sources.value.find((s) => s.id === id)
      if (source) {
        source.status = status
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      throw error
    }
  }

  // 删除数据源
  const deleteSource = async (id: number) => {
    try {
      await sourceApi.delete(id)
      sources.value = sources.value.filter((s) => s.id !== id)
      total.value--
    } catch (error) {
      console.error('Failed to delete source:', error)
      throw error
    }
  }

  return {
    sources,
    loading,
    total,
    fetchSources,
    updateStatus,
    deleteSource,
  }
})
