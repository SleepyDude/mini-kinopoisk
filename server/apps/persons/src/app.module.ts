import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PersonsModule } from './persons/persons.module';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ServiceRpcFilter } from '@shared';
import { SharedModule } from '@shared';

@Module({
  imports: [
    CacheModule.register(),
    SharedModule.registerDatabase(process.env.POSTGRES_PERSONS_DB),
    // SequelizeModule.forRoot({
    //   dialect: 'postgres',
    //   host: process.env.POSTGRES_HOST,
    //   port: Number(process.env.POSTGRES_PORT_INSIDE),
    //   username: process.env.POSTGRES_USER,
    //   password: process.env.POSTGRES_PASSWORD,
    //   database: process.env.POSTGRES_PERSONS_DB,
    //   models: [],
    //   autoLoadModels: true,
    // }),
    PersonsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ServiceRpcFilter,
    },
  ],
})
export class AppModule {}
