import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from './users/users.module';
import {ConfigModule} from "@nestjs/config";
import { RolesModule } from './roles/roles.module';
import { InitModule } from './init/init.module';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT_INSIDE),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_USERS_DB,
      models: [],
      autoLoadModels: true,
    }),
    UsersModule,
    RolesModule,
    InitModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
