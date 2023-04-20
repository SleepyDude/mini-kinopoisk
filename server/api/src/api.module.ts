import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { ClientsModule } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import {PersonsController} from "./controllers/persons.controller";
import {ParserModule} from "./parser/parser.module";

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
    ]),
      ParserModule,
  ],
  controllers: [
      UsersController,
      PersonsController,
  ],
  providers: [],
})
export class ApiModule {}
