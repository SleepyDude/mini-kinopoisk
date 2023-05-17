import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';

describe('persons module', () => {
  const url = 'http://localhost:5000';
  let query;

  it('get all persons', () => {
    return request(url)
      .get('/api/persons')
      .expect((response: request.Response) => {
        query = response.body;
        expect(query.count).toBe(176001);
        expect(query.rows.length).toBe(10);
      })
      .expect(HttpStatus.OK);
  });

  it('get person by id', () => {
    return request(url)
      .get('/api/persons/about/1')
      .expect((response: request.Response) => {
        query = response.body;
        expect(query.person.personId).toBe(1);
      })
      .expect(HttpStatus.OK);
  });

  it('get person by id bad req', () => {
    return request(url)
      .get('/api/persons/about/999999')
      .expect(HttpStatus.NOT_FOUND);
  });

  it('get autosagest', () => {
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
        expect(query.rows[0].nameRu).toBe('Грегори Балди');
      })
      .expect(HttpStatus.OK);
  });
});
