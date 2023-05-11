import * as dotenv from 'dotenv';

dotenv.config({ path: process.env.NODE_ENV_LOCAL });
dotenv.config({ path: process.env.NODE_ENV });

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ApiModule } from '../src/api.module';

import { usersPool } from './userDb';
import { PoolClient } from 'pg';
import { validateRefresh } from './validators/token.validator';

import * as cookieParser from 'cookie-parser';
import { socialPool } from './socialDb';
import { Profile } from '@hotels2023nestjs/shared';

// Регистрирует пользователя, задает его имя в профиле
async function processUser(
  app: INestApplication,
  name: string,
): Promise<string> {
  const email = `${name.toLowerCase()}@mail.ru`;
  // Регистрацияs
  await request(app.getHttpServer())
    .post('/auth/registration')
    .send({
      email: email,
      password: '123456',
    })
    .expect(201);

  // Получение токена
  let accessToken = undefined;
  await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email: email,
      password: '123456',
    })
    .expect(201)
    .expect((resp: any) => {
      accessToken = JSON.parse(resp.text).token;
    });

  // Получение профиля
  const profile = JSON.parse(
    (
      await request(app.getHttpServer())
        .get('/profiles/me')
        .auth(accessToken, { type: 'bearer' })
        .expect(200)
    ).text,
  ) as Profile;

  // Изменение имени в профиле
  await request(app.getHttpServer())
    .put(`/profiles/${profile.id}`)
    .auth(accessToken, { type: 'bearer' })
    .send({
      username: name,
    })
    .expect(200);

  return accessToken;
}

describe('Reviews e2e', () => {
  let app: INestApplication;
  let userPoolClient: PoolClient;
  let socialPoolClient: PoolClient;

  let ownerAccess: string; // OWNER

  let bobAccess: string;
  let aliceAccess: string;

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

    // получаем токен админа
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: process.env.OWNER_MAIL,
        password: process.env.OWNER_PASSWORD,
      })
      .expect((resp: any) => {
        ownerAccess = JSON.parse(resp.text).token;
      });
  });

  it('Регистрируем пару пользователей', async () => {
    // Регистрируем пару пользователей
    bobAccess = await processUser(app, 'Bob');
    aliceAccess = await processUser(app, 'Alice');
    // console.log(`get access tokens: \n\n${bobAccess}\n\n${aliceAccess}\n\n`);
  });

  // DTO:
  // film_id: number;
  // parent_id: number;
  // title: string;
  // text: string;
  // parentPath: string;
  describe('Создание отзыва к фильму', () => {
    it('Error 400 | Обязательные поля - film_id, text', async () => {
      await request(app.getHttpServer())
        .post('/reviews')
        .auth(bobAccess, { type: 'bearer' })
        .send({})
        .expect(400);
      await request(app.getHttpServer())
        .post('/reviews')
        .auth(bobAccess, { type: 'bearer' })
        .send({ film_id: 28 })
        .expect(400);
      await request(app.getHttpServer())
        .post('/reviews')
        .auth(bobAccess, { type: 'bearer' })
        .send({ text: 'abc' })
        .expect(400);
    });

    it('Success 201 | Создание 1го ревью с минимальными полями - film_id, text', async () => {
      const review = await request(app.getHttpServer())
        .post('/reviews')
        .auth(bobAccess, { type: 'bearer' })
        .send({ text: 'abc', film_id: 28 })
        .expect(201)
        .expect((resp: any) => {
          console.log(`[1st review] ${resp.text}`);
        });
    });
  });

  afterAll(async () => {
    // Чистим таблицы
    await userPoolClient.query('TRUNCATE users RESTART IDENTITY CASCADE');
    await userPoolClient.query('TRUNCATE roles RESTART IDENTITY CASCADE');
    await userPoolClient.query('TRUNCATE tokens RESTART IDENTITY CASCADE');
    await socialPoolClient.query('TRUNCATE profiles RESTART IDENTITY CASCADE');
    await socialPoolClient.query('TRUNCATE reviews RESTART IDENTITY CASCADE');

    // console.log(queryResult.rows);

    userPoolClient.release(true);
    socialPoolClient.release(true);
    await usersPool.end();
    await socialPool.end();

    await app.close();
  }, 6000);
});
