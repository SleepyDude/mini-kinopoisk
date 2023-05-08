import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Films } from './films.model';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Op } from 'sequelize';
import { Genres } from '../genres/genres.model';
import { Countries } from '../countries/countries.model';
import { Reviews } from '../reviews/reviews.model';
import { FilmsQueryDto } from './dto/films.query.dto';
import { FilmsUpdateDto } from './dto/films.update.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

`***
У получения списка фильмов есть пагинация и поиск по русскому имени.
В получении фильма по айди стоит строгое ограничение на получение
комментариев, для показа остальных реализована другая функция.
Все связи с моделью фильмов реализовывать через поле kinopoiskId.
Функция фильтра работает с квери строкой, поля жанров и стран
могут быть накопительными, работают с оператором ИЛИ. В нем же
реализована сортировка и пагинация. Есть функция превью фильмов,
она нужна для модели персон. Отдельно есть функция для использования
автосаджеста на поиск по имени фильма.
***`;

@Injectable()
export class FilmsService {
  constructor(
    @Inject('PERSONS-SERVICE') private personsClient: ClientProxy,
    @InjectModel(Films) private filmsRepository: typeof Films,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async getAllFilms(params: FilmsQueryDto) {
    const cache = await this.cacheManager.get(
      `getAllFilms${JSON.stringify(params)}`,
    );
    if (cache) {
      return cache;
    }
    const { page, size, name } = params;
    const query = name ? { nameRu: { [Op.iLike]: `%${name}%` } } : null;
    const { limit, offset } = this.getPagination(page, size);

    return await this.filmsRepository
      .findAndCountAll({
        attributes: [
          'kinopoiskId',
          'nameRu',
          'nameOriginal',
          'posterUrl',
          'posterUrlPreview',
          'coverUrl',
          'logoUrl',
          'ratingKinopoisk',
          'year',
          'filmLength',
        ],
        include: [
          {
            model: Genres,
            attributes: ['id', 'genreNameRu', 'genreNameEng'],
          },
          {
            model: Countries,
            attributes: ['id', 'countryNameRu', 'countryNameEng'],
          },
        ],
        where: query,
        limit,
        offset,
        distinct: true,
      })
      .then(async (result) => {
        await this.cacheManager.set(
          `getAllFilms${JSON.stringify(params)}`,
          result,
        );
        return result;
      });
  }

  async getFilmById(filmId) {
    const cache = await this.cacheManager.get(
      `getFilmById${JSON.stringify(filmId)}`,
    );
    if (cache) {
      return cache;
    }
    try {
      const film: Films = await this.filmsRepository.findOne({
        attributes: {
          exclude: [
            'reviewsCount',
            'ratingGoodReview',
            'ratingGoodReviewVoteCount',
            'ratingFilmCritics',
            'ratingFilmCriticsVoteCount',
            'serial',
            'shortFilm',
            'createdAt',
            'updatedAt',
          ],
        },
        include: [
          { all: true, attributes: { exclude: ['createdAt', 'updatedAt'] } },
          {
            model: Reviews,
            limit: 15,
            attributes: { exclude: ['updatedAt', 'userId', 'filmIdFK'] },
            where: { parentId: { [Op.is]: null } },
          },
        ],
        where: { kinopoiskId: filmId.id },
      });
      const staff = await lastValueFrom(
        this.personsClient.send(
          { cmd: 'get-staff-by-filmId' },
          { id: film.id, size: 10 },
        ),
      );
      await this.cacheManager.set(`getFilmById${JSON.stringify(filmId)}`, {
        film,
        staff,
      });
      return {
        film,
        staff,
      };
    } catch (err) {
      return new HttpException('Айди не зарегистрирован', HttpStatus.NOT_FOUND);
    }
  }

  async getFilmsByFilers(params) {
    const cache = await this.cacheManager.get(
      `getFilmsByFilers${JSON.stringify(params)}`,
    );
    if (cache) {
      return cache;
    }
    const films = [];
    const genres = [];
    const countries = [];
    const orderBy = [];
    const personQuery = [];

    const { page, size } = params;
    const { limit, offset } = this.getPagination(page, size);

    for (const [key, value] of Object.entries(params)) {
      if (key === 'year' || key === 'type') {
        films.push({ [key]: value });
      }
      if (key === 'ratingKinopoisk' || key === 'ratingKinopoiskVoteCount') {
        films.push({ [key]: { [Op.gte]: value } });
      }
      if (key === 'genreId') {
        genres.push(value);
      }
      if (key === 'countryId') {
        countries.push(value);
      }
      if (key === 'orderBy') {
        orderBy.push(value === 'nameRu' ? [value] : [value, 'DESC'], [
          'nameRu',
          'ASC',
        ]);
      }
      if (key === 'DIRECTOR' || key === 'ACTOR') {
        personQuery.push({ professionKey: key, staffId: value });
      }
    }
    const filmsIdByPerson = await lastValueFrom(
      this.personsClient.send({ cmd: 'get-filmsId-byPersonId' }, personQuery),
    );
    if (personQuery.length > 0) {
      if (filmsIdByPerson.length === 0) {
        return {
          count: 0,
          rows: [],
        };
      }
    }
    const queryWhere =
      filmsIdByPerson.length > 0
        ? { [Op.and]: films, [Op.or]: filmsIdByPerson }
        : { [Op.and]: films };

    return await this.filmsRepository
      .findAndCountAll({
        attributes: [
          'id',
          'kinopoiskId',
          'nameRu',
          'nameOriginal',
          'ratingKinopoiskVoteCount',
          'posterUrl',
          'posterUrlPreview',
          'coverUrl',
          'logoUrl',
          'ratingKinopoisk',
          'year',
          'filmLength',
          'type',
        ],
        where: queryWhere,
        order: orderBy,
        include: [
          {
            model: Genres,
            where: { id: { [Op.or]: genres } },
            attributes: { exclude: ['createdAt', 'updatedAt'] },
          },
          {
            model: Countries,
            where: { id: { [Op.or]: countries } },
            attributes: { exclude: ['createdAt', 'updatedAt'] },
          },
        ],
        limit,
        offset,
        distinct: true,
      })
      .then(async (result) => {
        await this.cacheManager.set(
          `getFilmsByFilers${JSON.stringify(params)}`,
          result,
        );
        return result;
      });
  }

  async getFilmsByIdPrevious(filmsId) {
    const cache = await this.cacheManager.get(
      `getFilmsByIdPrevious${JSON.stringify(filmsId)}`,
    );
    if (cache) {
      return cache;
    }
    return await this.filmsRepository
      .findAll({
        where: filmsId,
        attributes: [
          'kinopoiskId',
          'year',
          'nameRu',
          'nameOriginal',
          'posterUrl',
          'posterUrlPreview',
          'coverUrl',
          'logoUrl',
          'ratingKinopoisk',
        ],
      })
      .then(async (result) => {
        await this.cacheManager.set(
          `getFilmsByIdPrevious${JSON.stringify(filmsId)}`,
          result,
        );
        return result;
      });
  }

  async filmsAutosagest(params) {
    const cache = await this.cacheManager.get(
      `filmsAutosagest${JSON.stringify(params)}`,
    );
    if (cache) {
      return cache;
    }
    const search = params.nameRu
      ? { nameRu: { [Op.iLike]: `%${params.nameRu}%` } }
      : { nameOriginal: { [Op.iLike]: `%${params.nameOriginal}%` } };
    const { size = 10 } = params;
    return await this.filmsRepository
      .findAll({
        attributes: ['kinopoiskId', 'nameRu', 'nameOriginal', 'year'],
        where: search,
        limit: size,
      })
      .then(async (result) => {
        await this.cacheManager.set(
          `filmsAutosagest${JSON.stringify(params)}`,
          result,
        );
        return result;
      });
  }

  private getPagination(page, size) {
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 0;

    return { limit, offset };
  }

  async updateFilmById(film) {
    const filmData: FilmsUpdateDto = film.film;
    const currentFilm = await this.filmsRepository.findOne({
      where: { kinopoiskId: film.id },
    });
    return await currentFilm.update(filmData);
  }
}
