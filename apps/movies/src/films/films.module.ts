import { Module } from '@nestjs/common';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Films } from './films.model';
import { SimilarFilms } from './films.similar.m2m.model';
import { Similar } from './films.similar.model';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CacheModule } from '@nestjs/cache-manager';
import { BudgetModule } from '../budget/budget.module';
import { TrailersModule } from '../trailers/trailers.module';

@Module({
  controllers: [FilmsController],
  providers: [FilmsService],
  imports: [
    CacheModule.register(),
    SequelizeModule.forFeature([Films, Similar, SimilarFilms]),
    ClientsModule.register([
      {
        name: 'PERSONS-SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.CLOUDAMQP_URL],
          queue: process.env.PERSONS_QUEUE,
          queueOptions: { durable: false },
        },
      },
    ]),
    BudgetModule,
    TrailersModule,
  ],
})
export class FilmsModule {}
