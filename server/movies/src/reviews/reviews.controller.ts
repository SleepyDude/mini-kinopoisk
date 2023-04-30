import { Controller } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @MessagePattern({ cmd: 'create-review' })
  async createReview(@Payload() reviewData) {
    return await this.reviewsService.createReview(reviewData);
  }

  @MessagePattern({ cmd: 'delete-review' })
  async deleteReview(@Payload() reviewId: number) {
    return this.reviewsService.deleteReview(reviewId);
  }

  @MessagePattern({ cmd: 'get-reviews-byFilmId' })
  async getReviewsByFilmId(@Payload() filmIdQuery) {
    return this.reviewsService.getReviewsByFilmId(filmIdQuery);
  }
}
