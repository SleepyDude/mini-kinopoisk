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

  it('get all persons, check count, limit', () => {
    return request(app.getHttpServer())
      .get('/persons')
      .expect((response: request.Response) => {
        query = response.body;
        expect(query.count).toBe(176001);
        expect(query.rows.length).toBe(10);
      })
      .expect(HttpStatus.OK);
  });

  it('get person by id, check name, id and defined films array', () => {
    return request(app.getHttpServer())
      .get('/persons/about/1')
      .expect((response: request.Response) => {
        query = response.body;
        expect(query.person.personId).toBe(1);
        expect(query.films).toBeDefined();
        expect(query.person.nameRu).toBe('Стивен Карпентер');
      })
      .expect(HttpStatus.OK);
  });

  it('get person by id bad req, check err message', () => {
    return request(app.getHttpServer())
      .get('/persons/about/999999')
      .expect((response: request.Response) => {
        expect(response.body.error).toBe('Такой айди не зарегистрирован');
      })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('get autosagest, check count array, length array, first name', () => {
    return request(app.getHttpServer())
      .get('/persons/search')
      .query({
        profession: 'режиссер',
        name: 'Грегори б',
      })
      .expect((response: request.Response) => {
        query = response.body;
        expect(query.count).toBe(3);
        expect(query.rows.length).toBe(3);
        expect(query.rows[0].nameRu).toBe('Грегори Баке');
      })
      .expect(HttpStatus.OK);
  });

  it('get autosagest, bad req, not found profession', () => {
    return request(app.getHttpServer())
      .get('/persons/search')
      .query({
        name: 'Грегори б',
      })
      .expect((response: request.Response) => {
        query = response.body;
        expect(query.error).toStrictEqual({
          profession: 'profession should not be null or undefined',
        });
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  afterAll(async () => {
    await app.close();
  });
});
