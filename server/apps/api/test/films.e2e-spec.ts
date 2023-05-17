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

// ДОБАВИТЬ ТЕСТЫ!!!

describe('Films e2e', () => {
  let app: INestApplication;
  let userPoolClient: PoolClient;
  let socialPoolClient: PoolClient;

  let user;
  let queryName;
  let genreUpdateData;
  let genreOldData;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());

    await app.init();

    userPoolClient = await usersPool.connect();
    socialPoolClient = await socialPool.connect();

    // Инициализируем сервер
    await request(app.getHttpServer()).get('/init').expect(200);

    // получаем токены админа
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: process.env.OWNER_MAIL,
        password: process.env.OWNER_PASSWORD,
      })
      .expect((response: request.Response) => {
        user = response.body;
      });
    // .expect((resp: any) => {
    // console.log(`resp: ${JSON.stringify(resp)}`);
    // ownerAccess = JSON.parse(resp.text).token;
    // });

    genreUpdateData = {
      genreNameRu: 'тест',
      genreNameEng: 'test',
    };
    genreOldData = {
      genreNameRu: 'криминал',
      genreNameEng: 'crime',
    };
  });

  it('/GET all movies 200', async () => {
    return await request(app.getHttpServer())
      .get('/movies')
      .expect(HttpStatus.OK);
  });

  it('/GET query film search', async () => {
    return await request(app.getHttpServer())
      .get('/movies')
      .query({ name: 'аватар', size: 2 })
      .expect((response: request.Response) => {
        queryName = response.body;
        expect(queryName.rows[0].nameRu).toBe('Аватар');
        expect(queryName.count).toBe(3);
        expect(queryName.rows.length).toBe(2);
      })
      .expect(HttpStatus.OK);
  });

  it('/GET get bad req, res empty array', async () => {
    return await request(app.getHttpServer())
      .get('/movies')
      .query({ name: 'asdasdasd', size: 2 })
      .expect((response: request.Response) => {
        queryName = response.body;
        expect(queryName.count).toBe(0);
      });
  });

  it('/GET get film by id', async () => {
    return await request(app.getHttpServer())
      .get('/movies/about/251733')
      .expect((response: request.Response) => {
        queryName = response.body;
        expect(queryName.film.kinopoiskId).toBe(251733);
      })
      .expect(HttpStatus.OK);
  });

  it('/GET bad req, res error', async () => {
    return await request(app.getHttpServer())
      .get('/movies/about/1')
      .expect((response: request.Response) => {
        queryName = response.body;
        expect(queryName.status).toBe(404);
      })
      .expect(HttpStatus.OK);
  });

  it('/GET films by filter', async () => {
    return await request(app.getHttpServer())
      .get('/movies/filters')
      .query({ page: 0, size: 4, genreId: 1, DIRECTOR: 7640, ACTOR: 7640 })
      .expect((response: request.Response) => {
        queryName = response.body;
        expect(queryName.count).toBe(5);
        expect(queryName.rows.length).toBe(4);
        expect(queryName.rows[0].nameRu).toBe('Криминальное чтиво');
        expect(queryName.rows[0].genres[0].genreNameRu).toBe('криминал');
      })
      .expect(HttpStatus.OK);
  });

  it('/GET get all genres', async () => {
    return await request(app.getHttpServer())
      .get('/movies/genres')
      .expect((response: request.Response) => {
        queryName = response.body;
        expect(queryName.length).toBe(26);
      })
      .expect(HttpStatus.OK);
  });

  it('/POST update genre bu id', async () => {
    const acessToken = `Bearer ${user.token}`;
    return await request(app.getHttpServer())
      .post('/movies/genres/1')
      .set('authorization', acessToken)
      .send(genreUpdateData)
      .expect((response: request.Response) => {
        queryName = response.body;
        expect(queryName.genreNameRu).toBe('тест');
        expect(queryName.genreNameEng).toBe('test');
      })
      .expect(HttpStatus.CREATED);
  });

  afterAll(async () => {
    try {
      const acessToken = `Bearer ${user.token}`;
      await request(app.getHttpServer())
        .post('/movies/genres/1')
        .set('authorization', acessToken)
        .send(genreOldData);
    } catch {
      console.log(
        '\n\n[api][films.e2e]Не смог сгенерировать старые данные для фильмов!\n\n',
      );
    } finally {
      // Чистим таблицы
      await userPoolClient.query('TRUNCATE users RESTART IDENTITY CASCADE');
      await userPoolClient.query('TRUNCATE roles RESTART IDENTITY CASCADE');
      await userPoolClient.query('TRUNCATE tokens RESTART IDENTITY CASCADE');
      await socialPoolClient.query(
        'TRUNCATE profiles RESTART IDENTITY CASCADE',
      );

      // console.log(queryResult.rows);

      userPoolClient.release(true);
      socialPoolClient.release(true);
      await usersPool.end();
      await socialPool.end();

      await app.close();
    }
  });
});
