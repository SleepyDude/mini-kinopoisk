import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Genres } from './genres.model';
import { GenresFilms } from './genres.m2m.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { IGenresUpdate, HttpRpcException } from '@shared';
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
        if (!result) {
          throw new HttpRpcException(
            'Что то пошло не так',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        await this.cacheManager.set(`getAllGenres`, result);
        return result;
      });
  }

  async updateGenreById(genre: IGenresUpdate): Promise<any> {
    const genreDto: UpdateGenreDto = genre.genre;
    const currentGenre = await this.genresRepository.findOne({
      where: { id: genre.id },
    });
    if (!currentGenre) {
      throw new HttpRpcException(
        'Не удалось найти жанр по айди',
        HttpStatus.NOT_FOUND,
      );
    }
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
          return true;
        }
        throw new HttpRpcException(
          'Жанр с таким айди не найден',
          HttpStatus.BAD_REQUEST,
        );
      });
  }
}
