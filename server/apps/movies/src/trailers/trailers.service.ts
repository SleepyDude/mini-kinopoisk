import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Trailers } from './trailers.model';

@Injectable()
export class TrailersService {
  constructor(
    @InjectModel(Trailers) private trailersRepository: typeof Trailers,
  ) {}
  async deleteTrailersBuFilmId(filmId) {
    return await this.trailersRepository.destroy({
      where: { kinopoiskFilmId: filmId },
    });
  }
}
