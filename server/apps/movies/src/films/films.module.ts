import { Module } from '@nestjs/common';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Films } from './films.model';
import { SimilarFilms } from './films.similar.m2m.model';
import { Similar } from './films.similar.model';
import { CacheModule } from '@nestjs/cache-manager';
import { BudgetModule } from '../budget/budget.module';
import { TrailersModule } from '../trailers/trailers.module';
import { SharedModule } from '@shared';

@Module({
  controllers: [FilmsController],
  providers: [FilmsService],
  imports: [
    CacheModule.register({
      ttl: 5000,
    }),
    SequelizeModule.forFeature([Films, Similar, SimilarFilms]),
    SharedModule.registerRmq('PERSONS-SERVICE', process.env.PERSONS_QUEUE),
    SharedModule.registerRmq('SOCIAL-SERVICE', process.env.SOCIAL_QUEUE),
    BudgetModule,
    TrailersModule,
  ],
})
export class FilmsModule {}
