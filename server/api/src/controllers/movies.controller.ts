import {Controller, Get, Inject, Param, Query} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from "@nestjs/swagger";

@ApiTags('Фильмы')
@Controller('movies')
export class MoviesController {

    constructor(
        @Inject('MOVIES-SERVICE') private usersService: ClientProxy,
    ) {}

    // Пагинация и получение всех фильмов
    @Get()
    async getAllFilms(@Query() param) {
        return this.usersService.send({ cmd : 'get-all-films' }, param);
    }

    //Получение фильма по id
    @Get('/:id')
    async getFilmById(@Param() id: number) {
        return this.usersService.send({ cmd : 'get-film-byId' }, id);
    }

    //Фильтр - жанры, страны, рейтинг кинопоиска, количество оценок,
    // Поиск по режиссеру, поиск по актеру

    //Сортировать по количеству оценок на кинопоиске, рейтинг, дата выхода(сперва свежие)
    // и алфавит
}