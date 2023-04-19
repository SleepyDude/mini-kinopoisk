import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { ClientsModule } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import {PersonsController} from "./controllers/persons.controller";
import { SharedModule } from 'shared';

@Module({
  imports: [
    SharedModule.registerRmq('USERS-SERVICE', process.env.USERS_QUEUE),
  ],
  controllers: [
      UsersController,
      PersonsController,
  ],
  providers: [],
})
export class ApiModule {}
