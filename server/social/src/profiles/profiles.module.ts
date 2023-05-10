import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProfilesController } from './profiles.controller';
import { Profile } from './profiles.model';
import { ProfilesService } from './profiles.service';

@Module({
    imports: [
        SequelizeModule.forFeature([Profile]),
        ClientsModule.register([
            {
                name: 'AUTH_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: [process.env.CLOUDAMQP_URL],
                    queue: process.env.AUTH_QUEUE,
                    queueOptions: { durable: false },
                },
            },
        ]),
    ],
    controllers: [ProfilesController],
    providers: [ProfilesService],
})
export class ProfilesModule {}