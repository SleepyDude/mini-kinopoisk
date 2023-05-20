import { Module } from '@nestjs/common';
import { ProfilesModule } from './profiles/profiles.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { DatabaseFilesModule } from './databaseFiles/files.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SharedModule } from '@shared';

@Module({
  imports: [
    ProfilesModule,
    ReviewsModule,
    DatabaseFilesModule,
    SharedModule.registerDatabase(process.env.POSTGRES_SOCIAL_DB),
    SharedModule.registerRmq('AUTH-SERVICE', process.env.AUTH_QUEUE),
    // SequelizeModule.forRoot({
    //   dialect: 'postgres',
    //   host: process.env.POSTGRES_HOST,
    //   port: Number(process.env.POSTGRES_PORT_INSIDE),
    //   username: process.env.POSTGRES_USER,
    //   password: process.env.POSTGRES_PASSWORD,
    //   database: process.env.POSTGRES_SOCIAL_DB,
    //   models: [],
    //   autoLoadModels: true,
    // }),
    // ClientsModule.register([
    //   {
    //     name: 'AUTH-SERVICE',
    //     transport: Transport.RMQ,
    //     options: {
    //       urls: [process.env.CLOUDAMQP_URL],
    //       queue: process.env.AUTH_QUEUE,
    //       queueOptions: { durable: false },
    //     },
    //   },
    // ]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
