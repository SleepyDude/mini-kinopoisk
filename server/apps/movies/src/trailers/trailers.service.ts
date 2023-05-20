import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Trailers } from './trailers.model';
import { HttpRpcException } from '@shared';

@Injectable()
export class TrailersService {
  constructor(
    @InjectModel(Trailers) private trailersRepository: typeof Trailers,
  ) {}
  async deleteTrailersBuFilmId(filmId) {
    return await this.trailersRepository
      .destroy({
        where: { kinopoiskFilmId: filmId },
      })
      .then((result) => {
        if (result) {
          return true;
        }
        throw new HttpRpcException(
          'Трейлера по такиму айди нет',
          HttpStatus.NOT_FOUND,
        );
      });
  }
}
