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

  async getGenreById(genreId: number) {
    return await this.genresRepository.findOne({ where: { id: genreId } });
  }

  async getAllGenres() {
    return await this.genresRepository.findAll();
  }
}
