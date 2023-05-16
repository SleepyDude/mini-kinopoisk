import { Module } from '@nestjs/common';
import { GenresController } from './genres.controller';
import { GenresService } from './genres.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Genres } from './genres.model';
import { GenresFilms } from './genres.m2m.model';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  controllers: [GenresController],
  providers: [GenresService],
  imports: [
    CacheModule.register({
      ttl: 5000,
    }),
    SequelizeModule.forFeature([Genres, GenresFilms]),
  ],
  exports: [GenresService],
})
export class GenresModule {}
