import { Module } from '@nestjs/common';
import { FilmsModule } from './films/films.module';
import {SequelizeModule} from "@nestjs/sequelize";
import { GenresModule } from './genres/genres.module';
import { CountriesModule } from './countries/countries.module';
import { BudgetModule } from './budget/budget.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT_INSIDE),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_MOVIES_DB,
      models: [],
      autoLoadModels: true,
    }),
      FilmsModule,
      GenresModule,
      CountriesModule,
      BudgetModule,
      ReviewsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
