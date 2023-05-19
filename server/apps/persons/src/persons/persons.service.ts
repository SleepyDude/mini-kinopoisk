import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { HttpRpcException, Persons, PersonsFilms } from '@shared';
import { PersonsAutosagestDto, PersonsQueryDto } from '@shared/dto';
import {
  GetStaffByFilmIdInterface,
  PaginationInterface,
} from '@shared/interfaces';

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
    if (cache) {
      return cache;
    }
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
      `getAllPersons${JSON.stringify(params)}`,
    );
    if (cache) {
      return cache;
    }
    const { page, size, name } = params;
    const condition = name ? { nameRu: { [Op.iLike]: `%${name}%` } } : null;
    const { limit, offset } = this.getPagination(page, size);

    return await this.personsRepository
      .findAndCountAll({
        where: condition,
        limit,
        offset,
      })
      .then(async (result) => {
        await this.cacheManager.set(
          `getAllPersons${JSON.stringify(params)}`,
          result,
        );
        return result;
      });
  }

  async getPersonsAutosagest(params: PersonsAutosagestDto): Promise<any> {
    const cache = await this.cacheManager.get(
      `getPersonsAutosagest${JSON.stringify(params)}`,
    );
    if (cache) {
      return cache;
    }
    const { profession, name, size = 10 } = params;
    return await this.personsRepository
      .findAndCountAll({
        attributes: ['personId', 'nameRu'],
        where: {
          [Op.and]: [
            { profession: { [Op.iLike]: `%${profession}%` } },
            { nameRu: { [Op.iLike]: `%${name}%` } },
          ],
        },
        limit: size,
        order: ['nameRu'],
      })
      .then(async (result) => {
        await this.cacheManager.set(
          `getPersonsAutosagest${JSON.stringify(params)}`,
          result,
        );
        return result;
      });
  }

  async getStaffByFilmId(params: GetStaffByFilmIdInterface): Promise<any> {
    const cache = await this.cacheManager.get(
      `getStaffByFilmId${JSON.stringify(params)}`,
    );
    if (cache) {
      return cache;
    }
    const staff: any[] = await this.personsFilmsRepository.findAll({
      raw: true,
      attributes: [['staffId', 'personId']],
      where: { filmId: params.id },
      limit: params.size,
    });
    return await this.personsRepository
      .findAll({
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
        where: {
          [Op.or]: staff,
        },
      })
      .then(async (result) => {
        await this.cacheManager.set(
          `getStaffByFilmId${JSON.stringify(params)}`,
          result,
        );
        return result;
      });
  }

  private getPagination(page: number, size: number): PaginationInterface {
    const limit: number = size ? +size : 10;
    const offset: number = page ? page * limit : 0;

    return { limit, offset };
  }

  async getFilmsIdByPersonId(personQuery: Array<any>) {
    const cache = await this.cacheManager.get(
      `getFilmsIdByPersonId${JSON.stringify(personQuery)}`,
    );
    if (cache) {
      return cache;
    }
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
      `getFilmsIdByPersonId${JSON.stringify(personQuery)}`,
      filmsId,
    );
    return filmsId;
  }
}
