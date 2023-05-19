import { Controller } from '@nestjs/common';
import { GenresService } from './genres.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GenresUpdateInterface } from '@shared';

@Controller('genres')
export class GenresController {
  constructor(private genresService: GenresService) {}

  @MessagePattern({ cmd: 'get-all-genres' })
  async getAllGenres() {
    return await this.genresService.getAllGenres();
  }

  @MessagePattern({ cmd: 'update-genre-byId' })
  async updateGenreById(@Payload() genre: GenresUpdateInterface) {
    return await this.genresService.updateGenreById(genre);
  }

  @MessagePattern({ cmd: 'get-genre-byId' })
  async getGenreById(@Payload() genreId: number) {
    return await this.genresService.getGenreById(genreId);
  }

  @MessagePattern({ cmd: 'delete-genre-byId' })
  async deleteGenreById(@Payload() genreId: number) {
    return await this.genresService.deleteGenreById(genreId);
  }
}
