import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { ClientsModule } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import {PersonsController} from "./controllers/persons.controller";
import {MoviesController} from "./controllers/movies.controller";
import { InitModule } from './init/init.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/all.exceptions.filter';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS-SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.CLOUDAMQP_URL],
          queue: process.env.USERS_QUEUE,
          queueOptions: { durable: false },
        },
      },
      {
        name: 'MOVIES-SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.CLOUDAMQP_URL],
          queue: process.env.MOVIES_QUEUE,
          queueOptions: { durable: false },
        },
      },
    ]),
    InitModule
  ],
  controllers: [
      UsersController,
      PersonsController,
      MoviesController,
  ],
  providers: [
    // {
    //   provide: APP_FILTER,
    //   useClass: AllExceptionsFilter,
    // }
  ],
})
export class ApiModule {}
