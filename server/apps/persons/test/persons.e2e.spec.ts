import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';

describe('persons module', () => {
  const url = 'http://localhost:5000';
  let query;

  it('get all persons, check count, limit', () => {
    return request(url)
      .get('/api/persons')
      .expect((response: request.Response) => {
        query = response.body;
        expect(query.count).toBe(176001);
        expect(query.rows.length).toBe(10);
      })
      .expect(HttpStatus.OK);
  });

  it('get person by id, check name, id and defined films array', () => {
    return request(url)
      .get('/api/persons/about/1')
      .expect((response: request.Response) => {
        query = response.body;
        expect(query.person.personId).toBe(1);
        expect(query.films).toBeDefined();
        expect(query.person.nameRu).toBe('Стивен Карпентер');
      })
      .expect(HttpStatus.OK);
  });

  it('get person by id bad req, check err message', () => {
    return request(url)
      .get('/api/persons/about/999999')
      .expect((response: request.Response) => {
        expect(response.body.error).toBe('Такой айди не зарегистрирован');
      })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('get autosagest, check count array, length array, first name', () => {
    return request(url)
      .get('/api/persons/search')
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
    return request(url)
      .get('/api/persons/search')
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
});
