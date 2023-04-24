import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { ClientsModule } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import {PersonsController} from "./controllers/persons.controller";
import { InitModule } from './init/init.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/all.exceptions.filter';
import { AuthController } from './controllers/auth.controller';
import {ApiController} from "./api.controller";
import { RolesController } from './controllers/roles.controller';

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
        name: 'AUTH-SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.CLOUDAMQP_URL],
          queue: process.env.AUTH_QUEUE,
          queueOptions: { durable: false },
        },
      },  
    ]),
    InitModule
  ],
  controllers: [
      UsersController,
      PersonsController,
      AuthController,
      ApiController,
      RolesController,
  ],
  providers: [
    // {
    //   provide: APP_FILTER,
    //   useClass: AllExceptionsFilter,
    // }
  ],
})
export class ApiModule {}
