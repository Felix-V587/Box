import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}))

describe('API Request', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create axios instance with correct config', async () => {
    const { default: instance } = await import('./request')
    
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:3000/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  })
})
