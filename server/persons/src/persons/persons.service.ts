import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PersonsFilms } from './persons.staff.m2m.model';
import { Persons } from './persons.model';
import { Op } from 'sequelize';

@Injectable()
export class PersonsService {
  constructor(
    @InjectModel(PersonsFilms)
    private personsFilmsRepository: typeof PersonsFilms,
    @InjectModel(Persons) private personsRepository: typeof Persons,
  ) {}

  async getStaffByFilmIdPrevious(id) {
    const actors = [];
    const staff = await this.personsFilmsRepository.findAll({
      where: { filmId: id },
      limit: 10,
    });
    for (const personId of staff) {
      actors.push({
        professionText: personId.professionText,
        professionKey: personId.professionKey,
        person: await this.personsRepository.findOne({
          attributes: {
            exclude: ['createdAt', 'updatedAt'],
          },
          where: { personId: personId.staffId },
        }),
      });
    }

    return actors;
  }

  async getPersonById(id) {
    const filmsId = await this.personsFilmsRepository.findAll({
      where: { staffId: id },
    });
    const person = await this.personsRepository.findOne({
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
      where: { personId: id },
    });
    return {
      filmsId: filmsId,
      person: person,
    };
  }

  async getAllPersons(params) {
    const { page, size, name } = params;
    const condition = name ? { nameRu: { [Op.iLike]: `%${name}%` } } : null;
    const { limit, offset } = this.getPagination(page, size);

    return await this.personsRepository.findAndCountAll({
      where: condition,
      limit,
      offset,
    });
  }

  async getStaffByFilmId(id) {
    const actors = [];
    const staff = await this.personsFilmsRepository.findAll({
      where: { filmId: id },
    });
    for (const personId of staff) {
      actors.push({
        professionText: personId.professionText,
        professionKey: personId.professionKey,
        person: await this.personsRepository.findOne({
          attributes: {
            exclude: ['createdAt', 'updatedAt'],
          },
          where: { personId: personId.staffId },
        }),
      });
    }
    return actors;
  }

  async getPersonsAutosagest(params) {
    const { profession, name } = params;
    return await this.personsRepository.findAndCountAll({
      attributes: ['personId', 'nameRu'],
      where: {
        [Op.and]: [
          { profession: { [Op.iLike]: `%${profession}%` } },
          { nameRu: { [Op.iLike]: `%${name}%` } },
        ],
      },
      limit: 10,
    });
  }

  private getPagination(page, size) {
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 0;

    return { limit, offset };
  }

  async getFilmsIdByPersonId(personQuery) {
    const res: Array<{ id: number }> =
      await this.personsFilmsRepository.findAll({
        attributes: [['filmId', 'id']],
        where: {
          [Op.or]: personQuery,
        },
      });

    if (personQuery > 1) {
      const temp = new Map<number, number>();
      return res.filter((val) => {
        if (temp.has(val.id)) {
          return true;
        }
        temp.set(val.id, 1);
        return false;
      });
    }
    return res;
  }
}
