import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSearchStore } from './search'

// Mock API
vi.mock('@/api', () => ({
  searchApi: {
    search: vi.fn(),
    getHistory: vi.fn(),
    clearHistory: vi.fn(),
  },
}))

describe('SearchStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should have initial state', () => {
    const store = useSearchStore()
    
    expect(store.keyword).toBe('')
    expect(store.results).toEqual([])
    expect(store.history).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.total).toBe(0)
    expect(store.searchTime).toBe(0)
  })

  it('should update keyword after search', async () => {
    const store = useSearchStore()
    const { searchApi } = await import('@/api')
    
    vi.mocked(searchApi.search).mockResolvedValue({
      code: 200,
      message: 'success',
      data: {
        list: [],
        total: 0,
        page: 1,
        pageSize: 20,
        searchTime: 100,
      },
      timestamp: Date.now(),
    })

    await store.search({ keyword: 'test' })
    
    expect(store.keyword).toBe('test')
  })
})
