import { Module } from '@nestjs/common';
import {ConfigModule} from "@nestjs/config";
import {SequelizeModule} from "@nestjs/sequelize";
import { PersonsModule } from './persons/persons.module';

@Module({
  imports: [
  //     ConfigModule.forRoot({
  //   envFilePath: `.${process.env.NODE_ENV}.env`
  // }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT_INSIDE),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_MOVIES_DB,
      models: [],
      autoLoadModels: true,
    }),
    PersonsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
