import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {PersonsFilms} from "./persons.staff.m2m.model";
import {Persons} from "./persons.model";

@Injectable()
export class PersonsService {

    constructor(
        @InjectModel(PersonsFilms) private personsFilmsRepository: typeof PersonsFilms,
        @InjectModel(Persons) private personsRepository: typeof Persons,
    ) {}

    async getCardPersonById(id) {

    }

    async getStaffByFilmId(id) {
        return await this.personsFilmsRepository.findAll({ where: { kinopoiskFilmId : id } });
    }

    async getPersonById(id) {
        return await this.personsRepository.findOne({ where: { personId : id } });
    }
}
