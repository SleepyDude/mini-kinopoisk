import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Genres } from './genres.model';
import { GenresFilms } from './genres.m2m.model';
import { UpdateGenreDto } from './dto/update.genre.dto';

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
    return await this.genresRepository.findAll({
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
    });
  }

  async updateGenreById(genre) {
    const genreDto: UpdateGenreDto = genre.genre;
    const currentGenre = await this.genresRepository.findOne({
      where: { id: genre.id },
    });
    await currentGenre.update(genreDto);
    return currentGenre;
  }

  async deleteGenreById(id) {
    const currentGenre = await this.genresRepository.findOne({
      where: id,
    });
    return currentGenre.destroy();
  }
}
