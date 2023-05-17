import { Persons, PersonsFilms } from '@shared';

export interface PersonByIdObjectInterface {
  filmsId: PersonsFilms[];
  person: Persons;
}
