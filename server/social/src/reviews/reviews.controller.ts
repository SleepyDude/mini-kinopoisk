import { Controller, UseFilters } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateReviewDto,
  ReviewQueryDto,
  ServiceRpcFilter,
} from '@hotels2023nestjs/shared';

@UseFilters(ServiceRpcFilter)
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @MessagePattern({ cmd: 'create-review' })
  async createReview(
    @Payload('dto') dto: CreateReviewDto,
    @Payload('user_id') user_id: number,
  ) {
    return await this.reviewsService.createReview(dto, user_id);
  }

  @MessagePattern({ cmd: 'get-review-by-review-id-single' })
  async getReviewByReviewId(@Payload() review_id: number) {
    return await this.reviewsService.getReviewByReviewIdSingle(review_id);
  }

  @MessagePattern({ cmd: 'get-review-by-review-id-tree' })
  async getReviewTreeByReviewId(@Payload() review_id: number) {
    return await this.reviewsService.getReviewByReviewIdTree(review_id);
  }

  @MessagePattern({ cmd: 'get-reviews-by-profile-id' })
  async getReviewsByProfileId(@Payload() profile_id: number) {
    return await this.reviewsService.getReviewsByProfileId(profile_id);
  }

  @MessagePattern({ cmd: 'get-reviews-by-film-id' })
  async getReviewsByFilmId(
    @Payload('film_id') film_id: number,
    @Payload('reviewQueryDto') reviewQueryDto: ReviewQueryDto,
  ) {
    return await this.reviewsService.getReviewsByFilmId(
      film_id,
      reviewQueryDto,
    );
  }

  @MessagePattern({ cmd: 'delete-review-by-review-id' })
  async deleteReviewByReviewId(@Payload() review_id: number) {
    return await this.reviewsService.deleteReviewByReviewId(review_id);
  }
}
