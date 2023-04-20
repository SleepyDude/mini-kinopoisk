import { Controller } from '@nestjs/common';
import {FilmsService} from "./films.service";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {CreateFilmDto} from "./dto/create.film.dto";

@Controller('films')
export class FilmsController {
    constructor(
        private filmsService: FilmsService,
    ) {}

    @MessagePattern({ cmd: 'create-film' })
    async createFilm(@Payload() filmDto: CreateFilmDto) {
        return  this.filmsService.createFilm(filmDto);
    }

    @MessagePattern({ cmd: 'create-similar' })
    createSimilar(@Payload() similar) {
        return this.filmsService.createSimilar(similar);
    }
}
