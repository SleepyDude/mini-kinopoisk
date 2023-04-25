import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Token } from './tokens.model';
import { TokensController } from './tokens.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [TokensService],
  exports: [TokensService],
  imports: [SequelizeModule.forFeature([ Token ]),
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
  JwtModule.register({})],
  controllers: [TokensController]
})
export class TokensModule {}
