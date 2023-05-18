import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Genres } from './genres.model';
import { GenresFilms } from './genres.m2m.model';
import { UpdateGenreDto } from './dto/update.genre.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GenresUpdateInterface } from '@shared';

@Injectable()
export class GenresService {
  constructor(
    @InjectModel(Genres) private genresRepository: typeof Genres,
    @InjectModel(GenresFilms) private genresFilmsRepository: typeof GenresFilms,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getGenreById(genreId: number): Promise<any> {
    const cache = await this.cacheManager.get(
      `getGenreById${JSON.stringify(genreId)}`,
    );
    if (cache) {
      return cache;
    }
    return await this.genresRepository
      .findOne({ where: { id: genreId } })
      .then(async (result) => {
        if (!result) {
          return new HttpException(
            'Айди не зарегистрирован',
            HttpStatus.NOT_FOUND,
          );
        }
        await this.cacheManager.set(
          `getGenreById${JSON.stringify(genreId)}`,
          result,
        );
        return result;
      });
  }

  async getAllGenres(): Promise<any> {
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

  async updateGenreById(genre: GenresUpdateInterface) {
    const genreDto: UpdateGenreDto = genre.genre;
    const currentGenre = await this.genresRepository.findOne({
      where: { id: genre.id },
    });
    await currentGenre.update(genreDto);
    return currentGenre;
  }

  async deleteGenreById(genreId: number) {
    const currentGenre = await this.genresRepository.findOne({
      where: { id: genreId },
    });
    return currentGenre.destroy();
  }
}
