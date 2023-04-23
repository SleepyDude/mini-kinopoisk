import {Controller, Get, Inject, Param, Query} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('movies')
export class MoviesController {

    constructor(
        @Inject('MOVIES-SERVICE') private usersService: ClientProxy,
    ) {}

    @Get()
    async getAllFilms(@Query() param) {
        return this.usersService.send({ cmd : 'get-all-films' }, param);
    }

    @Get('/:id')
    async getFilmById(@Param() id: number) {
        return this.usersService.send({ cmd : 'get-film-byId' }, id);
    }
}