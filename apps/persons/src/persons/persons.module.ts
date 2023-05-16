import { Module } from '@nestjs/common';
import { PersonsController } from './persons.controller';
import { PersonsService } from './persons.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { PersonsFilms } from './persons.staff.m2m.model';
import { Persons } from './persons.model';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  controllers: [PersonsController],
  providers: [PersonsService],
  imports: [
    CacheModule.register({
      ttl: 5000,
    }),
    SequelizeModule.forFeature([Persons, PersonsFilms]),
  ],
})
export class PersonsModule {}
