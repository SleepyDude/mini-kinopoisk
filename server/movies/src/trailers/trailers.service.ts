import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Trailers } from './trailers.model';

@Injectable()
export class TrailersService {
  constructor(
    @InjectModel(Trailers) private trailersRepository: typeof Trailers,
  ) {}
  async createTrailer(trailerData) {
    const isTrailer = await this.trailersRepository.findOne({
      where: { kinopoiskFilmId: trailerData.id },
    });
    if (!isTrailer) {
      return await this.trailersRepository.create(trailerData.trailer);
    }
    return isTrailer;
  }
}
