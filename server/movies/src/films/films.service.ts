import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Films } from './films.model';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import sequelize, { Op } from 'sequelize';
import { Genres } from '../genres/genres.model';
import { Countries } from '../countries/countries.model';
import { Reviews } from '../reviews/reviews.model';

`***
У получения списка фильмов есть пагинация и поиск по русскому имени.
В получении фильма по айди стоит строгое ограничение на получение
комментариев, для показа остальных реализована другая функция.
Все связи с моделью фильмов реализовывать через поле kinopoiskId.
Функция фильтра работает с квери строкой, поля жанров и стран
могут быть накопительными, работают с оператором ИЛИ. В нем же
реализована сортировка и пагинация. Есть функция превью фильмов,
она нужна для модели персон. Отдельно есть функция для использования
автосаджеста на поиск по имени фильма.
***`;

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
        'kinopoiskId',
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
      include: [
        { all: true, attributes: { exclude: ['createdAt', 'updatedAt'] } },
        {
          model: Reviews,
          limit: 15,
          attributes: { exclude: ['updatedAt', 'userId', 'filmIdFK'] },
          where: { parentId: { [Op.is]: null } },
        },
      ],
      where: { kinopoiskId: id.id },
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
    const orderBy = [];
    let filmsIdByPerson = [];

    const { page, size, personId, profession } = params;
    const { limit, offset } = this.getPagination(page, size);

    for (const [key, value] of Object.entries(params)) {
      // если квери "год" или "тип" пушим ключ - значение с оператором И по умолчанию
      if (key === 'year' || key === 'type') {
        films.push({ [key]: value });
      }
      // Если "рейтинг" или "число голосов" то пушим с оператором >=
      if (key === 'ratingKinopoisk' || key === 'ratingKinopoiskVoteCount') {
        films.push({ [key]: { [Op.gte]: value } });
      }
      // жанры пушим чистым значением, в поиске подставим оператор Or
      if (key === 'genreId') {
        genres.push(value);
      }
      // Так же как и с жанрами
      if (key === 'countryId') {
        countries.push(value);
      }
      // ключ сортировки. Если поле nameRu - то пушим сортировку как по алфавиту, в других случая от большего к меньшему + сортировку по алфавиту
      if (key === 'orderBy') {
        orderBy.push(value === 'nameRu' ? [value] : [value, 'DESC'], [
          'nameRu',
          'ASC',
        ]);
      }
    }
    // Если в квери есть айди персоны
    if (personId) {
      // Получаем массив айди фильмов принадлежащих этой персоне с проверкой на профессию
      // проверка происходит в функции персон. Если персона не соответствует запросу то
      // мы получим null
      filmsIdByPerson = await lastValueFrom(
        this.moviesClient.send(
          { cmd: 'get-filmsId-byPersonId' },
          { staffId: personId, professionKey: profession },
        ),
      );
      //Если не вернулся объект с запроса, то данные не валидны. Ошибка в професии персоны
      if (filmsIdByPerson.length === 0) {
        return new HttpException(
          'Данная персона не соответствует профессии. Если вы уверены что это не так, данные отсутствуют в базе данных, сообщите об этом',
          HttpStatus.NOT_FOUND,
        );
      }
    }
    // Фильмы полученные от персон должны быть с оператором ИЛИ
    const whereQuery =
      filmsIdByPerson.length > 0
        ? { [Op.and]: films, [Op.or]: filmsIdByPerson }
        : { [Op.and]: films };

    const result = await this.filmsRepository.findAll({
      group: [
        'id',
        'kinopoiskId',
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
      attributes: [
        'id',
        'kinopoiskId',
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
      where: whereQuery,
      order: orderBy,
      include: [
        {
          model: Genres,
          where: { id: { [Op.or]: genres } },
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
        {
          model: Countries,
          where: { id: { [Op.or]: countries } },
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
      ],
      limit,
      offset,
    });
    return { count: result.length, result };
  }

  async getFilmsByIdPrevious(filmsId) {
    const films = [];

    for (const item of filmsId) {
      films.push(
        await this.filmsRepository.findAll({
          where: item.filmId,
          attributes: [
            'kinopoiskId',
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

  async filmsAutosagest(params) {
    const search = params.nameRu
      ? { nameRu: { [Op.iLike]: `%${params.nameRu}%` } }
      : { nameOriginal: { [Op.iLike]: `%${params.nameOriginal}%` } };
    return await this.filmsRepository.findAll({
      attributes: ['kinopoiskId', 'nameRu', 'nameOriginal'],
      where: search,
      limit: 10,
    });
  }

  private getPagination(page, size) {
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 0;

    return { limit, offset };
  }
}
