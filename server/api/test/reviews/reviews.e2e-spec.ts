import * as dotenv from 'dotenv';

dotenv.config({ path: process.env.NODE_ENV_LOCAL });
dotenv.config({ path: process.env.NODE_ENV });

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ApiModule } from '../../src/api.module';

import { usersPool } from './../userDb';
import { PoolClient } from 'pg';

import * as cookieParser from 'cookie-parser';
import { socialPool } from './../socialDb';
import {
  Profile,
  ReviewModelAttrs,
  ReviewModelWithProfile,
  ReviewModelWithProfileAndChilds,
} from '@hotels2023nestjs/shared';

type RespError = {
  text: string;
};

type RespErrorBody = {
  error: string;
};

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

const REVIEW_TREE =
  '\
Review 1\n\
├── Review 3\n\
│   └── Review 5\n\
├── Review 4\n\
└── Review 6\n\
Review 2';

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
  describe(`Создание отзывов к фильму по схеме\n${REVIEW_TREE}`, () => {
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

    it('Success 201 | Создание отзыва 1 с минимальными полями - film_id, text', async () => {
      const review = JSON.parse(
        (
          await request(app.getHttpServer())
            .post('/reviews')
            .auth(bobAccess, { type: 'bearer' })
            .send({ text: 'abc', film_id: 28 })
            .expect(201)
        ).text,
      );

      expect(review.parent_id).toBe(null);
      expect(review.film_id).toBe(28);
      expect(review.profile_id).toBe(2);
      expect(review.text).toBe('abc');
      expect(review.path).toBe('');
      expect(review.title).toBe(null);
    });

    it('Success | создаем отзыв 2 на другой фильм (корневой)', async () => {
      const review = JSON.parse(
        (
          await request(app.getHttpServer())
            .post('/reviews')
            .auth(bobAccess, { type: 'bearer' })
            .send({ text: 'def', film_id: 13, title: 'qwerty' })
            .expect(201)
        ).text,
      );

      expect(review.parent_id).toBe(null);
      expect(review.id).toBe(2);
      expect(review.film_id).toBe(13);
      expect(review.profile_id).toBe(2);
      expect(review.text).toBe('def');
      expect(review.path).toBe('');
      expect(review.title).toBe('qwerty');
    });

    it('Success | создаем отзыв id=3 от первого отзыва parent_id:1 для фильма film_id:28', async () => {
      const review = JSON.parse(
        (
          await request(app.getHttpServer())
            .post('/reviews')
            .auth(bobAccess, { type: 'bearer' })
            .send({ text: '1.1', film_id: 28, parent_id: 1 })
            .expect(201)
        ).text,
      );

      expect(review.parent_id).toBe(1);
      expect(review.film_id).toBe(28);
      expect(review.profile_id).toBe(2);
      expect(review.text).toBe('1.1');
      expect(review.path).toBe('1.');
      expect(review.title).toBe(null);
    });

    it('Success | создаем отзыв id=4 от первого отзыва parent_id:1 для фильма film_id:28', async () => {
      const review = JSON.parse(
        (
          await request(app.getHttpServer())
            .post('/reviews')
            .auth(bobAccess, { type: 'bearer' })
            .send({ text: '1.2', film_id: 28, parent_id: 1 })
            .expect(201)
        ).text,
      ) as ReviewModelAttrs;

      expect(review.id).toBe(4);
      expect(review.parent_id).toBe(1);
      expect(review.film_id).toBe(28);
      expect(review.profile_id).toBe(2);
      expect(review.text).toBe('1.2');
      expect(review.path).toBe('1.');
      expect(review.title).toBe(null);
    });

    it('Success | создаем отзыв id=5 от 3го отзыва parent_id:3 для фильма film_id:28', async () => {
      const review = JSON.parse(
        (
          await request(app.getHttpServer())
            .post('/reviews')
            .auth(bobAccess, { type: 'bearer' })
            .send({
              text: '1.3.5',
              film_id: 28,
              parent_id: 3,
            })
            .expect(201)
        ).text,
      ) as ReviewModelAttrs;

      expect(review.id).toBe(5);
      expect(review.film_id).toBe(28);
      expect(review.profile_id).toBe(2);
      expect(review.text).toBe('1.3.5');
      expect(review.path).toBe('1.3.');
      expect(review.title).toBe(null);
    });

    it('Success | создаем отзыв id=6 от 1го отзыва parent_id:1 для фильма film_id:28', async () => {
      const review = JSON.parse(
        (
          await request(app.getHttpServer())
            .post('/reviews')
            .auth(bobAccess, { type: 'bearer' })
            .send({
              text: '1.6',
              film_id: 28,
              parent_id: 1,
            })
            .expect(201)
        ).text,
      ) as ReviewModelAttrs;
      expect(review.id).toBe(6);
    });

    it('Success | создаем несколько корневых отзывов id=7,8,9,10 для фильма film_id:13 Теперь у него 5 корневых отзывов', async () => {
      await request(app.getHttpServer())
        .post('/reviews')
        .auth(aliceAccess, { type: 'bearer' })
        .send({
          text: 'Review 7',
          film_id: 13,
        })
        .expect(201);
      await request(app.getHttpServer())
        .post('/reviews')
        .auth(aliceAccess, { type: 'bearer' })
        .send({
          text: 'Review 8',
          film_id: 13,
        })
        .expect(201);
      await request(app.getHttpServer())
        .post('/reviews')
        .auth(aliceAccess, { type: 'bearer' })
        .send({
          text: 'Review 9',
          film_id: 13,
        })
        .expect(201);
      await request(app.getHttpServer())
        .post('/reviews')
        .auth(aliceAccess, { type: 'bearer' })
        .send({
          text: 'Review 10',
          film_id: 13,
        })
        .expect(201);
    });

    it('Error | Попытка создать отзыв с parent_id который не существует', async () => {
      await request(app.getHttpServer())
        .post('/reviews')
        .auth(bobAccess, { type: 'bearer' })
        .send({ text: 'abc', film_id: 28, parent_id: 15 })
        .expect(400)
        .expect((resp: RespError) => {
          const body = JSON.parse(resp.text) as RespErrorBody;
          expect(body.error).toBe('Отзыв с parent_id = 15 не найден');
        });
    });

    it('Error | Попытка создать отзыв от родителя с film_id отличным от данного', async () => {
      await request(app.getHttpServer())
        .post('/reviews')
        .auth(bobAccess, { type: 'bearer' })
        .send({ text: 'abc', film_id: 13, parent_id: 3 })
        .expect(400)
        .expect((resp: RespError) => {
          const body = JSON.parse(resp.text) as RespErrorBody;
          expect(body.error).toBe(
            'film_id родительского отзыва должен совпадать с film_id текущего отзыва, если последний задан',
          );
        });
    });
  });

  describe(`Получение отзывов к фильму`, () => {
    it('GET /reviews/single/:id Получение изолированного отзыва по id', async () => {
      const review = JSON.parse(
        (
          await request(app.getHttpServer())
            .get('/reviews/single/3')
            .expect(200)
        ).text,
      ) as ReviewModelWithProfile;
      // console.log(
      //   `[GET /reviews/single/:id] review: ${JSON.stringify(review)}`,
      // );

      expect(review.id).toBe(3);
      expect(review.film_id).toBe(28);
      expect(review.text).toBe('1.1');
      expect(review.path).toBe('1.');
      expect(review.title).toBe(null);
      // expect(review.childNum).toBe(1)

      expect(review).toHaveProperty('profile');
      const profile = review.profile;

      expect(profile).toHaveProperty('id', 2);
      expect(profile).toHaveProperty('username', 'Bob');

      expect(review).not.toHaveProperty('childs');
    });

    it('GET /reviews/tree/:id Получение поддерева отзывов начиная с id', async () => {
      const review = JSON.parse(
        (await request(app.getHttpServer()).get('/reviews/tree/1').expect(200))
          .text,
      ) as ReviewModelWithProfileAndChilds;

      // console.log(
      //   `[GET /reviews/tree/:id] review: ${JSON.stringify(
      //     review,
      //     undefined,
      //     2,
      //   )}`,
      // );

      expect(review.id).toBe(1);
      expect(review.film_id).toBe(28);
      expect(review.text).toBe('abc');
      expect(review.path).toBe('');
      expect(review.title).toBe(null);
      expect(review.childsNum).toBe(3);

      expect(review).toHaveProperty('profile');
      const profile = review.profile;

      expect(profile).toHaveProperty('id', 2);
      expect(profile).toHaveProperty('username', 'Bob');

      expect(review).toHaveProperty('childs');

      const childs = review.childs;
      expect(childs).toHaveLength(3);

      // Третий ребенок - отзыв с id = 3
      const child3 = childs[2];
      expect(child3.id).toBe(3);
      expect(child3.film_id).toBe(28);
      expect(child3.text).toBe('1.1');
      expect(child3.path).toBe('1.');
      expect(child3.title).toBe(null);
      expect(child3.childsNum).toBe(1);

      expect(child3).toHaveProperty('profile');
      const child3profile = child3.profile;
      expect(child3profile).toHaveProperty('id', 2);
      expect(child3profile).toHaveProperty('username', 'Bob');

      expect(child3).toHaveProperty('childs');

      const childs3 = child3.childs;
      expect(childs3).toHaveLength(1);

      // Второй ребенок - отзыв с id = 4
      const child4 = childs[1];
      expect(child4.id).toBe(4);
      expect(child4.film_id).toBe(28);
      expect(child4.text).toBe('1.2');
      expect(child4.path).toBe('1.');
      expect(child4.title).toBe(null);
      expect(child4.childsNum).toBe(0);

      expect(child4).toHaveProperty('profile');
      const child4profile = child4.profile;
      expect(child4profile).toHaveProperty('id', 2);
      expect(child4profile).toHaveProperty('username', 'Bob');

      // Первый внук - отзыв с id = 5
      const child5 = childs3[0];
      expect(child5.id).toBe(5);
      expect(child5.film_id).toBe(28);
      expect(child5.text).toBe('1.3.5');
      expect(child5.path).toBe('1.3.');
      expect(child5.title).toBe(null);

      expect(child5).toHaveProperty('profile');
      const child5profile = child5.profile;
      expect(child5profile).toHaveProperty('id', 2);
      expect(child5profile).toHaveProperty('username', 'Bob');
    });

    it('GET /reviews/film/:film_id Получение всего дерева отзывов для фильма 13', async () => {
      const reviews = JSON.parse(
        (await request(app.getHttpServer()).get('/reviews/film/13').expect(200))
          .text,
      ) as ReviewModelWithProfileAndChilds;

      expect(reviews).toHaveLength(5);
      const review = reviews[0];
      expect(review.id).toBe(10); // Первым идет последний добавленный отзыв у которого id=10
      expect(review.film_id).toBe(13);
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
