import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { PersonsController } from './controllers/persons.controller';
import { MoviesController } from './controllers/movies.controller';
import { AuthController } from './controllers/auth.controller';
import { RolesController } from './controllers/roles.controller';
import { ConfigModule } from '@nestjs/config';
import { InitController } from './controllers/init.controller';
import { ProfilesController } from './controllers/profiles.controller';
import { ReviewsController } from './controllers/reviews.controller';
import { FilesController } from './controllers/files.controller';
import { MoviesGenresController } from './controllers/movies-genres.controller';
import { MoviesCountriesController } from './controllers/movies-countries.controller';
import { SharedModule } from '@shared';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [process.env.NODE_ENV_LOCAL, process.env.NODE_ENV],
    }),
    SharedModule.registerRmq('AUTH-SERVICE', process.env.AUTH_QUEUE),
    SharedModule.registerRmq('SOCIAL-SERVICE', process.env.SOCIAL_QUEUE),
    SharedModule.registerRmq('MOVIES-SERVICE', process.env.MOVIES_QUEUE),
    SharedModule.registerRmq('PERSONS-SERVICE', process.env.PERSONS_QUEUE),
  ],
  controllers: [
    UsersController,
    PersonsController,
    AuthController,
    RolesController,
    MoviesController,
    InitController,
    ProfilesController,
    ReviewsController,
    FilesController,
    MoviesGenresController,
    MoviesCountriesController,
  ],
  providers: [],
})
export class ApiModule {}
