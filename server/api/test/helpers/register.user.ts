import { Profile } from '@hotels2023nestjs/shared';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

// Регистрирует пользователя, задает его имя в профиле
export async function registerUserHelper(
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
