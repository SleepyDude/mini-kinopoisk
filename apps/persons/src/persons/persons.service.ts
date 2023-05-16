import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PersonsFilms } from './persons.staff.m2m.model';
import { Persons } from './persons.model';
import { Op } from 'sequelize';
import {
  PersonsAutosagestGto,
  PersonsQueryDto,
  StaffQueryDto,
} from './dto/persons.query.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { HttpRpcException } from '@shared';

@Injectable()
export class PersonsService {
  constructor(
    @InjectModel(PersonsFilms)
    private personsFilmsRepository: typeof PersonsFilms,
    @InjectModel(Persons) private personsRepository: typeof Persons,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getPersonById(id: number) {
    const cache = await this.cacheManager.get(
      `getPersonById${JSON.stringify(id)}`,
    );
    if (cache) {
      return cache;
    }
    const person: Persons = await this.personsRepository.findOne({
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
      where: { personId: id },
    });
    if (!person) {
      throw new HttpRpcException(
        'Такой айди не зарегистрирован',
        HttpStatus.NOT_FOUND,
      );
    }
    const filmsId: PersonsFilms[] = await this.personsFilmsRepository.findAll({
      attributes: [['filmId', 'id']],
      where: { staffId: id },
    });
    await this.cacheManager.set(`getPersonById${JSON.stringify(id)}`, {
      filmsId: filmsId,
      person: person,
    });
    return {
      filmsId: filmsId,
      person: person,
    };
  }

  async getAllPersons(params: PersonsQueryDto) {
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

  async getPersonsAutosagest(params: PersonsAutosagestGto) {
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
      })
      .then(async (result) => {
        await this.cacheManager.set(
          `getPersonsAutosagest${JSON.stringify(params)}`,
          result,
        );
        return result;
      });
  }

  async getStaffByFilmId(params: StaffQueryDto) {
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

  private getPagination(page, size) {
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 0;

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
