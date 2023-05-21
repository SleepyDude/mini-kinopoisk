import { MoviesUpdateFilmDto } from '@shared/dto';

export interface IMoviesUpdateFilmWithFilmId {
  id?: number;
  film?: MoviesUpdateFilmDto;
}
