import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {Countries} from "./countries.model";
import {CountriesFilms} from "./countries.m2m.model";

@Injectable()
export class CountriesService {
    constructor(
        @InjectModel(Countries) private countriesRepository: typeof Countries,
        @InjectModel(CountriesFilms) private countriesFilmsRepository: typeof CountriesFilms,
    ) {}

    async createCountry(countries) {
        for ( let country of countries ) {
            console.log('++', country);
            let isCountry = await this.countriesRepository.findOne({ where: { countryNameRu: country.country } });
            if ( isCountry ) {
                await this.countriesFilmsRepository.create({kinopoiskFilmId: country.filmId, countryId: isCountry.id});
                continue;
            }
            let currentCountry = await this.countriesRepository.create({countryNameRu: country.country});
            await this.countriesFilmsRepository.create({kinopoiskFilmId: country.filmId, countryId: currentCountry.id});
        }
    }
}
