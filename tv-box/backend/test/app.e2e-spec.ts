import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/sources (GET)', () => {
    it('should return sources list', () => {
      return request(app.getHttpServer())
        .get('/api/v1/sources')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('code');
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('list');
          expect(res.body.data).toHaveProperty('total');
        });
    });
  });

  describe('/api/v1/search (POST)', () => {
    it('should search videos', () => {
      return request(app.getHttpServer())
        .post('/api/v1/search')
        .send({ keyword: 'test', page: 1, pageSize: 20 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.data).toHaveProperty('list');
          expect(res.body.data).toHaveProperty('total');
          expect(res.body.data).toHaveProperty('searchTime');
        });
    });

    it('should reject empty keyword', () => {
      return request(app.getHttpServer())
        .post('/api/v1/search')
        .send({ keyword: '', page: 1, pageSize: 20 })
        .expect(400);
    });
  });

  describe('/api/v1/detail (GET)', () => {
    it('should return video detail', () => {
      return request(app.getHttpServer())
        .get('/api/v1/detail')
        .query({ sourceKey: 'test', vodId: '123' })
        .expect(200);
    });
  });
});
