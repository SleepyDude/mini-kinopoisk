import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  FiltersOrderByQuery,
  FiltersTypeQuery,
} from '../types/filters.query.enum';
import { UpdateCountryDto, UpdateGenreDto, CreateReviewDto } from '@shared/dto';
import { Request } from 'express';
import { RolesGuard } from '../guards/roles.guard';
import { RoleAccess } from '../guards/roles.decorator';
import { GenreQuery, PageQuery } from '../types/pagination.query.enum';
import { initRoles } from '../guards/init.roles';
import { AllExceptionsFilter } from '../filters/all.exceptions.filter';

@ApiTags('Фильмы')
@Controller('movies')
export class MoviesController {
  constructor(
    @Inject('MOVIES-SERVICE') private moviesService: ClientProxy,
    @Inject('PERSONS-SERVICE') private personsService: ClientProxy,
  ) {}

  // ФИЛЬМЫ:
  @ApiQuery({
    name: 'page',
    enum: PageQuery,
    isArray: true,
    description: 'Доступные квери: page, size, name',
  })
  @ApiOperation({ summary: 'Каталог фильмов' })
  @ApiResponse({
    status: 200,
    description: 'Список фильмов с пагинацией для каталога',
  })
  @Get()
  getAllFilms(@Query() param) {
    return this.moviesService.send({ cmd: 'get-all-films' }, param);
  }

  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Все о фильме по айди' })
  @ApiResponse({ status: 200, description: 'Вся информация о фильме' })
  @UseFilters(AllExceptionsFilter)
  @Get('/about/:id')
  getFilmById(@Param() filmId: number) {
    return this.moviesService.send({ cmd: 'get-film-byId' }, filmId);
  }

  @ApiQuery({
    name: 'orderBy',
    enum: FiltersOrderByQuery,
    description: 'Сортировка',
  })
  @ApiQuery({
    name: 'genreId',
    enum: GenreQuery,
    isArray: true,
    description:
      'Квери: genreId, countryId, page, size, year, ratingKinopoisk, ratingKinopoiskVoteCount',
  })
  @ApiQuery({
    name: 'type',
    enum: FiltersTypeQuery,
    description: 'Фильмы или сериалы',
  })
  @ApiOperation({ summary: 'Фильтр по фильмам' })
  @ApiResponse({ status: 200, description: 'Фильтрация по квери строке' })
  @Get('/filters')
  getFilmsByFilters(@Query() params) {
    return this.moviesService.send({ cmd: 'get-films-byFilters' }, params);
  }

  @ApiQuery({ name: 'nameRu', required: false })
  @ApiQuery({ name: 'nameOriginal', required: false })
  @ApiOperation({ summary: 'Автосаджест фильмов' })
  @ApiResponse({
    status: 200,
    description: 'выводит по 10 элементов из запроса',
  })
  @Get('/name')
  getFilmsAutosagest(@Query() query: string) {
    return this.moviesService.send({ cmd: 'get-films-autosagest' }, query);
  }

  @UseGuards(RolesGuard)
  @RoleAccess(initRoles.ADMIN.value)
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Обновление имени фильма по айди' })
  @Post('/about/:id')
  updateFilmById(@Param('id') id, @Body() filmData) {
    return this.moviesService.send(
      { cmd: 'update-film-byId' },
      { id: id, film: filmData },
    );
  }

  @UseGuards(RolesGuard)
  @RoleAccess(initRoles.ADMIN.value)
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Удаление фильма по айди' })
  @Delete('/about/:id')
  deleteFilmById(@Param('id') filmId) {
    return this.moviesService.send({ cmd: 'delete-film-byId' }, filmId);
  }

  //ЖАНРЫ:
  @ApiOperation({ summary: 'Получение списка жанров' })
  @ApiResponse({ status: 200, description: 'Выводит список всех жанров' })
  @Get('/genres')
  getAllGenres() {
    return this.moviesService.send({ cmd: 'get-all-genres' }, {});
  }

  @ApiOperation({ summary: 'Получение жанра по айди' })
  @ApiResponse({ status: 200, description: 'Выводит один жанр' })
  @Get('/genres/:id')
  getGenreById(@Param('id') id) {
    return this.moviesService.send({ cmd: 'get-genre-byId' }, id);
  }

  @UseGuards(RolesGuard)
  @RoleAccess(initRoles.ADMIN.value)
  @ApiOperation({ summary: 'Удаление жанра по айди' })
  @Delete('/genres/:id')
  deleteGenreById(@Param('id') id) {
    return this.moviesService.send({ cmd: 'delete-genre-byId' }, id);
  }

  @UseGuards(RolesGuard)
  @RoleAccess(initRoles.ADMIN.value)
  @ApiOperation({ summary: 'Апдейт жанров по айди' })
  @ApiResponse({ status: 201, description: 'Обновление жанорв' })
  @Post('/genres/:id')
  updateGenreById(@Body() genre: UpdateGenreDto, @Param('id') id) {
    return this.moviesService.send(
      { cmd: 'update-genre-byId' },
      { id: id, genre: genre },
    );
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
