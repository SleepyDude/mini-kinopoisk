import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Genres } from './genres.model';
import { GenresFilms } from './genres.m2m.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GenresUpdateInterface } from '@shared';
import { UpdateGenreDto } from '@shared/dto';

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
    return await this.genresRepository
      .destroy({
        where: { id: genreId },
      })
      .then((result) => {
        if (result) {
          return 'Жанр был удален';
        } else {
          return new HttpException(
            'Удаление не удалось',
            HttpStatus.BAD_REQUEST,
          );
        }
      });
  }
}
