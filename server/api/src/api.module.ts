import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';

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
    ])
  ],
  controllers: [UsersController],
  providers: [],
})
export class ApiModule {}
