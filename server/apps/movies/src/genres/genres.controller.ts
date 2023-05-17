import { Controller } from '@nestjs/common';
import { GenresService } from './genres.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('genres')
export class GenresController {
  constructor(private genresService: GenresService) {}

  @MessagePattern({ cmd: 'get-all-genres' })
  async getAllGenres() {
    return await this.genresService.getAllGenres();
  }

  @MessagePattern({ cmd: 'update-genre-byId' })
  async updateGenreById(@Payload() genre) {
    return await this.genresService.updateGenreById(genre);
  }

  @MessagePattern({ cmd: 'get-genre-byId' })
  async getGenreById(@Payload() id) {
    return await this.genresService.getGenreById(id);
  }

  @MessagePattern({ cmd: 'delete-genre-byId' })
  async deleteGenreById(@Payload() id) {
    return await this.genresService.deleteGenreById(id);
  }
}
