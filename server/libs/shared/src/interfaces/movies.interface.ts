import { MoviesUpdateFilmDto } from '@shared/dto';

export interface MoviesUpdateFilmWithFilmIdDto {
  id?: number;
  film?: MoviesUpdateFilmDto;
}
