import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSourceStore } from './source'

// Mock API
vi.mock('@/api', () => ({
  sourceApi: {
    getList: vi.fn(),
    updateStatus: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('SourceStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should have initial state', () => {
    const store = useSourceStore()
    
    expect(store.sources).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.total).toBe(0)
  })

  it('should fetch sources', async () => {
    const store = useSourceStore()
    const { sourceApi } = await import('@/api')
    
    const mockSources = [
      { id: 1, sourceKey: 'test1', sourceName: 'Test 1' },
      { id: 2, sourceKey: 'test2', sourceName: 'Test 2' },
    ]
    
    vi.mocked(sourceApi.getList).mockResolvedValue({
      code: 200,
      message: 'success',
      data: {
        list: mockSources,
        total: 2,
        page: 1,
        pageSize: 20,
      },
      timestamp: Date.now(),
    })

    const result = await store.fetchSources()
    
    expect(store.sources).toEqual(mockSources)
    expect(store.total).toBe(2)
    expect(result.list).toHaveLength(2)
  })

  it('should update source status', async () => {
    const store = useSourceStore()
    const { sourceApi } = await import('@/api')
    
    // 先设置一些数据
    store.sources = [
      { id: 1, sourceKey: 'test', sourceName: 'Test', status: 1 } as any,
    ]
    
    vi.mocked(sourceApi.updateStatus).mockResolvedValue({
      code: 200,
      message: 'success',
      data: undefined as any,
      timestamp: Date.now(),
    })

    await store.updateStatus(1, 0)
    
    expect(store.sources[0].status).toBe(0)
  })
})
