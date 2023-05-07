import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Genres } from './genres.model';
import { GenresFilms } from './genres.m2m.model';
import { UpdateGenreDto } from './dto/update.genre.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class GenresService {
  constructor(
    @InjectModel(Genres) private genresRepository: typeof Genres,
    @InjectModel(GenresFilms) private genresFilmsRepository: typeof GenresFilms,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getGenreById(genreId: number) {
    const cache = await this.cacheManager.get(
      `getGenreById${JSON.stringify(genreId)}`,
    );
    if (cache) {
      return cache;
    }
    return await this.genresRepository
      .findOne({ where: { id: genreId } })
      .then(async (result) => {
        await this.cacheManager.set(
          `getGenreById${JSON.stringify(genreId)}`,
          result,
        );
        return result;
      });
  }

  async getAllGenres() {
    const cache = await this.cacheManager.get(`getAllGenres`);
    if (cache) {
      return cache;
    }
    return await this.genresRepository
      .findAll({
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      })
      .then(async (result) => {
        await this.cacheManager.set(`getAllGenres`, result);
        return result;
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
