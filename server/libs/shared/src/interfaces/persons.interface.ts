import { Persons, PersonsFilms } from '@shared';

export interface PersonByIdObjectInterface {
  filmsId: PersonsFilms[];
  person: Persons;
}

export interface GetStaffByFilmIdInterface {
  id: number;
  size?: number;
}
