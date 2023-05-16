import { Module } from '@nestjs/common';
import { TrailersService } from './trailers.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Trailers } from './trailers.model';

@Module({
  controllers: [],
  providers: [TrailersService],
  imports: [SequelizeModule.forFeature([Trailers])],
  exports: [TrailersService],
})
export class TrailersModule {}
