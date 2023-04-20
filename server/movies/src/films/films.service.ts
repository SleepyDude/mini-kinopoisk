import { Injectable } from '@nestjs/common';
import {CreateFilmDto} from "./dto/create.film.dto";
import {InjectModel} from "@nestjs/sequelize";
import {Films} from "./films.model";
import {SimilarFilms} from "./films.similar.m2m.model";

@Injectable()
export class FilmsService {
    constructor(
        @InjectModel(Films) private filmsRepository: typeof Films,
        @InjectModel(SimilarFilms) private similarFilmsRepository: typeof SimilarFilms,
    ) {
    }

    async createFilm(filmDto: CreateFilmDto) {
        return this.filmsRepository.create(filmDto);
    }

    async createSimilar(similar) {
        for ( let item of similar.items ) {
            await this.similarFilmsRepository.create({ kinopoiskId: similar.currentFilmId, similarFilmId: item.filmId });
        }
    }
}
