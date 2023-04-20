import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import {ParserController} from "./parser.controller";
import {ParserService} from "./parser.service";

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'PARSER-SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: [process.env.CLOUDAMQP_URL],
                    queue: process.env.USERS_QUEUE,
                    queueOptions: { durable: true },
                },
            },
        ])
    ],
    controllers: [ParserController],
    providers: [ParserService],
})
export class ParserModule {}
