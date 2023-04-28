import {Controller, Get, Inject, Param, Query} from '@nestjs/common';
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
    async getAllFilms(@Query() param) {
        return this.moviesService.send({ cmd: 'get-all-films' }, param);
    }

    @ApiParam({name: 'id'})
    @ApiOperation({ summary: 'Все о фильме по айди' })
    @ApiResponse({ status: 200, description: 'Вся информация о фильме' })
    @Get('/about/:id')
    async getFilmById(@Param() id: number) {
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
    async getFilmsByFilters(@Query() params) {
        return this.moviesService.send({ cmd: 'get-films-byFilters' }, params);
    }

    @ApiOperation({ summary: 'Получение списка жанров' })
    @ApiResponse( { status: 200, description: 'Выводит список всех жанров' })
    @Get('/genres')
    async getAllGenres() {
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

    //Сортировать по количеству оценок на кинопоиске, рейтинг, дата выхода(сперва свежие)
    // и алфавит
}