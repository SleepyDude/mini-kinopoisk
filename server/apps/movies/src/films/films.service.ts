import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Films } from './films.model';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { FindAndCountOptions, Op } from 'sequelize';
import { Genres } from '../genres/genres.model';
import { Countries } from '../countries/countries.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { BudgetService } from '../budget/budget.service';
import { TrailersService } from '../trailers/trailers.service';
import {
  FilmsUpdateDto,
  MoviesFiltersQueryDto,
  MoviesQueryAutosagestDto,
  MoviesQueryDto,
} from '@shared/dto';
import { PaginationInterface } from '@shared/interfaces';
import { HttpRpcException, MoviesUpdateFilmWithFilmIdDto } from '@shared';
import { filterFilmsAttributes } from './templates/query-database.template';

@Injectable()
export class FilmsService {
  constructor(
    @Inject('PERSONS-SERVICE') private personsClient: ClientProxy,
    @Inject('SOCIAL-SERVICE') private socialClient: ClientProxy,
    @InjectModel(Films) private filmsRepository: typeof Films,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private budgetService: BudgetService,
    private trailersService: TrailersService,
  ) {}
  async getAllFilms(params: MoviesQueryDto): Promise<any> {
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
        if (!result) {
          throw new HttpRpcException(
            'Что то пошло не так',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        await this.cacheManager.set(
          `getAllFilms${JSON.stringify(params)}`,
          result,
        );
        return result;
      });
  }

  async getFilmById(filmId: number): Promise<any> {
    const cache = await this.cacheManager.get(
      `getFilmById${JSON.stringify(filmId)}`,
    );
    if (cache) {
      return cache;
    }
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
      ],
      where: { kinopoiskId: filmId },
    });
    if (!film) {
      throw new HttpRpcException(
        'Не удалось найти фильм по данному айди',
        HttpStatus.NOT_FOUND,
      );
    }
    const staff = await lastValueFrom(
      this.personsClient.send(
        { cmd: 'get-staff-by-filmId' },
        { id: film.id, size: 10 },
      ),
    );
    const reviews = await lastValueFrom(
      this.socialClient.send(
        { cmd: 'get-top-reviews-by-film-id' },
        { filmId: filmId, paginationQueryDto: { size: 10, page: 0 } },
      ),
    );
    await this.cacheManager.set(`getFilmById${JSON.stringify(filmId)}`, {
      film,
      staff,
      reviews,
    });
    return {
      film,
      staff,
      reviews,
    };
  }

  async getFilmsByFilers(params: MoviesFiltersQueryDto): Promise<any> {
    const queryDatabaseParams: Omit<FindAndCountOptions<Films>, 'group'> = {};
    const sortCacheKey = this.sortForCacheKey(params);
    const cache = await this.cacheManager.get(
      `getFilmsByFilers${JSON.stringify(sortCacheKey)}`,
    );
    const getParseQueryObject = this.parseQueryObject(params);
    const filmsIdByPerson = await lastValueFrom(
      this.personsClient.send(
        { cmd: 'get-filmsId-byPersonId' },
        getParseQueryObject.personQuery,
      ),
    );
    if (getParseQueryObject.personQuery.length > 0) {
      if (filmsIdByPerson.length === 0) {
        return {
          count: 0,
          rows: [],
        };
      }
    }
    const queryWhere =
      filmsIdByPerson.length > 0
        ? { [Op.and]: getParseQueryObject.films, [Op.or]: filmsIdByPerson }
        : { [Op.and]: getParseQueryObject.films };

    queryDatabaseParams.attributes = filterFilmsAttributes;
    queryDatabaseParams.where = queryWhere;
    queryDatabaseParams.order = getParseQueryObject.orderBy;
    queryDatabaseParams.include = [
      {
        model: Genres,
        where: { id: { [Op.or]: getParseQueryObject.genres } },
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      },
      {
        model: Countries,
        where: { id: { [Op.or]: getParseQueryObject.countries } },
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      },
    ];
    queryDatabaseParams.limit = getParseQueryObject.limit;
    queryDatabaseParams.offset = getParseQueryObject.offset;
    queryDatabaseParams.distinct = true;

    return cache
      ? cache
      : await this.filmsRepository
          .findAndCountAll(queryDatabaseParams)
          .then(async (result) => {
            await this.cacheManager.set(
              `getFilmsByFilers${JSON.stringify(sortCacheKey)}`,
              result,
            );
            return result;
          })
          .catch(() => {
            throw new HttpRpcException(
              'Что то пошло не так',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          });
  }

  async getFilmsByIdPrevious(filmsId: Array<{ id: number }>): Promise<any> {
    const cache = await this.cacheManager.get(
      `getFilmsByIdPrevious${JSON.stringify(filmsId)}`,
    );
    if (cache) {
      return cache;
    }
    try {
      return await this.filmsRepository
        .findAll({
          where: {
            [Op.or]: filmsId,
          },
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
    } catch (e) {
      throw new HttpRpcException(
        'Что то пошло не так',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async filmsAutosagest(params: MoviesQueryAutosagestDto): Promise<any> {
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
    try {
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
    } catch (e) {
      throw new HttpRpcException(
        'Что то пошло не так',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private getPagination(page, size): PaginationInterface {
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 0;

    return { limit, offset };
  }

  private parseQueryObject(queryObject: MoviesFiltersQueryDto) {
    const films = [];
    const genres = [];
    const countries = [];
    const orderBy = [];
    const personQuery = [];

    const { page, size } = queryObject;
    const { limit, offset } = this.getPagination(page, size);

    for (const [key, value] of Object.entries(queryObject)) {
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
    return {
      films: films,
      genres: genres,
      countries: countries,
      orderBy: orderBy,
      personQuery: personQuery,
      limit: limit,
      offset: offset,
    };
  }

  private sortForCacheKey(cacheKey) {
    return Object.keys(cacheKey)
      .sort()
      .reduce<typeof cacheKey>((obj, key) => {
        obj[key] = cacheKey[key];
        return obj;
      }, {});
  }

  async updateFilmById(film: MoviesUpdateFilmWithFilmIdDto): Promise<any> {
    const filmData: FilmsUpdateDto = film.film;
    const currentFilm = await this.filmsRepository.findOne({
      where: { kinopoiskId: film.id },
    });
    if (!currentFilm) {
      throw new HttpRpcException(
        'Не удалось найти фильм по айди',
        HttpStatus.NOT_FOUND,
      );
    }
    return await currentFilm.update(filmData);
  }

  async deleteFilmById(filmId: number) {
    await this.budgetService.deleteBudgetByFilmId(filmId);
    await this.trailersService.deleteTrailersBuFilmId(filmId);
    return await this.filmsRepository
      .destroy({
        where: { kinopoiskId: filmId },
      })
      .then((result) => {
        if (!result) {
          throw new HttpRpcException(
            'Не удалось найти такой фильм',
            HttpStatus.BAD_REQUEST,
          );
        }
        return result;
      });
  }
}
