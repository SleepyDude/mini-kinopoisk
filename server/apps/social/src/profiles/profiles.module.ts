import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProfilesController } from './profiles.controller';
import { Profile } from '../../models/profiles.model';
import { ProfilesService } from './profiles.service';
import { DatabaseFilesModule } from '../databaseFiles/files.module';

@Module({
  imports: [DatabaseFilesModule, SequelizeModule.forFeature([Profile])],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}
