import * as dotenv from 'dotenv';
import { PoolClient } from 'pg';

dotenv.config({ path: process.env.NODE_ENV_LOCAL });
dotenv.config({ path: process.env.NODE_ENV });

import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ApiModule } from '../src/api.module';
import * as cookieParser from 'cookie-parser';
import { usersPool } from './dbPools/userDb';
import { socialPool } from './dbPools/socialDb';

describe('films-genres e2e tests', () => {
  let app: INestApplication;
  let userPoolClient: PoolClient;
  let socialPoolClient: PoolClient;

  let user;
  let countryUpdateData;
  let countryOldData;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());

    await app.init();

    userPoolClient = await usersPool.connect();
    socialPoolClient = await socialPool.connect();

    await request(app.getHttpServer()).get('/init').expect(200);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: process.env.OWNER_MAIL,
        password: process.env.OWNER_PASSWORD,
      })
      .expect((response: request.Response) => {
        user = response.body;
      });

    countryUpdateData = {
      countryNameRu: 'тест',
      countryNameEng: 'test',
    };
    countryOldData = {
      countryNameRu: 'Франция',
      countryNameEng: 'France',
    };
  });

  it('Get all countries', async () => {
    return await request(app.getHttpServer())
      .get('/movies/countries')
      .expect((response: request.Response) => {
        const body = response.body;
        expect(body.length).toBe(69);
      })
      .expect(HttpStatus.OK);
  });

  it('Get country by id', async () => {
    return await request(app.getHttpServer())
      .get('/movies/countries/3')
      .expect((response: request.Response) => {
        const body = response.body;
        expect(body.countryNameRu).toBe('Франция');
      })
      .expect(HttpStatus.OK);
  });

  it('Update country by id', async () => {
    const acessToken = `Bearer ${user.token}`;
    return await request(app.getHttpServer())
      .put('/movies/countries/3')
      .set('authorization', acessToken)
      .send(countryUpdateData)
      .expect((response: request.Response) => {
        const body = response.body;
        expect(body.countryNameRu).toBe('тест');
      })
      .expect(HttpStatus.OK);
  });

  it('Set the old value', async () => {
    const acessToken = `Bearer ${user.token}`;
    return await request(app.getHttpServer())
      .put('/movies/countries/3')
      .set('authorization', acessToken)
      .send(countryOldData)
      .expect((response: request.Response) => {
        const body = response.body;
        expect(body.countryNameRu).toBe('Франция');
      })
      .expect(HttpStatus.OK);
  });

  // it('Delete country by id', async () => {
  //   const acessToken = `Bearer ${user.token}`;
  //   return await request(app.getHttpServer())
  //     .delete('/movies/countries/3')
  //     .set('authorization', acessToken)
  //     .expect((response: request.Response) => {
  //       const body = response.body;
  //       expect(body).toStrictEqual({});
  //     })
  //     .expect(HttpStatus.OK);
  // });

  afterAll(async () => {
    await userPoolClient.query('TRUNCATE users RESTART IDENTITY CASCADE');
    await userPoolClient.query('TRUNCATE roles RESTART IDENTITY CASCADE');
    await userPoolClient.query('TRUNCATE tokens RESTART IDENTITY CASCADE');
    await socialPoolClient.query('TRUNCATE profiles RESTART IDENTITY CASCADE');

    userPoolClient.release(true);
    socialPoolClient.release(true);

    await usersPool.end();
    await socialPool.end();

    await app.close();
  });
});
