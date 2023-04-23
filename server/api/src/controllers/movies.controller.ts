import {Controller, Get, Inject, Param, Query} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('movies')
export class MoviesController {

    constructor(
        @Inject('USERS-SERVICE') private usersService: ClientProxy,
    ) {}

    // @Get('?page=:pageNum&limit=limitNum')
    // async getAllFilmsPagination(@Param('pageNum') pageNum,
    //                   @Param('limitNum') limitNum) {
    //     return this.usersService.send({ cmd : 'get-all-films' }, {pageNum, limitNum});
    // }

    @Get()
    async getAllFilms(@Query() param) {
        return this.usersService.send({ cmd : 'get-all-films' }, param);
    }

    @Get('/:id')
    async getFilmById(@Param() id: number) {
        return this.usersService.send({ cmd : 'get-film-byId' }, id);
    }
}