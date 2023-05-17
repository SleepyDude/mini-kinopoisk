import * as dotenv from 'dotenv';

dotenv.config({ path: process.env.NODE_ENV_LOCAL });
dotenv.config({ path: process.env.NODE_ENV });

import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ApiModule } from '../src/api.module';

describe('Persons e2e', () => {
  let app: INestApplication;
  let query;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  it('get all persons', () => {
    return request(app.getHttpServer())
      .get('/persons')
      .expect((response: request.Response) => {
        query = response.body;
        expect(query.count).toBe(176001);
        expect(query.rows.length).toBe(10);
      })
      .expect(HttpStatus.OK);
  });

  it('get person by id', () => {
    return request(app.getHttpServer())
      .get('/persons/about/1')
      .expect((response: request.Response) => {
        query = response.body;
        expect(query.person.personId).toBe(1);
      })
      .expect(HttpStatus.OK);
  });

  it('get person by id bad req', () => {
    return request(app.getHttpServer())
      .get('/persons/about/999999')
      .expect(HttpStatus.NOT_FOUND);
  });

  it('get autosagest', () => {
    return request(app.getHttpServer())
      .get('/persons/search')
      .query({
        profession: 'режиссер',
        name: 'Грегори б',
      })
      .expect((response: request.Response) => {
        query = response.body;
        // console.log(`get query: ${JSON.stringify(query)}`);
        expect(query.count).toBe(3);
        expect(query.rows.length).toBe(3);
        expect(query.rows[0].nameRu).toBe('Грегори Балди');
      })
      .expect(HttpStatus.OK);
  });

  afterAll(async () => {
    await app.close();
  });
});
