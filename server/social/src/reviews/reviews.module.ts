import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ReviewsController } from './reviews.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Review } from '../../models/reviews.model';
import { ReviewChildParent } from './child-parent.m2m.model';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService],
  imports: [
    SequelizeModule.forFeature([Review, ReviewChildParent]),
    // ClientsModule.register([
    //   {
    //     name: 'REVIEWS-SERVICE',
    //     transport: Transport.RMQ,
    //     options: {
    //       urls: [process.env.CLOUDAMQP_URL],
    //       queue: process.env.AUTH_QUEUE,
    //       queueOptions: { durable: false },
    //     },
    //   },
    // ]),
  ],
})
export class ReviewsModule {}
