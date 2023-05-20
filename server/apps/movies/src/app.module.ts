import { Module } from '@nestjs/common';
import { FilmsModule } from './films/films.module';
import { GenresModule } from './genres/genres.module';
import { CountriesModule } from './countries/countries.module';
import { BudgetModule } from './budget/budget.module';
import { TrailersModule } from './trailers/trailers.module';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ServiceRpcFilter } from '@shared';
import { SharedModule } from '@shared';

@Module({
  imports: [
    CacheModule.register(),
    SharedModule.registerDatabase(process.env.POSTGRES_MOVIES_DB),
    FilmsModule,
    GenresModule,
    CountriesModule,
    BudgetModule,
    TrailersModule,
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
