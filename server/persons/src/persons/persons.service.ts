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

  async getPreviousStaffByFilmId(id: number): Promise<Persons[]> {
    const staff: any[] = await this.personsFilmsRepository.findAll({
      raw: true,
      attributes: [['staffId', 'personId']],
      where: { filmId: id },
      limit: 10,
    });
    return await this.personsRepository.findAll({
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
      where: {
        [Op.or]: staff,
      },
    });
  }

  async getPersonById(
    id: number,
  ): Promise<{ filmsId: PersonsFilms[]; person: Persons }> {
    const filmsId: PersonsFilms[] = await this.personsFilmsRepository.findAll({
      where: { staffId: id },
    });
    const person: Persons = await this.personsRepository.findOne({
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

  async getFilmsIdByPersonId(personQuery: Array<any>) {
    personQuery.map((el) => ({ [Op.and]: el }));

    // console.log(`new personQuery: ${JSON.stringify(personQuery)}`);

    const res: Array<{ id: number }> =
      await this.personsFilmsRepository.findAll({
        attributes: [['filmId', 'id']],
        where: {
          [Op.or]: personQuery,
        },
      });

    if (personQuery.length > 1) {
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
