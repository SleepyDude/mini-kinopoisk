import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';

describe('films module', () => {
  let user;
  let queryName;
  let genreUpdateData;
  let genreOldData;
  const url = 'http://localhost:5000';

  beforeAll(() => {
    genreUpdateData = {
      genreNameRu: 'тест',
      genreNameEng: 'test',
    };
    genreOldData = {
      genreNameRu: 'криминал',
      genreNameEng: 'crime',
    };
  });

  it('login admin', () => {
    return request(url)
      .post('/api/auth/login')
      .send({
        email: 'superuser@superuser.com',
        password: 'Adm1n-Passw0rd',
      })
      .expect((response: request.Response) => {
        user = response.body;
      })
      .expect(HttpStatus.CREATED);
  });

  it('/GET all movies 200', () => {
    return request(url).get('/api/movies').expect(HttpStatus.OK);
  });

  it('/GET query film search', () => {
    return request(url)
      .get('/api/movies')
      .query({ name: 'аватар', size: 2 })
      .expect((response: request.Response) => {
        queryName = response.body;
        expect(queryName.rows[0].nameRu).toBe('Аватар');
        expect(queryName.count).toBe(3);
        expect(queryName.rows.length).toBe(2);
      })
      .expect(HttpStatus.OK);
  });

  it('/GET get bad req, res empty array', () => {
    return request(url)
      .get('/api/movies')
      .query({ name: 'asdasdasd', size: 2 })
      .expect((response: request.Response) => {
        queryName = response.body;
        expect(queryName.count).toBe(0);
      });
  });

  it('/GET get film by id', () => {
    return request(url)
      .get('/api/movies/about/251733')
      .expect((response: request.Response) => {
        queryName = response.body;
        expect(queryName.film.kinopoiskId).toBe(251733);
      })
      .expect(HttpStatus.OK);
  });

  it('/GET bad req, res error', () => {
    return request(url)
      .get('/api/movies/about/1')
      .expect((response: request.Response) => {
        queryName = response.body;
        expect(queryName.status).toBe(404);
      })
      .expect(HttpStatus.OK);
  });

  it('/GET films by filter', () => {
    return request(url)
      .get('/api/movies/filters')
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

  it('/GET get all genres', () => {
    return request(url)
      .get('/api/movies/genres')
      .expect((response: request.Response) => {
        queryName = response.body;
        expect(queryName.length).toBe(26);
      })
      .expect(HttpStatus.OK);
  });

  it('/POST update genre bu id', () => {
    const acessToken = `Bearer ${user.token}`;
    return request(url)
      .post('/api/movies/genres/1')
      .set('authorization', acessToken)
      .send(genreUpdateData)
      .expect((response: request.Response) => {
        queryName = response.body;
        expect(queryName.genreNameRu).toBe('тест');
        expect(queryName.genreNameEng).toBe('test');
      })
      .expect(HttpStatus.CREATED);
  });

  afterAll(() => {
    const acessToken = `Bearer ${user.token}`;
    return request(url)
      .post('/api/movies/genres/1')
      .set('authorization', acessToken)
      .send(genreOldData);
  });
});
