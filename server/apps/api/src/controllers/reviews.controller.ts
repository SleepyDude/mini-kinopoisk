import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AllExceptionsFilter } from '../filters/all.exceptions.filter';
import { ClientProxy } from '@nestjs/microservices';
import { RolesGuard } from '../guards/roles.guard';
import { DtoValidationPipe } from '../pipes/dto-validation.pipe';
import { UserData } from '../decorators/user-data.decorator';
import { ReviewPublic, ReviewPublicCount, ReviewTreePublic } from '@shared';
import {
  CreateReviewDto,
  DepthQueryDto,
  PaginationQueryDto,
} from '@shared/dto';

@UseFilters(AllExceptionsFilter)
@ApiTags('Работа с отзывами')
@Controller('reviews')
export class ReviewsController {
  constructor(@Inject('SOCIAL-SERVICE') private socialService: ClientProxy) {}

  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Создание отзыва' })
  @ApiResponse({
    status: 201,
    type: ReviewPublic,
    description:
      'Создание нового отзыва, id пользователя берется из токена авторизации',
  })
  @Post()
  async createReview(
    @UserData('id') userId: number,
    @Body(DtoValidationPipe) dto: CreateReviewDto,
  ) {
    return this.socialService.send({ cmd: 'create-review' }, { dto, userId });
  }

  @ApiOperation({ summary: 'Получение изолированного отзыва по его id' })
  @ApiResponse({
    status: 200,
    type: ReviewPublic,
    description: 'Отзыв без потомков с данными профиля',
  })
  @Get('single/:reviewId')
  async getReviewByReviewId(@Param('reviewId', ParseIntPipe) reviewId: number) {
    return this.socialService.send(
      { cmd: 'get-review-by-review-id-single' },
      reviewId,
    );
  }

  @ApiOperation({
    summary:
      'Получение дерева отзывов по id отзыва верхнего уровня c опциональным ограничением на глубину в query',
  })
  @ApiResponse({
    status: 200,
    type: ReviewTreePublic,
    description: 'Древовидная структура отзывов и их детей',
  })
  @Get('tree/:reviewId')
  async getReviewTreeByReviewId(
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Query(DtoValidationPipe) dto: DepthQueryDto,
  ) {
    // console.log(`\n\n depth dto: = ${JSON.stringify(dto)}\n\n`);
    return this.socialService.send(
      { cmd: 'get-review-by-review-id-tree' },
      { reviewId, depth: dto.depth },
    );
  }

  @ApiOperation({
    summary:
      'Получение дерева отзывов по id фильма (которое соответствует kinopoiskId в таблице фильмов) с опциональным ограничением на глубину',
  })
  @ApiResponse({
    status: 200,
    type: [ReviewTreePublic],
    description:
      'Массив отзывов со всеми своими потомками c возможным ограничением по глубине',
  })
  @Get('film/:filmId')
  async getReviewsByFilmId(
    @Param('filmId', ParseIntPipe) filmId: number,
    @Query(DtoValidationPipe) dto: DepthQueryDto,
  ) {
    return this.socialService.send(
      { cmd: 'get-reviews-by-film-id' },
      { filmId, depth: dto.depth },
    );
  }

  @ApiOperation({
    summary:
      'Получение отзывов верхнего уровня по kinopoiskId фильма (отзывы непосредственно к фильму)',
  })
  @ApiResponse({
    status: 200,
    type: ReviewPublicCount,
    description: 'Отзывы в рамках заданной страницы и их количество',
  })
  @Get('film/top/:filmId')
  async getTopReviewsByFilmId(
    @Param('filmId', ParseIntPipe) filmId: number,
    @Query(DtoValidationPipe) paginationQueryDto: PaginationQueryDto,
  ) {
    console.log(
      `[api][reviews.controller][getTopReviewsByFilmId] pagination query dto: ${JSON.stringify(
        paginationQueryDto,
      )}`,
    );
    return this.socialService.send(
      { cmd: 'get-top-reviews-by-film-id' },
      { filmId, paginationQueryDto },
    );
  }

  // @UseGuards(RolesGuard)
  // @ApiOperation({ summary: 'Удаление отзыва (сам отзыв остается)' })
  // @ApiResponse({
  //   status: 200,
  //   type: ReviewModelReturnAttrs,
  //   description: 'Измененный отзыв',
  // })
  // @Delete(':reviewId')
  // async deleteReviewByReviewId(
  //   @Param('filmId', ParseIntPipe) filmId: number,
  // ) {
  //   return this.socialService.send(
  //     { cmd: 'delete-review-by-review-id' },
  //     filmId,
  //   );
  // }
}
