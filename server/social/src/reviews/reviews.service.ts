import { CreateReviewDto, HttpRpcException } from '@hotels2023nestjs/shared';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { Profile } from 'src/profiles/profiles.model';
import { ReviewChildParent } from './child-parent.m2m.model';
import { Review } from './reviews.model';

@Injectable()
export class ReviewsService {
    constructor(
        // @Inject('REVIEWS-SERVICE') private reviewsClient: ClientProxy,
        @InjectModel(Review) private reviewsRepository: typeof Review,
        // private sequelize: Sequelize,
        // @InjectModel(Films) private filmsRepository: typeof Films,
    ) {}

    async createReview(dto: CreateReviewDto, user_id: number) {
        console.log(`[social][reviews.service][createReview] dto: ${JSON.stringify(dto)}`);

        let { parent_id, parentPath } = dto;
        
        if (parent_id && parentPath) {
            parentPath += parent_id + '.';
        } else {
            parentPath = '';
        }

        
        const review = await this.reviewsRepository.create({
            profile_id: user_id, // Пока у нас инты, то id профиля и юзера равны
            ...dto,
        });
        return review;
        return [];
    }

        // const t = await this.sequelize.transaction();

        // try {
        //     const { parent_id } = dto;
        //     let depth = 0; // глубина по-умолчанию
        //     if (parent_id) {
        //         // проверим глубину родительского комментария
        //         const parent = await this.reviewsRepository.findByPk(parent_id, { attributes: ['depth'] });
        //         depth = parent.depth + 1; // глубина текущего комментария на 1 больше
        //     }

        //     // Создаем сам отзыв
        //     const review = await this.reviewsRepository.create({
        //         profile_id: user_id, // Пока у нас инты, то id профиля и юзера равны
        //         ...dto,
        //         depth: depth,
        //     }, {transaction: t});

        //     await this.m2mRepository.bulkCreate([
        //         { child_id  : "Nathan", lastName: "Sebhastian" },
        //     ])

        //     // Создаем его связи
        //     if (parent_id) {

        //         const pair = new ReviewChildParent({child_id: review.id, parent_id: dto.parent_id});
        //         pair.save();
                
        //     }
        //     return review;
        // } catch (error) {
        //     console.log(`ERROR\n\n${JSON.stringify(error)}\n\n`);
        //     throw new HttpRpcException('Ошибка при создании отзыва', HttpStatus.INTERNAL_SERVER_ERROR);
        // }

    async getReviewTreeByReviewId(review_id: number) {

    }


    async getReviewByReviewId(review_id: number) {
        
        // const getInc = (depth: number) => {
        //     if (!depth) return [];
        //     return [
        //         {model: Review, include: getInc(depth-1)},
        //         {model: Profile, attributes: ['username']},
        //     ];
        // }

        // return this.reviewsRepository.findByPk(review_id, {
        //     include: {model: Review},
        // });

        // const res = await this.reviewsRepository.findAll({
        //     include: [
        //         { 
        //             model: Review,
        //             // where: {
        //             //     child_id: review_id,
        //             // }
        //         }        
        //     ],
        //     where: {
        //         id: review_id,
        //     }
        // })
        // return res;
        return ['1','2'];
    }

    async getReviewsByProfileId(profile_id: number) {
        return this.reviewsRepository.findAll({
            where: {
                profile_id
            },
            include: [
                {model: Review },
                {model: Profile, attributes: ['id', 'username']},
            ]
        });
    }

    async getReviewsByFilmId(film_id: number) {
        return this.reviewsRepository.findAll({
            where: {
                film_id
            },
            include: [
                {model: Review },
                {model: Profile, attributes: ['id', 'username']},
            ]
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