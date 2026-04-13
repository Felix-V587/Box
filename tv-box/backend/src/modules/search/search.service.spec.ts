import { Test, type TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { SearchHistory } from './search-history.entity';
import { Source } from '../source/source.entity';
import { SpiderService } from '../spider/spider.service';
import { ConfigService } from '@nestjs/config';

describe('SearchService', () => {
  let service: SearchService;
  let historyRepository: Repository<SearchHistory>;
  let sourceRepository: Repository<Source>;

  const mockHistoryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
  };

  const mockSourceRepository = {
    find: jest.fn(),
  };

  const mockSpiderService = {
    execute: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(10000),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: getRepositoryToken(SearchHistory),
          useValue: mockHistoryRepository,
        },
        {
          provide: getRepositoryToken(Source),
          useValue: mockSourceRepository,
        },
        {
          provide: SpiderService,
          useValue: mockSpiderService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    historyRepository = module.get<Repository<SearchHistory>>(
      getRepositoryToken(SearchHistory),
    );
    sourceRepository = module.get<Repository<Source>>(getRepositoryToken(Source));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getHistory', () => {
    it('should return search history', async () => {
      const histories = [
        { id: 1, keyword: 'test1', searchTime: new Date() },
        { id: 2, keyword: 'test2', searchTime: new Date() },
      ] as SearchHistory[];

      mockHistoryRepository.find.mockResolvedValue(histories);

      const result = await service.getHistory({ limit: 10 });

      expect(result).toHaveLength(2);
      expect(result[0].keyword).toBe('test1');
    });
  });

  describe('clearHistory', () => {
    it('should clear all history', async () => {
      mockHistoryRepository.clear.mockResolvedValue(undefined);

      await service.clearHistory();

      expect(mockHistoryRepository.clear).toHaveBeenCalled();
    });
  });
});
