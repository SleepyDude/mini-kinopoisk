import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FindAndCountOptions, Op, WhereOptions } from 'sequelize';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { HttpRpcException, Persons, PersonsFilms } from '@shared';
import { PersonsAutosagestDto, PersonsQueryDto } from '@shared/dto';
import { IGetStaffByFilmId, IPagination } from '@shared/interfaces';

@Injectable()
export class PersonsService {
  constructor(
    @InjectModel(PersonsFilms)
    private personsFilmsRepository: typeof PersonsFilms,
    @InjectModel(Persons) private personsRepository: typeof Persons,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getPersonById(personId: number): Promise<any> {
    const cache = await this.cacheManager.get(
      `getPersonById${JSON.stringify(personId)}`,
    );
    if (cache) return cache;

    const person: Persons = await this.personsRepository.findOne({
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
      where: { personId: personId },
    });

    if (!person) {
      throw new HttpRpcException(
        'Такой айди не зарегистрирован',
        HttpStatus.NOT_FOUND,
      );
    }

    const filmsId: PersonsFilms[] = await this.personsFilmsRepository.findAll({
      attributes: [['filmId', 'id']],
      where: { staffId: personId },
    });
    await this.cacheManager.set(`getPersonById${JSON.stringify(personId)}`, {
      filmsId: filmsId,
      person: person,
    });

    return {
      filmsId: filmsId,
      person: person,
    };
  }

  async getAllPersons(params: PersonsQueryDto): Promise<any> {
    const cache = await this.cacheManager.get(
      `getAllPersons${JSON.stringify(this.sortForCacheKey(params))}`,
    );
    if (cache) return cache;

    const { page, size, name } = params;
    const condition = name ? { nameRu: { [Op.iLike]: `%${name}%` } } : null;
    const { limit, offset } = this.getPagination(page, size);

    const queryDatabaseParams: Omit<FindAndCountOptions<Persons>, 'group'> = {
      where: condition,
      limit,
      offset,
    };

    const allPersons = await this.personsRepository
      .findAndCountAll(queryDatabaseParams)
      .catch(() => {
        throw new HttpRpcException(
          'Что то пошло не так',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });

    await this.cacheManager.set(
      `getAllPersons${JSON.stringify(this.sortForCacheKey(params))}`,
      allPersons,
    );

    return allPersons;
  }

  async getPersonsAutosagest(params: PersonsAutosagestDto): Promise<any> {
    const cache = await this.cacheManager.get(
      `getPersonsAutosagest${JSON.stringify(this.sortForCacheKey(params))}`,
    );
    if (cache) return cache;

    const { profession, name, size = 10 } = params;

    const queryDatabaseParams: Omit<FindAndCountOptions<Persons>, 'group'> = {
      attributes: ['personId', 'nameRu'],
      where: {
        [Op.and]: [
          { profession: { [Op.iLike]: `%${profession}%` } },
          { nameRu: { [Op.iLike]: `%${name}%` } },
        ],
      },
      limit: size,
      order: ['nameRu'],
    };

    const allPersons = await this.personsRepository
      .findAndCountAll(queryDatabaseParams)
      .catch(() => {
        throw new HttpRpcException(
          'Что то пошло не так',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });

    await this.cacheManager.set(
      `getPersonsAutosagest${JSON.stringify(this.sortForCacheKey(params))}`,
      allPersons,
    );

    return allPersons;
  }

  async getStaffByFilmId(params: IGetStaffByFilmId): Promise<any> {
    const cache = await this.cacheManager.get(
      `getStaffByFilmId${JSON.stringify(this.sortForCacheKey(params))}`,
    );
    if (cache) return cache;

    const staff: any[] = await this.personsFilmsRepository.findAll({
      raw: true,
      attributes: [['staffId', 'personId']],
      where: { filmId: params.id },
      limit: params.size,
    });

    const allStaff = await this.personsRepository
      .findAll({
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
        where: {
          [Op.or]: staff,
        },
        order: ['nameRu'],
      })
      .catch(() => {
        throw new HttpRpcException(
          'Что то пошло не так',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });

    await this.cacheManager.set(
      `getStaffByFilmId${JSON.stringify(this.sortForCacheKey(params))}`,
      allStaff,
    );

    return allStaff;
  }

  private getPagination(page: number, size: number): IPagination {
    const limit: number = size ? +size : 10;
    const offset: number = page ? page * limit : 0;

    return { limit, offset };
  }

  private sortForCacheKey(cacheKey) {
    return Object.keys(cacheKey)
      .sort()
      .reduce<typeof cacheKey>((obj, key) => {
        obj[key] = cacheKey[key];
        return obj;
      }, {});
  }

  async getFilmsIdByPersonId(personQuery: Array<WhereOptions<PersonsFilms>>) {
    const cache = await this.cacheManager.get(
      `getFilmsIdByPersonId${JSON.stringify(
        this.sortForCacheKey(personQuery),
      )}`,
    );
    if (cache) return cache;

    const filmsId: Array<{ id: number }> =
      await this.personsFilmsRepository.findAll({
        attributes: [['filmId', 'id']],
        where: {
          [Op.or]: personQuery,
        },
      });

    if (personQuery.length > 1) {
      const temp = new Map<number, number>();
      return filmsId.filter((val) => {
        if (temp.has(val.id)) {
          return true;
        }
        temp.set(val.id, 1);
        return false;
      });
    }

    await this.cacheManager.set(
      `getFilmsIdByPersonId${JSON.stringify(
        this.sortForCacheKey(personQuery),
      )}`,
      filmsId,
    );

    return filmsId;
  }
}
