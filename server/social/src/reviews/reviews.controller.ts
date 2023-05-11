import { Controller } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateReviewDto } from '@hotels2023nestjs/shared';

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

  @MessagePattern({ cmd: 'get-review-by-review-id' })
  async getReviewByReviewId(@Payload() review_id: number) {
    return await this.reviewsService.getReviewByReviewId(review_id);
  }

  @MessagePattern({ cmd: 'get-reviews-by-profile-id' })
  async getReviewsByProfileId(@Payload() profile_id: number) {
    return await this.reviewsService.getReviewsByProfileId(profile_id);
  }

  @MessagePattern({ cmd: 'get-reviews-by-film-id' })
  async getReviewsByFilmId(@Payload() film_id: number) {
    return await this.reviewsService.getReviewsByFilmId(film_id);
  }

  @MessagePattern({ cmd: 'delete-review-by-review-id' })
  async deleteReviewByReviewId(@Payload() review_id: number) {
    return await this.reviewsService.deleteReviewByReviewId(review_id);
  }
}
