import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './auth/auth.module';
import { TokensModule } from './tokens/tokens.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [
      // ConfigModule.forRoot({
      // envFilePath: [process.env.NODE_ENV_LOCAL, process.env.NODE_ENV],
      // // envFilePath: './.env',
      // }),
      // ClientsModule.register([{
      //   name: 'SOCIAL-SERVICE',
      //   transport: Transport.RMQ,
      //   options: {
      //     urls: [process.env.CLOUDAMQP_URL],
      //     queue: process.env.SOCIAL_QUEUE,
      //     queueOptions: { durable: false },
      //   },
      // },],),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT_INSIDE),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_USERS_DB,
      models: [],
      autoLoadModels: true,
    }),
    AuthModule,
    TokensModule, 
    RolesModule,
    UsersModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
