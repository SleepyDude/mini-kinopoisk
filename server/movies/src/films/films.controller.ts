import {Controller, Get, Param} from '@nestjs/common';
import {FilmsService} from "./films.service";

@Controller('films')
export class FilmsController {

    constructor(
        private filmsService: FilmsService,
    ) {}

    @Get()
    getAllFilms() {
        return this.filmsService.getAllFilms();
    }

    @Get('/:id')
    getFilmById(@Param('id') id) {
        return this.filmsService.getFilmById(id);
    }
}
