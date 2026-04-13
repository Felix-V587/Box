import { request } from './request'
import type { Source, PageData } from '@/types'

// 数据源 API
export const sourceApi = {
  // 获取数据源列表
  getList(params?: { page?: number; pageSize?: number; status?: number; keyword?: string }) {
    return request.get<PageData<Source>>('/sources', { params })
  },

  // 获取所有启用的数据源
  getEnabled() {
    return request.get<Source[]>('/sources/enabled')
  },

  // 获取单个数据源
  getOne(id: number) {
    return request.get<Source>(`/sources/${id}`)
  },

  // 创建数据源
  create(data: Partial<Source>) {
    return request.post<Source>('/sources', data)
  },

  // 更新数据源
  update(id: number, data: Partial<Source>) {
    return request.put<Source>(`/sources/${id}`, data)
  },

  // 删除数据源
  delete(id: number) {
    return request.delete(`/sources/${id}`)
  },

  // 更新数据源状态
  updateStatus(id: number, status: number) {
    return request.put(`/sources/${id}/status`, { status })
  },

  // 测试数据源连接
  testConnection(id: number) {
    return request.get<{ success: boolean; message: string }>(`/sources/${id}/test`)
  },

  // 上传配置文件
  uploadConfig(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post<{
      sources: Partial<Source>[]
      loadedCount: number
      failedCount: number
    }>('/sources/config', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // 从URL解析配置
  parseFromUrl(url: string) {
    return request.post<{
      sources: Source[]
      loadedCount: number
      failedCount: number
    }>('/sources/parse-url', { url })
  },
}
