import { Controller } from '@nestjs/common';
import { FilmsService } from './films.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('films')
export class FilmsController {
  constructor(private filmsService: FilmsService) {}

  @MessagePattern({ cmd: 'get-all-films' })
  async getAllFilms(@Payload() params) {
    return await this.filmsService.getAllFilms(params);
  }

  @MessagePattern({ cmd: 'get-film-byId' })
  async getFilmById(@Payload() id) {
    return await this.filmsService.getFilmById(id);
  }

  @MessagePattern({ cmd: 'get-films-byId-previous' })
  async getFilmsByIdPrevious(@Payload() filmsId) {
    return await this.filmsService.getFilmsByIdPrevious(filmsId);
  }

  @MessagePattern({ cmd: 'get-films-byFilters' })
  getFilmsByFilters(@Payload() params) {
    return this.filmsService.getFilmsByFilers(params);
  }
}
