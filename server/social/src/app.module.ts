import { Module } from '@nestjs/common';
import { ProfilesModule } from './profiles/profiles.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { DatabaseFilesModule } from './databaseFiles/files.module';

@Module({
  imports: [
    ProfilesModule,
    DatabaseFilesModule,
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT_INSIDE),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_SOCIAL_DB,
      models: [],
      autoLoadModels: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
