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
  Query,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import {
  CreateReviewDto,
  MoviesQueryDto,
  MoviesFiltersQueryDto,
  MoviesQueryAutosagestDto,
  MoviesUpdateFilmDto, MoviesGetStaffByFilmIdDto
} from '@shared/dto';

import { RolesGuard } from '../guards/roles.guard';
import { RoleAccess } from '../guards/roles.decorator';
import { initRoles } from '../guards/init.roles';
import { AllExceptionsFilter } from '../filters/all.exceptions.filter';
import { DtoValidationPipe } from '../pipes/dto-validation.pipe';

@UseFilters(AllExceptionsFilter)
@ApiTags('Фильмы')
@Controller('movies')
export class MoviesController {
  constructor(
    @Inject('MOVIES-SERVICE') private moviesService: ClientProxy,
    @Inject('PERSONS-SERVICE') private personsService: ClientProxy,
  ) {}

  // ФИЛЬМЫ:
  @ApiOperation({ summary: 'Каталог фильмов c пагинацией и поиском по имени' })
  @ApiResponse({
    status: 200,
    description: 'Список фильмов по запросу',
  })
  @Get()
  getAllFilms(@Query(DtoValidationPipe) param: MoviesQueryDto) {
    return this.moviesService.send({ cmd: 'get-all-films' }, param);
  }

  @ApiOperation({ summary: 'Информация о фильме по айди' })
  @ApiResponse({ status: 200, description: 'Вся информация о фильме' })
  @Get('/about/:id')
  getFilmById(@Param('id', ParseIntPipe) filmId: number) {
    return this.moviesService.send({ cmd: 'get-film-byId' }, filmId);
  }

  @ApiOperation({ summary: 'Фильтр по фильмам' })
  @ApiResponse({ status: 200, description: 'Фильтрация по квери строке' })
  @Get('/filters')
  getFilmsByFilters(@Query(DtoValidationPipe) params: MoviesFiltersQueryDto) {
    return this.moviesService.send({ cmd: 'get-films-byFilters' }, params);
  }

  @ApiOperation({ summary: 'Автосаджест фильмов' })
  @ApiResponse({
    status: 200,
    description: 'выводит по 10 элементов из запроса',
  })
  @Get('/name')
  getFilmsAutosagest(
    @Query(DtoValidationPipe) query: MoviesQueryAutosagestDto,
  ) {
    return this.moviesService.send({ cmd: 'get-films-autosagest' }, query);
  }

  @UseGuards(RolesGuard)
  @RoleAccess(initRoles.ADMIN.value)
  @ApiOperation({ summary: 'Обновление имени фильма по айди' })
  @Put('/about/:id')
  updateFilmById(
    @Param('id', ParseIntPipe) id: number,
    @Body() filmData: MoviesUpdateFilmDto,
  ) {
    return this.moviesService.send(
      { cmd: 'update-film-byId' },
      { id: id, film: filmData },
    );
  }

  @UseGuards(RolesGuard)
  @RoleAccess(initRoles.ADMIN.value)
  @ApiOperation({ summary: 'Удаление фильма по айди' })
  @Delete('/about/:id')
  deleteFilmById(@Param('id', ParseIntPipe) filmId: number) {
    return this.moviesService.send({ cmd: 'delete-film-byId' }, filmId);
  }

  @ApiOperation({ summary: 'Полный список персонала фильма' })
  @ApiResponse({
    status: 200,
    description: 'Выводит полный список актеров по фильм айди',
  })
  @Get('/about/:id/staff')
  getStaffByFilmId(
    @Param('id', ParseIntPipe) id: number,
    @Query(DtoValidationPipe) params: MoviesGetStaffByFilmIdDto,
  ) {
    return this.personsService.send(
      { cmd: 'get-staff-by-filmId' },
      { id, ...params },
    );
  }

  //КОММЕНТАРИИ:
  @ApiOperation({ summary: 'Создание комментария' })
  @ApiResponse({ status: 201, description: 'Комментарий создан' })
  @Post('/about/:filmId/reviews')
  createReview(
    @Body() review: CreateReviewDto,
    @Param('filmId') filmId: number,
    @Req() req: Request,
  ) {
    return this.moviesService.send(
      { cmd: 'create-review' },
      { review: review, filmId: filmId, req: req.cookies },
    );
  }

  @ApiOperation({ summary: 'Получить коментарии по kinopoiskId фильма' })
  @ApiResponse({ status: 200, description: 'Копентарии к фильму' })
  @Get('/about/:filmId/reviews')
  getReviewsByFilmId(@Param() filmId: number, @Query() query) {
    return this.moviesService.send(
      { cmd: 'get-reviews-byFilmId' },
      { filmId: filmId, query: query },
    );
  }

  @UseGuards(RolesGuard)
  @RoleAccess(initRoles.ADMIN.value)
  @Delete('/about/:filmId/reviews/:reviewId')
  deleteReview(@Param('reviewId') reviewId: number) {
    return this.moviesService.send({ cmd: 'delete-review' }, reviewId);
  }
}
