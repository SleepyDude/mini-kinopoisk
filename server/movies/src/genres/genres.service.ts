import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {Genres} from "./genres.model";
import {GenresFilms} from "./genres.m2m.model";

@Injectable()
export class GenresService {
    constructor(
        @InjectModel(Genres) private genresRepository: typeof Genres,
        @InjectModel(GenresFilms) private genresFilmsRepository: typeof GenresFilms,
    ) {}

    async createGenres(genres) {
        for ( let genre of genres ) {
            let isGenre = await this.genresRepository.findOne({ where: { genreNameRu: genre.genre } });
            if ( isGenre ) {
                await this.genresFilmsRepository.create({ kinopoiskFilmId: genre.filmId, genreId: isGenre.id });
                continue;
            }
            let currentGenre = await this.genresRepository.create({ genreNameRu: genre.genre });
            await this.genresFilmsRepository.create({ kinopoiskFilmId: genre.filmId, genreId: currentGenre.id });
        }
    }
}
