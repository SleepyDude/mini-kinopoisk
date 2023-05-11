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
  async getFilmById(@Payload() filmId) {
    return await this.filmsService.getFilmById(filmId);
  }

  @MessagePattern({ cmd: 'get-films-byId-previous' })
  async getFilmsByIdPrevious(@Payload() filmsId) {
    return await this.filmsService.getFilmsByIdPrevious(filmsId);
  }

  @MessagePattern({ cmd: 'get-films-byFilters' })
  async getFilmsByFilters(@Payload() params) {
    return await this.filmsService.getFilmsByFilers(params);
  }

  @MessagePattern({ cmd: 'get-films-autosagest' })
  async filmsAutosagest(@Payload() params) {
    return await this.filmsService.filmsAutosagest(params);
  }

  @MessagePattern({ cmd: 'update-film-byId' })
  async updateFilmById(@Payload() film) {
    return await this.filmsService.updateFilmById(film);
  }

  @MessagePattern({ cmd: 'delete-film-byId' })
  async deleteFilmById(@Payload() filmId) {
    return await this.filmsService.deleteFilmById(filmId);
  }
}
