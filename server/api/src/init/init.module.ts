import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
// import { JwtModule } from '@nestjs/jwt';
// import { SharedModule } from 'y/shared';
// import { AuthModule } from '../auth.module';
// import { RolesModule } from '../roles/roles.module';
// import { UsersModule } from '../users/users.module';
import { InitController } from './init.controller';
import { InitService } from './init.service';

@Module({
    controllers: [InitController],
    providers: [InitService],
    imports: [
        // RolesModule, // для создания и проверки ролей
        // UsersModule, // для addRole
        ConfigModule.forRoot({
            envFilePath: [process.env.NODE_ENV_LOCAL, process.env.NODE_ENV],
        }),
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
    ],
    exports: []
})
export class InitModule {}
