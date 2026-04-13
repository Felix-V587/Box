import { Test, type TestingModule } from '@nestjs/testing';
import { SourceService } from './source.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Source } from './source.entity';
import { SpiderService } from '../spider/spider.service';

describe('SourceService', () => {
  let service: SourceService;
  let repository: Repository<Source>;
  let spiderService: SpiderService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockSpiderService = {
    loadSpider: jest.fn(),
    execute: jest.fn(),
    unloadSpider: jest.fn(),
    isLoaded: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SourceService,
        {
          provide: getRepositoryToken(Source),
          useValue: mockRepository,
        },
        {
          provide: SpiderService,
          useValue: mockSpiderService,
        },
      ],
    }).compile();

    service = module.get<SourceService>(SourceService);
    repository = module.get<Repository<Source>>(getRepositoryToken(Source));
    spiderService = module.get<SpiderService>(SpiderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a source successfully', async () => {
      const dto = {
        sourceKey: 'test',
        sourceName: 'Test Source',
        sourceType: 0,
        status: 1,
      };

      const entity = { id: 1, ...dto } as Source;
      mockRepository.create.mockReturnValue(entity);
      mockRepository.save.mockResolvedValue(entity);

      const result = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });
  });

  describe('findAll', () => {
    it('should return paginated sources', async () => {
      const sources = [
        { id: 1, sourceKey: 'test1', sourceName: 'Test 1' },
        { id: 2, sourceKey: 'test2', sourceName: 'Test 2' },
      ] as Source[];

      mockRepository.findAndCount.mockResolvedValue([sources, 2]);

      const result = await service.findAll({ page: 1, pageSize: 20 });

      expect(result.list).toEqual(sources);
      expect(result.total).toBe(2);
    });
  });

  describe('update', () => {
    it('should update a source', async () => {
      const id = 1;
      const dto = { sourceName: 'Updated Name' };
      const existing = { id, sourceKey: 'test', sourceName: 'Test' } as Source;

      mockRepository.findOne.mockResolvedValue(existing);
      mockRepository.save.mockResolvedValue({ ...existing, ...dto });

      const result = await service.update(id, dto);

      expect(result.sourceName).toBe('Updated Name');
    });
  });

  describe('delete', () => {
    it('should delete a source', async () => {
      const id = 1;
      const source = { id, sourceKey: 'test', sourceType: 0 } as Source;

      mockRepository.findOne.mockResolvedValue(source);
      mockRepository.delete.mockResolvedValue(undefined);

      await service.delete(id);

      expect(mockRepository.delete).toHaveBeenCalledWith(id);
    });
  });
});
