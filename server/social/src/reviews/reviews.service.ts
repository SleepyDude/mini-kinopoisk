import {
  CreateReviewDto,
  HttpRpcException,
  ReviewModelWithProfileAndChilds,
} from '@hotels2023nestjs/shared';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
// import { Sequelize } from 'sequelize';
import { Profile } from '../../models/profiles.model';
// import { ReviewChildParent } from './child-parent.m2m.model';
import { Review } from '../../models/reviews.model';
import { ReviewWithChilds } from './review-with-childs';

@Injectable()
export class ReviewsService {
  constructor(
    // @Inject('REVIEWS-SERVICE') private reviewsClient: ClientProxy,
    @InjectModel(Review) private reviewsRepository: typeof Review, // private sequelize: Sequelize, // @InjectModel(Films) private filmsRepository: typeof Films,
  ) {}

  async createReview(dto: CreateReviewDto, user_id: number) {
    const { parent_id } = dto;
    let parentPath = ''; // parentPath по умолчанию
    let parentDepth = 0;
    let parent: Review = undefined;

    if (parent_id !== undefined) {
      parent = await this.reviewsRepository.findByPk(parent_id);
      if (!parent) {
        throw new HttpRpcException(
          `Отзыв с parent_id = ${parent_id} не найден`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (dto.film_id !== undefined && parent.film_id !== dto.film_id) {
        throw new HttpRpcException(
          `film_id родительского отзыва должен совпадать с film_id текущего отзыва, если последний задан`,
          HttpStatus.BAD_REQUEST,
        );
      }

      parentPath = parent.path + parent.id + '.';
      parentDepth = parent.depth + 1;
    }

    const review = await this.reviewsRepository.create({
      profile_id: user_id, // Пока у нас инты, то id профиля и юзера равны
      ...dto,
      path: parentPath,
      childsNum: 0,
      depth: parentDepth,
    });

    if (parent) {
      parent.set('childsNum', parent.childsNum + 1); // Добавить после обновления модели
      await parent.save();
    }

    return review;
  }

  async getReviewByReviewIdSingle(review_id: number) {
    const review = await this.reviewsRepository.findByPk(review_id, {
      include: {
        model: Profile,
        attributes: {
          exclude: ['user_id', 'createdAt', 'updatedAt'],
        },
      },
      attributes: {
        exclude: ['profile_id'],
      },
    });
    if (!review) {
      throw new HttpRpcException('Комментарий не найден', HttpStatus.NOT_FOUND);
    }
    return review;
  }

  private async collapseTree(reviews: Review[], findOne = false) {
    // Если у нас выбран только один элемент (корневой родитель) - его и возвращаем
    let i = 0;

    const results = [];

    const reviewStack = [];

    while (true) {
      if (i === reviews.length) break;
      // Достаем очередное значение review из списка
      const review = new ReviewWithChilds(reviews[i]);
      // console.log(`processing review: ${JSON.stringify(review)}`);

      if (!reviewStack.length) {
        reviewStack.push(review);
        results.push(review);
        i += 1;
        continue;
      }

      if (reviewStack[reviewStack.length - 1].id === review.parent_id) {
        reviewStack[reviewStack.length - 1].childs.push(review);
        i += 1;
      } else {
        const fullParent = reviewStack.pop();
        // Его дети могут также иметь детей, заносим их в стек в обратном порядке
        for (let j = fullParent.childs.length - 1; j >= 0; j--) {
          reviewStack.push(fullParent.childs[j]);
        }
        // Скипаем сверху тех из них, которые не являются родителем текущему или пока стек не опустеет
        while (
          reviewStack.length &&
          reviewStack[reviewStack.length - 1].id !== review.parent_id
        ) {
          reviewStack.pop();
        }
      }
    }

    if (findOne) return results[0];
    return results;
  }

  async getReviewByReviewIdTree(review_id: number) {
    const parentReview = await this.reviewsRepository.findByPk(review_id, {
      attributes: ['path', 'film_id'],
    });

    if (!parentReview) {
      throw new HttpRpcException('Комментарий не найден', HttpStatus.NOT_FOUND);
    }

    const reviews = await this.reviewsRepository.findAll({
      where: {
        path: {
          [Op.startsWith]: parentReview.path,
        },
        film_id: parentReview.film_id,
      },
      include: {
        model: Profile,
        attributes: {
          exclude: ['user_id', 'createdAt', 'updatedAt'],
        },
      },
      attributes: {
        exclude: ['profile_id'],
      },
      order: [
        // ['depth', 'ASC'],
        // ['createdAt', 'DESC'],
        ['path', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });

    return this.collapseTree(reviews, true);
  }

  async getReviewsByFilmId(film_id: number) {
    const reviews = await this.reviewsRepository.findAll({
      where: {
        film_id: film_id,
      },
      include: {
        model: Profile,
        attributes: {
          exclude: ['user_id', 'createdAt', 'updatedAt'],
        },
      },
      attributes: {
        exclude: ['profile_id'],
      },
      order: [
        ['path', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });
    return this.collapseTree(reviews);
  }

  async getReviewsByProfileId(profile_id: number) {
    return this.reviewsRepository.findAll({
      where: {
        profile_id,
      },
      include: [
        { model: Review },
        { model: Profile, attributes: ['id', 'username'] },
      ],
    });
  }

  async deleteReviewByReviewId(review_id: number) {
    const review = await this.reviewsRepository.findByPk(review_id);
    review.set('text', 'Комментарий удален');
    review.set('title', null);
    review.save();
    return review;
  }
}
