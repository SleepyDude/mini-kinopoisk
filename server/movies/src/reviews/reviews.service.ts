import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { InjectModel } from '@nestjs/sequelize';
import { Reviews } from './reviews.model';
import { Films } from '../films/films.model';

@Injectable()
export class ReviewsService {
  constructor(
    @Inject('REVIEWS-SERVICE') private reviewsClient: ClientProxy,
    @InjectModel(Reviews) private reviewsRepository: typeof Reviews,
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

    const thisReview = await this.reviewsRepository.create({
      ...review,
      userId: userId,
    });
    await currentFilm.$add('reviews', thisReview);
    return thisReview;
  }
}
