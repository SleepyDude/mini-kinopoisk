import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { ClientsModule } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import {PersonsController} from "./controllers/persons.controller";
import { MoviesController } from "./controllers/movies.controller";
import { AuthController } from './controllers/auth.controller';
import {ApiController} from "./api.controller";
import { RolesController } from './controllers/roles.controller';
import { ConfigModule } from '@nestjs/config';
import { InitController } from './controllers/init.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [process.env.NODE_ENV_LOCAL, process.env.NODE_ENV],
    }),
    ClientsModule.register([
      {
        name: 'AUTH-SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.CLOUDAMQP_URL],
          queue: process.env.AUTH_QUEUE,
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
      {
        name: 'PERSONS-SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.CLOUDAMQP_URL],
          queue: process.env.PERSONS_QUEUE,
          queueOptions: { durable: false },
        },
      },
    ])
  ],
  controllers: [
      UsersController,
      PersonsController,
      AuthController,
      ApiController,
      RolesController,
      MoviesController,
      InitController
  ],
  providers: [],
})
export class ApiModule {}
