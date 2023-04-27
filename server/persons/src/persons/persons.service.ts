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
    return await this.personsRepository.findOne({ where: { personId: id } });
  }
}
