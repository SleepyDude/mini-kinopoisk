import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Films } from '../films/films.model';
import { Genres } from './genres.model';

@Table({ tableName: 'genres_films' })
export class GenresFilms extends Model<GenresFilms> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => Films)
  @Column({ type: DataType.INTEGER })
  filmId: number;

  @ForeignKey(() => Genres)
  @Column({ type: DataType.INTEGER })
  genreId: number;
}