import { Controller } from '@nestjs/common';
import {GenresService} from "./genres.service";
import {MessagePattern, Payload} from "@nestjs/microservices";

@Controller('genres')
export class GenresController {
    constructor(
        private genresService: GenresService,
    ) {}

    @MessagePattern({ cmd: 'create-genres' })
    createGenres(@Payload() genres) {
        return this.genresService.createGenres(genres);
    }
}
