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
  UpdateCountryDto,
  CreateReviewDto,
  MoviesQueryDto,
  MoviesFiltersQueryDto,
  MoviesQueryAutosagestDto,
  MoviesUpdateFilmDto,
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

  //СТРАНЫ:
  @ApiOperation({ summary: 'Получение списка стран' })
  @ApiResponse({ status: 200, description: 'Выводит список всех стран' })
  @Get('/countries')
  getAllCountries() {
    return this.moviesService.send({ cmd: 'get-all-countries' }, {});
  }

  @ApiOperation({ summary: 'Получение страны по айди' })
  @ApiResponse({ status: 200, description: 'Выводит страны по айди' })
  @Get('/countries/:id')
  getCountriesById(@Param('id') countryId) {
    return this.moviesService.send({ cmd: 'get-country-byId' }, countryId);
  }

  @UseGuards(RolesGuard)
  @RoleAccess(initRoles.ADMIN.value)
  @ApiOperation({ summary: 'Апдейт стран по айди' })
  @ApiResponse({ status: 201, description: 'Обновление стран' })
  @Post('/countries/:id')
  updateCountryById(@Body() country: UpdateCountryDto, @Param('id') id) {
    return this.moviesService.send(
      { cmd: 'update-country-byId' },
      { id: id, country: country },
    );
  }

  @UseGuards(RolesGuard)
  @RoleAccess(initRoles.ADMIN.value)
  @ApiOperation({ summary: 'Удаление страны по айди' })
  @Delete('/countries/:id')
  deleteCountriesById(@Param('id') countryId) {
    return this.moviesService.send({ cmd: 'get-country-byId' }, countryId);
  }

  //ПЕРСОНЫ:
  @ApiParam({ name: 'id', description: 'Это долгий запрос' })
  @ApiOperation({ summary: 'Полный список персонала фильма' })
  @ApiResponse({
    status: 200,
    description: 'Выводит полный список актеров по фильм айди',
  })
  @Get('/about/:id/staff')
  getStaffByFilmId(@Param('id') id: number, @Query() params) {
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
