import { Module } from '@nestjs/common';
import { TrailersController } from './trailers.controller';
import { TrailersService } from './trailers.service';
import {SequelizeModule} from "@nestjs/sequelize";
import {Trailers} from "./trailers.model";

@Module({
  controllers: [TrailersController],
  providers: [TrailersService],
  imports: [SequelizeModule.forFeature([Trailers])]
})
export class TrailersModule {}
