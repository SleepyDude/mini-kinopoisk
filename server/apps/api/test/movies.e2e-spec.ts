import * as dotenv from 'dotenv';

dotenv.config({ path: process.env.NODE_ENV_LOCAL });
dotenv.config({ path: process.env.NODE_ENV });

import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ApiModule } from '../src/api.module';

import * as cookieParser from 'cookie-parser';
import { usersPool } from './dbPools/userDb';
import { socialPool } from './dbPools/socialDb';
import { PoolClient } from 'pg';

describe('Films e2e', () => {
  let app: INestApplication;
  let userPoolClient: PoolClient;
  let socialPoolClient: PoolClient;

  let user;
  let genreUpdateData;
  let genreOldData;
  let filmUpdateData;

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

    genreUpdateData = {
      genreNameRu: 'тест',
      genreNameEng: 'test',
    };
    genreOldData = {
      genreNameRu: 'криминал',
      genreNameEng: 'crime',
    };
    filmUpdateData = {
      nameRu: 'AVATAR NEW',
    };
  });

  it('Get all movies, check default count, 200', async () => {
    return await request(app.getHttpServer())
      .get('/movies')
      .expect((response: request.Response) => {
        const body = response.body;
        expect(body.count).toBe(2621);
        expect(body.rows.length).toBe(10);
      })
      .expect(HttpStatus.OK);
  });

  it('Get all movies, check query, 200', async () => {
    return await request(app.getHttpServer())
      .get('/movies')
      .query({
        page: 0,
        size: 10,
        name: 'криминальное',
      })
      .expect((response: request.Response) => {
        const body = response.body;
        expect(body.rows[0].nameRu).toBe('Криминальное чтиво');
        expect(body.rows[0].genres).toBeDefined();
        expect(body.rows[0].countries).toBeDefined();
      })
      .expect(HttpStatus.OK);
  });

  it('Get query film search, check size, name, real count', async () => {
    return await request(app.getHttpServer())
      .get('/movies')
      .query({ name: 'аватар', size: 2 })
      .expect((response: request.Response) => {
        const body = response.body;
        expect(body.rows[0].nameRu).toBe('Аватар');
        expect(body.count).toBe(3);
        expect(body.rows.length).toBe(2);
      })
      .expect(HttpStatus.OK);
  });

  it('Get get bad req, res empty array', async () => {
    return await request(app.getHttpServer())
      .get('/movies')
      .query({ name: 'asdasdasd', size: 2 })
      .expect((response: request.Response) => {
        const body = response.body;
        expect(body.count).toBe(0);
      })
      .expect(HttpStatus.OK);
  });

  it('Get film by id, check fields', async () => {
    return await request(app.getHttpServer())
      .get('/movies/about/251733')
      .expect((response: request.Response) => {
        const body = response.body;
        expect(body.film.kinopoiskId).toBe(251733);
        expect(body.film.budget).toBeDefined();
        expect(body.film.countries).toBeDefined();
        expect(body.film.genres).toBeDefined();
        expect(body.film.similar).toBeDefined();
        expect(body.film.trailers).toBeDefined();
        expect(body.staff).toBeDefined();
        expect(body.reviews).toBeDefined();
      })
      .expect(HttpStatus.OK);
  });

  it('Get film by id, bad req, res error', async () => {
    return await request(app.getHttpServer())
      .get('/movies/about/1')
      .expect((response: request.Response) => {
        const body = response.body;
        expect(body.status).toBe(404);
      })
      .expect(HttpStatus.OK);
  });

  it('Get films by filter', async () => {
    return await request(app.getHttpServer())
      .get('/movies/filters')
      .query({ page: 0, size: 4, genreId: 1, DIRECTOR: 7640, ACTOR: 7640 })
      .expect((response: request.Response) => {
        const body = response.body;
        expect(body.count).toBe(5);
        expect(body.rows.length).toBe(4);
        expect(body.rows[0].nameRu).toBe('Криминальное чтиво');
        expect(body.rows[0].genres[0].genreNameRu).toBe('криминал');
      })
      .expect(HttpStatus.OK);
  });

  it('Get films autosagest', async () => {
    return await request(app.getHttpServer())
      .get('/movies/name')
      .query({ nameRu: 'аватар', size: 2 })
      .expect((response: request.Response) => {
        const body = response.body;
        expect(body.length).toBe(2);
        expect(body[0].nameRu).toBe('Аватар');
      })
      .expect(HttpStatus.OK);
  });

  it('Update film by id', async () => {
    const acessToken = `Bearer ${user.token}`;
    return await request(app.getHttpServer())
      .put('/movies/about/401152')
      .set('authorization', acessToken)
      .send(filmUpdateData)
      .expect((response: request.Response) => {
        const body = response.body;
        expect(body.nameRu).toBe('AVATAR NEW');
      })
      .expect(HttpStatus.OK);
  });

  it('Delete film by id', async () => {
    const acessToken = `Bearer ${user.token}`;
    return await request(app.getHttpServer())
      .delete('/movies/about/401152')
      .set('authorization', acessToken)
      .expect((response: request.Response) => {
        const body = response.body;
        expect(body).toStrictEqual({});
      })
      .expect(HttpStatus.OK);
  });

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
