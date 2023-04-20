import { Module } from '@nestjs/common';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import {SequelizeModule} from "@nestjs/sequelize";
import {Films} from "./films.model";
import {SimilarFilms} from "./films.similar.m2m.model";

@Module({
  controllers: [FilmsController],
  providers: [FilmsService],
  imports: [SequelizeModule.forFeature([Films, SimilarFilms])]
})
export class FilmsModule {}
