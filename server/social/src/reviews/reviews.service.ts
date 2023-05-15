import {
  CreateReviewDto,
  HttpRpcException,
  ReviewModelAttrs,
  ReviewQueryDto,
  // ReviewQueryDto,
} from '@hotels2023nestjs/shared';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FindOptions, Op, WhereOptions } from 'sequelize';
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
    // console.log(
    //   `collapse tree reviews: ${JSON.stringify(reviews, undefined, 2)}`,
    // );
    let i = 0;
    const roots = [];
    const reviewStack = [];

    if (!reviews.length) return [];

    const rootPath = reviews[0].path;
    while (i < reviews.length) {
      if (rootPath !== reviews[i].path) break;
      const review = new ReviewWithChilds(reviews[i]);
      roots.push(review);
      reviewStack.push(review);
      i += 1;
    }

    reviewStack.reverse();

    // console.log(`start reviewStack = ${reviewStack}`);

    while (true) {
      if (i === reviews.length) break;
      // Достаем очередное значение review из списка
      const review = new ReviewWithChilds(reviews[i]);
      // console.log(`processing review: ${JSON.stringify(review)}`);

      // if (!reviewStack.length) {
      //   reviewStack.push(review);
      //   results.push(review);
      //   i += 1;
      //   continue;
      // }

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
          // reviewStack.length &&
          reviewStack[reviewStack.length - 1].id !== review.parent_id
        ) {
          reviewStack.pop();
        }
      }
    }

    if (findOne) return roots[0];
    return roots;
  }

  async getReviewByReviewIdTree(review_id: number, depth: number) {
    // console.log(
    //   `\n\n[reviews.service][gerReviewTree] review_id: ${JSON.stringify(
    //     review_id,
    //   )}\n\n`,
    // );
    const parentReview = await this.reviewsRepository.findByPk(review_id, {
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

    const pathToStart = `${parentReview.path}${review_id}.`;
    console.log(pathToStart);

    const whereOptions: WhereOptions<ReviewModelAttrs> = {
      path: {
        [Op.startsWith]: pathToStart,
      },
      film_id: parentReview.film_id,
    };

    if (depth !== undefined) {
      // console.log(`depth != undef: ${depth}`);
      whereOptions.depth = {
        [Op.lte]: parentReview.depth + depth,
      };
    }

    if (!parentReview) {
      throw new HttpRpcException('Комментарий не найден', HttpStatus.NOT_FOUND);
    }

    const reviews = await this.reviewsRepository.findAll({
      where: whereOptions,
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

    return this.collapseTree([parentReview, ...reviews], true);
  }

  async getReviewsByFilmId(film_id: number, reviewQueryDto: ReviewQueryDto) {
    const { size, depth } = reviewQueryDto;
    let { page } = reviewQueryDto;
    console.log(
      `[reviews.service] size: ${size} page: ${page} depth: ${depth}`,
    );
    let offset = 0;
    if (size) {
      if (page === undefined) page = 0;
      offset = page * size;
    }

    const where = {
      film_id: film_id,
    } as { film_id: number; depth: any };

    if (depth) {
      where.depth = {
        [Op.lte]: depth,
      };
    }

    const reviews = await this.reviewsRepository.findAll({
      where: where,
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

  async getTopReviewsByFilmId(film_id: number, reviewQueryDto: ReviewQueryDto) {
    const { size, page } = reviewQueryDto;

    const findOptions: FindOptions<ReviewModelAttrs> = {
      where: {
        film_id: film_id,
        depth: 0,
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
    };

    if (size) {
      findOptions.limit = size;
      if (page === undefined) findOptions.offset = 0;
      findOptions.offset = page * size;
    }

    const reviews = await this.reviewsRepository.findAndCountAll(findOptions);
    // const rows = this.collapseTree(reviews.rows);
    return reviews;
    // return { rows: rows, count: reviews.count };
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
