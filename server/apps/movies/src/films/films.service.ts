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
import {
  allFilmsAttributes,
  autosagestFilmsAttributes,
  filterFilmsAttributes,
  includeCountriesAttributes,
  includeGenresAttributes,
  includeOneFilmAttributes,
  oneFilmAttributes,
  previousFilmsAttributes,
} from './templates/query-database.template';

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
      `getAllFilms${JSON.stringify(this.sortForCacheKey(params))}`,
    );
    if (cache) return cache;

    const { page, size, name } = params;
    const query = name ? { nameRu: { [Op.iLike]: `%${name}%` } } : null;
    const { limit, offset } = this.getPagination(page, size);

    const queryDatabaseParams: Omit<FindAndCountOptions<Films>, 'group'> = {
      attributes: allFilmsAttributes,
      include: [includeGenresAttributes, includeCountriesAttributes],
      where: query,
      limit,
      offset,
      distinct: true,
    };

    const allFilms = await this.filmsRepository
      .findAndCountAll(queryDatabaseParams)
      .catch(() => {
        throw new HttpRpcException(
          'Что то пошло не так',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });

    await this.cacheManager.set(
      `getAllFilms${JSON.stringify(this.sortForCacheKey(params))}`,
      allFilms,
    );

    return allFilms;
  }

  async getFilmById(filmId: number): Promise<any> {
    const cache = await this.cacheManager.get(
      `getFilmById${JSON.stringify(filmId)}`,
    );
    if (cache) return cache;

    const queryDatabaseParams: Omit<FindAndCountOptions<Films>, 'group'> = {
      attributes: oneFilmAttributes,
      include: includeOneFilmAttributes,
      where: { kinopoiskId: filmId },
    };

    const film: Films = await this.filmsRepository.findOne(queryDatabaseParams);
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
    const cache = await this.cacheManager.get(
      `getFilmsByFilers${JSON.stringify(this.sortForCacheKey(params))}`,
    );
    if (cache) return cache;

    const getParseQueryObject = this.parseQueryObject(params);

    const filmsIdByPerson = await lastValueFrom(
      this.personsClient.send(
        { cmd: 'get-filmsId-byPersonId' },
        getParseQueryObject.personQuery,
      ),
    );

    if (
      getParseQueryObject.personQuery.length > 0 &&
      filmsIdByPerson.length === 0
    ) {
      return { count: 0, rows: [] };
    }

    const queryWhere =
      filmsIdByPerson.length > 0
        ? { [Op.and]: getParseQueryObject.films, [Op.or]: filmsIdByPerson }
        : { [Op.and]: getParseQueryObject.films };

    const queryDatabaseParams: Omit<FindAndCountOptions<Films>, 'group'> = {
      attributes: filterFilmsAttributes,
      where: queryWhere,
      order: getParseQueryObject.orderBy,
      include: [
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
      ],
      limit: getParseQueryObject.limit,
      offset: getParseQueryObject.offset,
      distinct: true,
    };

    const allFilms = await this.filmsRepository
      .findAndCountAll(queryDatabaseParams)
      .catch(() => {
        throw new HttpRpcException(
          'Что то пошло не так',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });

    await this.cacheManager.set(
      `getFilmsByFilers${JSON.stringify(this.sortForCacheKey(params))}`,
      allFilms,
    );

    return allFilms;
  }

  async getFilmsByIdPrevious(filmsId: Array<{ id: number }>): Promise<any> {
    const cache = await this.cacheManager.get(
      `getFilmsByIdPrevious${JSON.stringify(this.sortForCacheKey(filmsId))}`,
    );
    if (cache) return cache;

    const queryDatabaseParams: Omit<FindAndCountOptions<Films>, 'group'> = {
      attributes: previousFilmsAttributes,
      where: { [Op.or]: filmsId },
    };

    const allFilms = await this.filmsRepository
      .findAll(queryDatabaseParams)
      .catch(() => {
        throw new HttpRpcException(
          'Что то пошло не так',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });

    await this.cacheManager.set(
      `getFilmsByIdPrevious${JSON.stringify(this.sortForCacheKey(filmsId))}`,
      allFilms,
    );

    return allFilms;
  }

  async filmsAutosagest(params: MoviesQueryAutosagestDto): Promise<any> {
    const cache = await this.cacheManager.get(
      `filmsAutosagest${JSON.stringify(this.sortForCacheKey(params))}`,
    );
    if (cache) return cache;

    const { size = 10, nameRu, nameOriginal } = params;
    const search = nameRu
      ? { nameRu: { [Op.iLike]: `%${nameRu}%` } }
      : { nameOriginal: { [Op.iLike]: `%${nameOriginal}%` } };

    const queryDatabaseParams: Omit<FindAndCountOptions<Films>, 'group'> = {
      attributes: autosagestFilmsAttributes,
      where: search,
      limit: size,
    };

    const allFilms = await this.filmsRepository
      .findAll(queryDatabaseParams)
      .catch(() => {
        throw new HttpRpcException(
          'Что то пошло не так',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });

    await this.cacheManager.set(
      `filmsAutosagest${JSON.stringify(params)}`,
      allFilms,
    );

    return allFilms;
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
