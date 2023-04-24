import { Module } from '@nestjs/common';
import { PersonsController } from './persons.controller';
import { PersonsService } from './persons.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { PersonsFilms } from './persons.staff.m2m.model';
import { Persons } from './persons.model';

@Module({
  controllers: [PersonsController],
  providers: [PersonsService],
  imports: [SequelizeModule.forFeature([Persons, PersonsFilms])],
})
export class PersonsModule {}
