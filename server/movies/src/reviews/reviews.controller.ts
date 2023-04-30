import { Controller } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

`
CRUD по комментариям.
Создание комментария - DTO.
Создание комментария - имя пользователя будет приходить с фронта ?
Удаление кооментария только для админов и текущего юзера ?
Вывод комментарием превью
вывод всех комментариев с пагинацией
`;

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @MessagePattern({ cmd: 'create-review' })
  async createReview(@Payload() reviewData) {
    return await this.reviewsService.createReview(reviewData);
  }
}
