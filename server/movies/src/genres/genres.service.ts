import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Genres } from './genres.model';
import { GenresFilms } from './genres.m2m.model';

@Injectable()
export class GenresService {
  constructor(
    @InjectModel(Genres) private genresRepository: typeof Genres,
    @InjectModel(GenresFilms) private genresFilmsRepository: typeof GenresFilms,
  ) {}

  async getGenresByFilmId(kinopoiskId: number) {
    return await this.genresFilmsRepository.findAll({
      where: { kinopoiskFilmId: kinopoiskId },
    });
  }

  async getCountryById(genreId: number) {
    return await this.genresRepository.findOne({ where: { id: genreId } });
  }
}
