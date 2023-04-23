import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PersonsFilms } from './persons.staff.m2m.model';
import { Persons } from './persons.model';

@Injectable()
export class PersonsService {
  constructor(
    @InjectModel(PersonsFilms)
    private personsFilmsRepository: typeof PersonsFilms,
    @InjectModel(Persons) private personsRepository: typeof Persons,
  ) {}

  async getStaffByFilmId(id) {
    const actors = [];
    const staff = await this.personsFilmsRepository.findAll({
      where: { kinopoiskFilmId: id },
    });
    console.log('+++++', staff);
    for (const personId of staff) {
      const person = await this.getPersonById(personId.personId);
      actors.push({
        personId: personId.personId,
        professionText: personId.professionText,
        professionKey: personId.professionKey,
        person: person,
      });
    }
    return actors;
  }

  async getPersonById(id) {
    return await this.personsRepository.findOne({ where: { personId: id } });
  }
}
