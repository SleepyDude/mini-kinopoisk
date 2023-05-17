import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export class CreateReviewHelper {
  app: INestApplication;
  accessToken: string;
  filmId: number;

  constructor(app: INestApplication, token: string, filmId: number) {
    this.app = app;
    this.accessToken = token;
    this.filmId = filmId;
  }

  async createReviewHelper(
    num: number,
    parentId: number | undefined = undefined,
  ): Promise<null> {
    const title = `Rev ${num}`;
    const text = `Text Rev ${num}`;
    await request(this.app.getHttpServer())
      .post('/reviews')
      .auth(this.accessToken, { type: 'bearer' })
      .send({
        text: text,
        filmId: this.filmId,
        parentId: parentId,
        title: title,
      })
      .expect(201);

    return;
  }
}
