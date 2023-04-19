import { Module } from '@nestjs/common';
import {SequelizeModule} from "@nestjs/sequelize";
import { PersonsModule } from './persons/persons.module';

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
    PersonsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
