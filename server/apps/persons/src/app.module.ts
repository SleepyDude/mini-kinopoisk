import { Module } from '@nestjs/common';
import { PersonsModule } from './persons/persons.module';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ServiceRpcFilter } from '@shared';
import { SharedModule } from '@shared';

@Module({
  imports: [
    CacheModule.register(),
    SharedModule.registerDatabase(process.env.POSTGRES_PERSONS_DB),
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
