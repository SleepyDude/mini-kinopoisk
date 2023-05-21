import { Persons, PersonsFilms } from '@shared';

export interface IPersonByIdObject {
  filmsId: PersonsFilms[];
  person: Persons;
}

export interface IGetStaffByFilmId {
  id: number;
  size?: number;
}
