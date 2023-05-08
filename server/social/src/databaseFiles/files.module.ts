import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DbFilesController } from './files.controller';
import {DatabaseFilesService} from './files.service';
import { DatabaseFile } from 'models/files.model';

@Module({
  controllers: [DbFilesController],
  providers: [DatabaseFilesService],
  exports: [DatabaseFilesService],
  imports:[SequelizeModule.forFeature([DatabaseFile])]
})
export class DatabaseFilesModule {}