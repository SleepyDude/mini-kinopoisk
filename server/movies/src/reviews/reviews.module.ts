import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Reviews } from './reviews.model';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService],
  imports: [SequelizeModule.forFeature([Reviews])],
})
export class ReviewsModule {}
