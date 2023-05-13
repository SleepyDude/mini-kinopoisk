import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AllExceptionsFilter } from '../filters/all.exceptions.filter';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateReviewDto,
  ReviewModelWithProfile,
  ReviewModelWithProfileAndChilds,
} from '@hotels2023nestjs/shared';
import { RolesGuard } from '../guards/roles.guard';
import { DtoValidationPipe } from '../pipes/dto-validation.pipe';
import { ReviewModelReturnAttrs } from '@hotels2023nestjs/shared';
import { UserData } from '../decorators/user-data.decorator';

@UseFilters(AllExceptionsFilter)
@ApiTags('Работа с отзывами')
@Controller('reviews')
export class ReviewsController {
  constructor(@Inject('SOCIAL-SERVICE') private socialService: ClientProxy) {}

  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Создание отзыва' })
  @ApiResponse({
    status: 201,
    type: ReviewModelReturnAttrs,
    description:
      'Создание нового отзыва, id пользователя берется из токена авторизации',
  })
  @Post()
  async createReview(
    @UserData('id') user_id: number,
    @Body(DtoValidationPipe) dto: CreateReviewDto,
  ) {
    // console.log(
    //   `[api][reviews.controller][createReview] dto: ${JSON.stringify(
    //     dto,
    //   )} user_id: ${user_id} `,
    // );
    return this.socialService.send({ cmd: 'create-review' }, { dto, user_id });
  }

  @ApiOperation({ summary: 'Получение изолированного отзыва по его id' })
  @ApiResponse({
    status: 200,
    type: ReviewModelWithProfile,
    description: 'Отзыв без потомков с данными профиля',
  })
  @Get('single/:review_id')
  async getReviewByReviewId(
    @Param('review_id', ParseIntPipe) review_id: number,
  ) {
    return this.socialService.send(
      { cmd: 'get-review-by-review-id-single' },
      review_id,
    );
  }

  @ApiOperation({
    summary: 'Получение дерева отзывов по id отзыва верхнего уровня',
  })
  @ApiResponse({
    status: 200,
    type: ReviewModelWithProfileAndChilds,
    description: 'Древовидная структура отзывов и их детей',
  })
  @Get('tree/:review_id')
  async getReviewTreeByReviewId(
    @Param('review_id', ParseIntPipe) review_id: number,
  ) {
    return this.socialService.send(
      { cmd: 'get-review-by-review-id-tree' },
      review_id,
    );
  }

  // @ApiOperation({
  //   summary: 'Получение всех отзывов пользователя по id его профиля',
  // })
  // @ApiResponse({
  //   status: 200,
  //   type: [ReviewModelReturnAttrs],
  //   description: 'Массив отзывов со всеми своими потомками',
  // })
  // @Get('profile/:profile_id')
  // async getReviewsByProfileId(
  //   @Param('profile_id', ParseIntPipe) profile_id: number,
  // ) {
  //   return this.socialService.send(
  //     { cmd: 'get-reviews-by-profile-id' },
  //     profile_id,
  //   );
  // }

  @ApiOperation({ summary: 'Получение всех отзывов по id фильма' })
  @ApiResponse({
    status: 200,
    type: [ReviewModelWithProfileAndChilds],
    description: 'Массив отзывов со всеми своими потомками',
  })
  @Get('film/:film_id')
  async getReviewsByFilmId(@Param('film_id', ParseIntPipe) film_id: number) {
    return this.socialService.send({ cmd: 'get-reviews-by-film-id' }, film_id);
  }

  // @UseGuards(RolesGuard)
  // @ApiOperation({ summary: 'Удаление отзыва (сам отзыв остается)' })
  // @ApiResponse({
  //   status: 200,
  //   type: ReviewModelReturnAttrs,
  //   description: 'Измененный отзыв',
  // })
  // @Delete(':review_id')
  // async deleteReviewByReviewId(
  //   @Param('film_id', ParseIntPipe) film_id: number,
  // ) {
  //   return this.socialService.send(
  //     { cmd: 'delete-review-by-review-id' },
  //     film_id,
  //   );
  // }
}
