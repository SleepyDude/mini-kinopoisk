import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
import { CustomHttpExceptionResponse } from '../filters/http.exceptions.response.interface';
import { RoleAccess } from '../guards/roles.decorator';
import { initRoles } from '../guards/init.roles';
import { firstValueFrom } from 'rxjs';

@UseFilters(AllExceptionsFilter)
@ApiTags('Работа с отзывами')
@Controller('reviews')
export class ReviewsController {
  constructor(@Inject('SOCIAL-SERVICE') private socialService: ClientProxy) {}

  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Создание отзыва' })
  @ApiCreatedResponse({
    type: ReviewPublic,
    description:
      'Создание нового отзыва, id пользователя берется из токена авторизации',
  })
  @ApiNotFoundResponse({
    description: 'Родитель с переданным parentId не найден',
  })
  @ApiBadRequestResponse({
    description:
      'filmId для переданного родителя и текущего отзыва не совпадают',
  })
  @Post()
  async createReview(
    @UserData('id') userId: number,
    @Body(DtoValidationPipe) dto: CreateReviewDto,
  ) {
    return this.socialService.send({ cmd: 'create-review' }, { dto, userId });
  }

  @ApiOperation({ summary: 'Получение изолированного отзыва по его id' })
  @ApiOkResponse({
    type: ReviewPublic,
    description: 'Отзыв без потомков с данными профиля',
  })
  @ApiNotFoundResponse({
    description: 'Отзыв по данному id не найден',
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
  @ApiOkResponse({
    type: ReviewTreePublic,
    description: 'Древовидная структура отзывов и их детей',
  })
  @ApiNotFoundResponse({
    description: 'Корневой отзыв по данному id не найден',
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
  @ApiOkResponse({
    type: [ReviewTreePublic],
    description:
      'Массив отзывов со всеми своими потомками c возможным ограничением по глубине',
  })
  @ApiNotFoundResponse({
    description: 'Родительский отзыв по переданному reviewId не найден',
    type: CustomHttpExceptionResponse,
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

  @UseGuards(RolesGuard)
  @RoleAccess(initRoles.ADMIN.value)
  @ApiOperation({
    summary:
      'Удаление отзыва рекурсивно со всем своим поддеревом. Дотсупно только для администраторов',
  })
  @ApiResponse({
    status: 204,
    description:
      'Не возвращает тело, только статус. Нельзя узнать удачно ли удаление, результат снаружи всегда одинаков даже при несуществующем reviewId',
  })
  @HttpCode(204)
  @Delete(':reviewId')
  async deleteReviewByReviewId(
    @Param('reviewId', ParseIntPipe) reviewId: number,
  ) {
    await firstValueFrom(
      this.socialService.send({ cmd: 'delete-review-by-review-id' }, reviewId),
    );
    return;
  }
}
