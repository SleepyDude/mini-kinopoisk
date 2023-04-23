import {Controller, Get, Res} from '@nestjs/common';
import {FilmsService} from "./films.service";
import {MessagePattern, Payload} from "@nestjs/microservices";
import { PaginateQueryInterface, PaginateQuery } from 'nestjs-sequelize-paginate';

@Controller('films')
export class FilmsController {

    constructor(
        private filmsService: FilmsService,
    ) {}

    @MessagePattern({ cmd : 'get-all-films' })
    getAllFilms(@Payload() params) {
        return this.filmsService.getAllFilms(params);
    }

    @MessagePattern({ cmd : 'get-film-byId' })
    getFilmById(@Payload() id) {
        return this.filmsService.getFilmById(id);
    }

    @MessagePattern({ cmd : 'test-movies' })
    test () {
        return 'Test done';
    }
}
