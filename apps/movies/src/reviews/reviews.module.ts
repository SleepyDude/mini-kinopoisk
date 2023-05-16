import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Reviews } from './reviews.model';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Films } from '../films/films.model';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService],
  imports: [
    SequelizeModule.forFeature([Reviews, Films]),
    ClientsModule.register([
      {
        name: 'REVIEWS-SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.CLOUDAMQP_URL],
          queue: process.env.AUTH_QUEUE,
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
})
export class ReviewsModule {}
