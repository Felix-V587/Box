import { request } from './request'
import { VodInfo, PlayResult, VodRecord, VodCollect, PageData } from '@/types'

// 详情 API
export const detailApi = {
  // 获取视频详情
  getDetail(sourceKey: string, vodId: string) {
    return request.get<VodInfo>('/detail', { params: { sourceKey, vodId } })
  },
}

// 播放 API
export const playerApi = {
  // 解析播放地址
  parsePlayUrl(data: { sourceKey: string; vodId: string; flag: string; url: string }) {
    return request.post<PlayResult>('/player/parse', data)
  },

  // 获取播放记录
  getRecords(params?: { page?: number; pageSize?: number }) {
    return request.get<PageData<VodRecord>>('/player/record', { params })
  },

  // 保存播放记录
  saveRecord(data: Partial<VodRecord>) {
    return request.post<VodRecord>('/player/record', data)
  },

  // 删除播放记录
  deleteRecord(id: number) {
    return request.delete(`/player/record/${id}`)
  },

  // 获取收藏列表
  getCollects(params?: { page?: number; pageSize?: number }) {
    return request.get<PageData<VodCollect>>('/player/collect', { params })
  },

  // 添加收藏
  addCollect(data: Partial<VodCollect>) {
    return request.post<VodCollect>('/player/collect', data)
  },

  // 取消收藏
  removeCollect(id: number) {
    return request.delete(`/player/collect/${id}`)
  },

  // 检查是否已收藏
  checkCollect(sourceKey: string, vodId: string) {
    return request.get<{ collected: boolean }>('/player/collect/check', {
      params: { sourceKey, vodId },
    })
  },
}
