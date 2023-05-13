import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DbFilesController } from './files.controller';
import { DatabaseFilesService } from './files.service';
import { DatabaseFile } from 'models/files.model';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [DbFilesController],
  providers: [DatabaseFilesService],
  exports: [DatabaseFilesService],
  imports: [SequelizeModule.forFeature([DatabaseFile]), HttpModule],
})
export class DatabaseFilesModule {}
