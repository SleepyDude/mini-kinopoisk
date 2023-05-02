import { Body, Controller, Delete, Get, Inject, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ClientProxy } from '@nestjs/microservices';
import {
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags
} from "@nestjs/swagger";
import { FiltersOrderByQuery, FiltersTypeQuery } from "../types/filters.query.enum";
import { UpdateCountryDto, UpdateGenreDto, CreateReviewDto } from "@hotels2023nestjs/shared";
import { Request } from "express";
import { RolesGuard } from "../guards/roles.guard";
import { RoleAccess } from "../guards/roles.decorator";
import { initRoles } from "../init/init.roles";
import { GenreQuery, PageQuery } from "../types/pagination.query.enum";

@ApiTags('Фильмы')
@Controller('movies')
export class MoviesController {

    constructor(
        @Inject('MOVIES-SERVICE') private moviesService: ClientProxy,
        @Inject('PERSONS-SERVICE') private personsService: ClientProxy,
    ) {}

    @ApiQuery({name: 'page', enum: PageQuery, isArray: true,
        description: 'Доступные квери: page, size, name'})
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
    @ApiQuery({ name: 'genreId', enum: GenreQuery, isArray: true,
    description: 'Квери: genreId, countryId, page, size, year, ratingKinopoisk, ratingKinopoiskVoteCount'})
    @ApiQuery({ name: 'type', enum: FiltersTypeQuery, description: 'Фильмы или сериалы' })
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

    @ApiQuery({ name: 'nameRu', required: false })
    @ApiQuery({ name: 'nameOriginal', required: false })
    @ApiOperation({ summary: 'Автосаджест фильмов' })
    @ApiResponse({ status: 200, description: 'выводит по 10 элементов из запроса' })
    @Get('/name')
    getFilmsAutosagest(@Query() query: string) {
        return this.moviesService.send({ cmd: 'get-films-autosagest' }, query)
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

    @ApiOperation({ summary: 'Апдейт стран по айди' })
    @ApiResponse({ status: 201, description: 'Обновление стран' })
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
          {review: review, filmId: filmId, req: req.cookies},
          );
    }

    @ApiOperation({ summary: 'Получить коментарии по kinopoiskId фильма' })
    @ApiResponse({ status: 200, description: 'Копентарии к фильму' })
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