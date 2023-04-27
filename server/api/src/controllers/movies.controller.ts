import {Controller, Get, Inject, Param, Query} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags('Фильмы')
@Controller('movies')
export class MoviesController {

    constructor(
        @Inject('MOVIES-SERVICE') private moviesService: ClientProxy,
        @Inject('PERSONS-SERVICE') private personsService: ClientProxy,
    ) {}

    @ApiOperation({ summary: 'Каталог фильмов' })
    @ApiResponse({ status: 200, description: 'Список фильмов с пагинацией для каталога' })
    @Get()
    async getAllFilms(@Query() param) {
        return this.moviesService.send({ cmd: 'get-all-films' }, param);
    }

    @ApiOperation({ summary: 'Все о фильме по айди' })
    @ApiResponse({ status: 200, description: 'Вся информация о фильме' })
    @Get('/about/:id')
    async getFilmById(@Param() id: number) {
        return this.moviesService.send({ cmd: 'get-film-byId' }, id);
    }

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

    @ApiOperation({ summary: 'Полный список людей из фильма' })
    @ApiResponse({ status: 200, description: 'Выводит полный список актеров по филь айди' })
    @Get('/about/:id/staff')
    getStaffByFilmId(@Param('id') id) {
        return this.personsService.send({ cmd: 'get-staff-by-filmId' }, id)
    }

    //Сортировать по количеству оценок на кинопоиске, рейтинг, дата выхода(сперва свежие)
    // и алфавит
}