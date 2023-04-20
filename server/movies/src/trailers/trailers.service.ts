import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {Trailers} from "./trailers.model";

@Injectable()
export class TrailersService {
    constructor(
        @InjectModel(Trailers) private trailersRepository: typeof Trailers,
    ) {
    }
    async createTrailer(trailers) {
        for ( let trailer of trailers.items ) {
            await this.trailersRepository.create({kinopoiskFilmId: trailers.filmId, ...trailer});
        }
    }
}
