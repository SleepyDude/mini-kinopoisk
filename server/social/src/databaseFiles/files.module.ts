import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DbFilesController } from './files.controller';
import {DatabaseFile} from '@hotels2023nestjs/shared/src/models/files/files.model';
import {DatabaseFilesService} from './files.service';
import { UploadFolderService } from './upload-folder-service/upload-folder.service';

@Module({
  controllers: [DbFilesController],
  providers: [DatabaseFilesService, UploadFolderService],
  exports: [DatabaseFilesService],
  imports:[SequelizeModule.forFeature([DatabaseFile])]
})
export class DatabaseFilesModule {}
