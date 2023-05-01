import {
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Budget } from '../budget/budget.model';
import { Countries } from '../countries/countries.model';
import { Genres } from '../genres/genres.model';
import { BudgetFilms } from '../budget/budget.m2m.model';
import { CountriesFilms } from '../countries/countries.m2m.model';
import { GenresFilms } from '../genres/genres.m2m.model';
import { Trailers } from '../trailers/trailers.model';
import { SimilarFilms } from './films.similar.m2m.model';
import { Similar } from './films.similar.model';
import { Reviews } from '../reviews/reviews.model';

@Table({ tableName: 'films' })
export class Films extends Model<Films> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.INTEGER })
  kinopoiskId: number;

  @Column({ type: DataType.STRING })
  nameRu: string;

  @Column({ type: DataType.STRING })
  nameOriginal: string;

  @Column({ type: DataType.TEXT })
  posterUrl: string;

  @Column({ type: DataType.TEXT })
  posterUrlPreview: string;

  @Column({ type: DataType.TEXT })
  coverUrl: string;

  @Column({ type: DataType.TEXT })
  logoUrl: string;

  @Column({ type: DataType.STRING })
  reviewsCount: string;

  @Column({ type: DataType.STRING })
  ratingGoodReview: string;

  @Column({ type: DataType.STRING })
  ratingGoodReviewVoteCount: string;

  @Column({ type: DataType.STRING })
  ratingKinopoisk: string;

  @Column({ type: DataType.STRING })
  ratingKinopoiskVoteCount: string;

  @Column({ type: DataType.STRING })
  ratingFilmCritics: string;

  @Column({ type: DataType.STRING })
  ratingFilmCriticsVoteCount: string;

  @Column({ type: DataType.INTEGER })
  year: number;

  @Column({ type: DataType.STRING })
  filmLength: string;

  @Column({ type: DataType.TEXT })
  slogan: string;

  @Column({ type: DataType.TEXT })
  description: string;

  @Column({ type: DataType.TEXT })
  shortDescription: string;

  @Column({ type: DataType.STRING })
  type: string;

  @Column({ type: DataType.STRING })
  ratimgMpaa: string;

  @Column({ type: DataType.STRING })
  ratingAgeLimits: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  serial: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  shortFilm: boolean;

  @BelongsToMany(() => Budget, () => BudgetFilms)
  budget: [];

  @BelongsToMany(() => Countries, () => CountriesFilms)
  countries: Countries[];

  @BelongsToMany(() => Genres, () => GenresFilms)
  genres: [];

  @BelongsToMany(() => Similar, () => SimilarFilms)
  similar: [];

  @HasMany(() => Trailers)
  trailers: Trailers[];

  @HasMany(() => Reviews)
  reviews: Reviews[];
}
