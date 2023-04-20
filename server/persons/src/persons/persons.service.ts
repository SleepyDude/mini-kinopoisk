import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {Persons} from "./persons.model";
import {PersonsFilms} from "./persons.staff.m2m.model";
import {CreatePersonDto} from "./dto/create.person.dto";

@Injectable()
export class PersonsService {
    constructor(
        @InjectModel(Persons) private personsRepository: typeof Persons,
        @InjectModel(PersonsFilms) private personsFilmsRepository: typeof PersonsFilms,
    ) {
    }
    async createStaff(staff) {
        for ( let person of staff.items ) {
            await this.personsFilmsRepository.create({
                kinopoiskFilmId: staff.filmId,
                personId: person.staffId,
                professionText: person.professionText,
                professionKey: person.professionKey,
            });
        }
    }

    async createPerson(person: CreatePersonDto) {
        if ( !await this.personsRepository.findOne({ where: { personId: person.personId } })) {
            await this.personsRepository.create(person);
        }
    }
}
