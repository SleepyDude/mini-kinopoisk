import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PersonsFilms } from './persons.staff.m2m.model';
import { Persons } from './persons.model';
import { Op } from 'sequelize';
import {
  PersonsAutosagestGto,
  PersonsQueryDto,
  StaffQueryDto,
} from './dto/persons.query.dto';

@Injectable()
export class PersonsService {
  constructor(
    @InjectModel(PersonsFilms)
    private personsFilmsRepository: typeof PersonsFilms,
    @InjectModel(Persons) private personsRepository: typeof Persons,
  ) {}

  async getPersonById(id: number) {
    const filmsId: PersonsFilms[] = await this.personsFilmsRepository.findAll({
      attributes: [['filmId', 'id']],
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

  async getAllPersons(params: PersonsQueryDto) {
    const { page, size, name } = params;
    const condition = name ? { nameRu: { [Op.iLike]: `%${name}%` } } : null;
    const { limit, offset } = this.getPagination(page, size);

    return await this.personsRepository.findAndCountAll({
      where: condition,
      limit,
      offset,
    });
  }

  async getPersonsAutosagest(params: PersonsAutosagestGto) {
    const { profession, name, size = 10 } = params;
    return await this.personsRepository.findAndCountAll({
      attributes: ['personId', 'nameRu'],
      where: {
        [Op.and]: [
          { profession: { [Op.iLike]: `%${profession}%` } },
          { nameRu: { [Op.iLike]: `%${name}%` } },
        ],
      },
      limit: size,
    });
  }

  async getStaffByFilmId(params: StaffQueryDto): Promise<Persons[]> {
    const staff: any[] = await this.personsFilmsRepository.findAll({
      raw: true,
      attributes: [['staffId', 'personId']],
      where: { filmId: params.id },
      limit: params.size,
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

  private getPagination(page, size) {
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 0;

    return { limit, offset };
  }

  async getFilmsIdByPersonId(personQuery: Array<any>) {
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
