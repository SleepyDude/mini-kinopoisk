import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { DatabaseFilesModule } from 'src/databaseFiles/files.module';
import { Profile } from 'models/profiles.model';

@Module({
    imports: [
        DatabaseFilesModule,
        SequelizeModule.forFeature([Profile]),
    ],
    controllers: [ProfilesController],
    providers: [ProfilesService],
})
export class ProfilesModule {}