import { Controller, UseFilters } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateReviewDto, PaginationQueryDto } from '@shared/dto';
import { ServiceRpcFilter } from '@shared';

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
  async getReviewTreeByReviewId(
    @Payload('review_id') review_id: number,
    @Payload('depth') depth: number,
  ) {
    return await this.reviewsService.getReviewByReviewIdTree(review_id, depth);
  }

  @MessagePattern({ cmd: 'get-reviews-by-profile-id' })
  async getReviewsByProfileId(@Payload() profile_id: number) {
    return await this.reviewsService.getReviewsByProfileId(profile_id);
  }

  @MessagePattern({ cmd: 'get-reviews-by-film-id' })
  async getReviewsByFilmId(
    @Payload('filmId') filmId: number,
    @Payload('depth') depth?: number,
  ) {
    return await this.reviewsService.getReviewsByFilmId(filmId, depth);
  }

  @MessagePattern({ cmd: 'get-top-reviews-by-film-id' })
  async getTopReviewsByFilmId(
    @Payload('filmId') filmId: number,
    @Payload('paginationQueryDto') paginationQueryDto: PaginationQueryDto,
  ) {
    return await this.reviewsService.getTopReviewsByFilmId(
      filmId,
      paginationQueryDto,
    );
  }

  @MessagePattern({ cmd: 'delete-review-by-review-id' })
  async deleteReviewByReviewId(@Payload() review_id: number) {
    return await this.reviewsService.deleteReviewByReviewId(review_id);
  }
}
