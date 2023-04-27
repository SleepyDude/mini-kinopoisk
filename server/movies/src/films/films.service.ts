import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Films } from './films.model';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Op } from 'sequelize';
import { Genres } from '../genres/genres.model';
import { Countries } from '../countries/countries.model';

@Injectable()
export class FilmsService {
  constructor(
    @Inject('MOVIES-SERVICE') private moviesClient: ClientProxy,
    @InjectModel(Films) private filmsRepository: typeof Films,
  ) {}
  async getAllFilms(params) {
    const { page, size, name } = params;
    const condition = name ? { nameRu: { [Op.iLike]: `%${name}%` } } : null;
    const { limit, offset } = this.getPagination(page, size);

    return await this.filmsRepository.findAndCountAll({
      attributes: [
        'id',
        'nameRu',
        'nameOriginal',
        'posterUrl',
        'posterUrlPreview',
        'coverUrl',
        'logoUrl',
        'ratingKinopoisk',
        'year',
        'filmLength',
      ],
      include: [
        {
          model: Genres,
          attributes: ['id', 'genreNameRu', 'genreNameEng'],
        },
        {
          model: Countries,
          attributes: ['id', 'countryNameRu', 'countryNameEng'],
        },
      ],
      where: condition,
      limit,
      offset,
    });
  }

  async getFilmById(id) {
    const currentFilm = await this.filmsRepository.findOne({
      attributes: {
        exclude: [
          'reviewsCount',
          'ratingGoodReview',
          'ratingGoodReviewVoteCount',
          'ratingFilmCritics',
          'ratingFilmCriticsVoteCount',
          'serial',
          'shortFilm',
          'createdAt',
          'updatedAt',
        ],
      },
      include: { all: true },
      where: { id: id.id },
    });
    const currentStaff = await lastValueFrom(
      this.moviesClient.send({ cmd: 'get-staff-previous' }, currentFilm.id),
    );
    return {
      currentFilm,
      currentStaff,
    };
  }

  async getFilmsByFilers(params) {
    const films = [];
    const genres = [];
    const countries = [];

    const { page, size } = params;
    const { limit, offset } = this.getPagination(page, size);

    for (const [key, value] of Object.entries(params)) {
      if (key === 'year' || key === 'type') {
        films.push({ [key]: value });
      }
      if (key === 'ratingKinopoisk' || key === 'ratingKinopoiskVoteCount') {
        films.push({ [key]: { [Op.gte]: value } });
      }

      if (key === 'genreId') {
        genres.push(value);
      }

      if (key === 'countryId') {
        countries.push(value);
      }
    }

    return this.filmsRepository.findAndCountAll({
      attributes: [
        'id',
        'nameRu',
        'nameOriginal',
        'ratingKinopoiskVoteCount',
        'posterUrl',
        'posterUrlPreview',
        'coverUrl',
        'logoUrl',
        'ratingKinopoisk',
        'year',
        'filmLength',
        'type',
      ],
      where: films,
      include: [
        {
          model: Genres,
          where: { id: { [Op.or]: genres } },
        },
        {
          model: Countries,
          where: { id: { [Op.or]: countries } },
        },
      ],
      limit,
      offset,
    });
  }

  async getFilmsByIdPrevious(filmsId) {
    const films = [];
    for (const item of filmsId) {
      films.push(
        await this.filmsRepository.findAll({
          where: item.id,
          attributes: [
            'id',
            'year',
            'nameRu',
            'nameOriginal',
            'posterUrl',
            'posterUrlPreview',
            'coverUrl',
            'logoUrl',
            'ratingKinopoisk',
          ],
        }),
      );
    }
    return films;
  }

  private getPagination(page, size) {
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 0;

    return { limit, offset };
  }
}
