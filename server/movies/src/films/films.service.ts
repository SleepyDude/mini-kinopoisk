import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {Films} from "./films.model";

@Injectable()
export class FilmsService {

    constructor(
        @InjectModel(Films) private filmsRepository: typeof Films,
    ) {}
    async getAllFilms() {
        return await this.filmsRepository.findAll();
    }

    async getFilmById(id) {
        let result = [];
        let currentCountries = [];
        let currentGenres = [];
        `Должен вернуть:
        фильм
        страны
        жанры
        актеров`

        const currentFilm = await this.filmsRepository.findOne({ where: { kinopoiskId: id } });

        const currentCountriesId =
        for ( let countryId of currentCountriesId ) {
            currentCountries.push(await this.countriesRepository.findOne({
                where : { id: countryId.countryId };
            }));
        }

        const currentGenresId = await this.genresFilmsRepository.findAll({
            where: { kinopoiskFilmId: currentFilm.kinopoiskId }
        });
        for ( let genreId of currentGenresId ) {
            currentGenres.push(await this.genresRepository.findOne({
                where : { id: genreId.genreId }
            }));
        }

        const
    }
}
