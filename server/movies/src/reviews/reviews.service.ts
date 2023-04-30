import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { InjectModel } from '@nestjs/sequelize';
import { Reviews } from './reviews.model';
import { Films } from '../films/films.model';
import { Op } from 'sequelize';

`***
Для создания коментария нужены реквест - проверка на логин,
айди фильма из параметров строки, тело коментария.
Если у коментария имеется поле parentId, то находим по нему
комментарий, и устанавливаем для него дочерний коментарий.
Это нужно что бы в массиве было правильное отображение
принадлежности.
Функция вывода коментариев работает по лимиту, что бы
коментарии повторно не отображались стоит дополнительный
поиск по полю parentId = is null.
***`;

@Injectable()
export class ReviewsService {
  constructor(
    @Inject('REVIEWS-SERVICE') private reviewsClient: ClientProxy,
    @InjectModel(Reviews) private parentReviewsRepository: typeof Reviews,
    @InjectModel(Films) private filmsRepository: typeof Films,
  ) {}
  async createReview(reviewData) {
    const { review, filmId, req } = reviewData;

    if (!req.refreshToken) {
      return new HttpException(
        'Что бы оставить комментарий войдите или зарегистрируйтесь',
        HttpStatus.NOT_FOUND,
      );
    }

    const currentFilm = await this.filmsRepository.findOne({
      where: { kinopoiskId: filmId },
    });
    const userId = await lastValueFrom(
      this.reviewsClient.send({ cmd: 'get_id_by_token' }, req.refreshToken),
    );
    const thisReview = await this.parentReviewsRepository.create({
      ...review,
      userId: userId,
      filmId: filmId,
    });
    await currentFilm.$add('reviews', thisReview);

    if (review.parentId) {
      const parentReview = await this.parentReviewsRepository.findOne({
        where: { id: review.parentId },
      });
      await parentReview.$add('reviews', thisReview);
    }

    return thisReview;
  }

  async deleteReview(reviewId: number) {
    const currentReview = await this.parentReviewsRepository.findOne({
      where: { id: reviewId },
    });
    return await currentReview.destroy();
  }

  async getReviewsByFilmId(filmIdQuery) {
    const { filmId, query } = filmIdQuery;

    return await this.parentReviewsRepository.findAndCountAll({
      attributes: { exclude: ['filmIdFK', 'updatedAt', 'parentId', 'userId'] },
      where: [{ filmId: filmId.filmId }, { parentId: { [Op.is]: null } }],
      include: {
        model: Reviews,
        attributes: { exclude: ['updatedAt', 'filmIdFK', 'userId'] },
      },
      limit: query.size,
    });
  }

  private getPagination(page, size) {
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 0;

    return { limit, offset };
  }
}
