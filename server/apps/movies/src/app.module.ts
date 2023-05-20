import { Module } from '@nestjs/common';
import { FilmsModule } from './films/films.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { GenresModule } from './genres/genres.module';
import { CountriesModule } from './countries/countries.module';
import { BudgetModule } from './budget/budget.module';
import { TrailersModule } from './trailers/trailers.module';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SharedModule } from '@shared';

@Module({
  imports: [
    CacheModule.register(),
    SharedModule.registerDatabase(process.env.POSTGRES_MOVIES_DB),
    // SequelizeModule.forRoot({
    //   dialect: 'postgres',
    //   host: process.env.POSTGRES_HOST,
    //   port: Number(process.env.POSTGRES_PORT_INSIDE),
    //   username: process.env.POSTGRES_USER,
    //   password: process.env.POSTGRES_PASSWORD,
    //   database: process.env.POSTGRES_MOVIES_DB,
    //   models: [],
    //   autoLoadModels: true,
    // }),
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
  ],
})
export class AppModule {}
