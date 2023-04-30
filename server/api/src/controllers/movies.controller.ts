import { Body, Controller, Delete, Get, Inject, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ClientProxy } from '@nestjs/microservices';
import {
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags
} from "@nestjs/swagger";
import { NameQuery } from "../types/pagination.query.enum";
import { FiltersOrderByQuery, FiltersTypeQuery } from "../types/filters.query.enum";
import { UpdateCountryDto, UpdateGenreDto } from "@hotels2023nestjs/shared";
import { Request } from "express";
import { RolesGuard } from "../guards/roles.guard";
import { RoleAccess } from "../guards/roles.decorator";
import { initRoles } from "../init/init.roles";

@ApiTags('Фильмы')
@Controller('movies')
export class MoviesController {

    constructor(
        @Inject('MOVIES-SERVICE') private moviesService: ClientProxy,
        @Inject('PERSONS-SERVICE') private personsService: ClientProxy,
    ) {}

    @ApiQuery({ name: 'name', enum: NameQuery })
    @ApiQuery({ name: 'size' })
    @ApiQuery({ name: 'page' })
    @ApiOperation({ summary: 'Каталог фильмов' })
    @ApiResponse({ status: 200, description: 'Список фильмов с пагинацией для каталога' })
    @Get()
    getAllFilms(@Query() param) {
        return this.moviesService.send({ cmd: 'get-all-films' }, param);
    }

    @ApiParam({name: 'id'})
    @ApiOperation({ summary: 'Все о фильме по айди' })
    @ApiResponse({ status: 200, description: 'Вся информация о фильме' })
    @Get('/about/:id')
    getFilmById(@Param() id: number) {
        return this.moviesService.send({ cmd: 'get-film-byId' }, id);
    }

    @ApiQuery({ name: 'orderBy', enum: FiltersOrderByQuery, description: 'Сортировка' })
    @ApiQuery({ name: 'year' })
    @ApiQuery({ name: 'size' })
    @ApiQuery({ name: 'page' })
    @ApiQuery({ name: 'genreId' })
    @ApiQuery({ name: 'countryId' })
    @ApiQuery({ name: 'type', enum: FiltersTypeQuery, description: 'Фильмы или сериалы' })
    @ApiQuery({ name: 'ratingKinopoisk', description: 'Значения с точкой "8.1"' })
    @ApiQuery({ name: 'ratingKinopoiskVoteCount', description: 'максимальные значения не достигают миллиона'})
    @ApiOperation({ summary: 'Фильтр по фильмам' })
    @ApiResponse({ status: 200, description: 'Фильтрация по квери строке' })
    @Get('/filters')
    getFilmsByFilters(@Query() params) {
        return this.moviesService.send({ cmd: 'get-films-byFilters' }, params);
    }

    @ApiOperation({ summary: 'Получение списка жанров' })
    @ApiResponse( { status: 200, description: 'Выводит список всех жанров' })
    @Get('/genres')
    getAllGenres() {
        return this.moviesService.send({ cmd: 'get-all-genres' }, {})
    }

    @ApiOperation({ summary: 'Получение списка стран' })
    @ApiResponse({ status: 200, description: 'Выводит список всех стран' })
    @Get('/countries')
    getAllCountries() {
        return this.moviesService.send({ cmd: 'get-all-countries' }, {})
    }

    @ApiParam({ name: 'id', description: 'Это долгий запрос' })
    @ApiOperation({ summary: 'Полный список персонала фильма' })
    @ApiResponse({ status: 200, description: 'Выводит полный список актеров по фильм айди' })
    @Get('/about/:id/staff')
    getStaffByFilmId(@Param('id') id) {
        return this.personsService.send({ cmd: 'get-staff-by-filmId' }, id)
    }

    @ApiOperation({ summary: 'Автосаджест' })
    @ApiResponse({ status: 200, description: 'выводит по 10 элементов из запроса' })
    @Get('/:name')
    getFilmsAutosagest(@Param('name') name: string) {
        return this.moviesService.send({ cmd: 'get-films-autosagest' }, name)
    }


    @ApiOperation({ summary: 'Апдейт жанров по айди' })
    @ApiResponse({ status: 201, description: 'Обновление жанорв' })
    @Post('/genres/:id')
    updateGenreById(
      @Body() genre: UpdateGenreDto,
      @Param('id') id,
    ) {
        return this.moviesService.send(
          { cmd: 'update-genre-byId' },
          { id: id, genre: genre }
        );
    }

    @Post('/countries/:id')
    updateCountryById(
      @Body() country: UpdateCountryDto,
      @Param('id') id,
    ) {
        return this.moviesService.send(
          { cmd: 'update-country-byId' },
          { id: id, country: country },
        );
    }

    @Post('/about/:filmId/reviews')
    createReview(
      @Body() review,
      @Param('filmId') filmId: number,
      @Req() req: Request,
    ) {
        return this.moviesService.send(
          { cmd: 'create-review' },
          {review: review, filmId: filmId, req: req.cookies},
          );
    }

    @Get('/about/:filmId/reviews')
    getReviewsByFilmId(
      @Param() filmId: number,
      @Query() query,
      ) {
        return this.moviesService.send({ cmd: 'get-reviews-byFilmId' },
          { filmId: filmId, query: query });
    }

    @UseGuards(RolesGuard)
    @RoleAccess(initRoles.ADMIN.value)
    @Delete('/about/:filmId/reviews/:reviewId')
    deleteReview(
      @Param('reviewId') reviewId: number,
    ) {
        return this.moviesService.send({ cmd: 'delete-review' }, reviewId);
    }
}