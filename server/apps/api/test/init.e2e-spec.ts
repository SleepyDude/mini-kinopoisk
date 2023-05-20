import * as dotenv from 'dotenv';

dotenv.config({ path: process.env.NODE_ENV_LOCAL });
dotenv.config({ path: process.env.NODE_ENV });

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ApiModule } from '../src/api.module';
import { PoolClient } from 'pg';
import { usersPool } from './dbPools/userDb';
import { socialPool } from './dbPools/socialDb';

describe('Init e2e', () => {
  let app: INestApplication;
  let userPoolClient: PoolClient;
  let socialPoolClient: PoolClient;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userPoolClient = await usersPool.connect();
    socialPoolClient = await socialPool.connect();
  });

  it('Пытаемся регистрировать пользователя до инициализации сервера - ошибка 400', async () => {
    return await request(app.getHttpServer())
      .post('/auth/registration')
      .send({ email: 'user@mail.ru', password: '123321' })
      .expect(424)
      .expect((resp: any) => {
        expect(resp).toHaveProperty('text');
        const body = JSON.parse(resp.text);
        expect(body).toHaveProperty('error');
        expect(body.error).toBe(
          "Роль 'USER' не найдена, необходимо выполнение инициализации ресурса",
        );
      });
  });

  it('Инициализируем ресурс /api/init. Успех', async () => {
    const res = await request(app.getHttpServer()).get('/init').expect(200);
    // Проверяем базу данных
    const users = (await userPoolClient.query('SELECT * from users')).rows;
    const roles = (await userPoolClient.query('SELECT * from roles')).rows;
    const usersRoles = (await userPoolClient.query('SELECT * from user_roles'))
      .rows;
    const profiles = (await socialPoolClient.query('SELECT * from profiles'))
      .rows;
    expect(users).toHaveLength(1);
    expect(roles).toHaveLength(3);
    expect(usersRoles).toHaveLength(2);
    expect(profiles).toHaveLength(1);
    // return res;
  });

  afterAll(async () => {
    // Чистим таблицы
    await userPoolClient.query('TRUNCATE users RESTART IDENTITY CASCADE');
    await userPoolClient.query('TRUNCATE roles RESTART IDENTITY CASCADE');
    await userPoolClient.query('TRUNCATE tokens RESTART IDENTITY CASCADE');
    await socialPoolClient.query('TRUNCATE profiles RESTART IDENTITY CASCADE');

    // console.log(queryResult.rows);

    userPoolClient.release(true);
    socialPoolClient.release(true);
    await usersPool.end();
    await socialPool.end();

    await app.close();
  }, 6000);
});
