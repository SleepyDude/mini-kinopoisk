import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Films } from '../films/films.model';
import { Countries } from './countries.model';

@Table({ tableName: 'films_countries' })
export class CountriesFilms extends Model<CountriesFilms> {
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

  @ForeignKey(() => Countries)
  @Column({ type: DataType.INTEGER })
  countryId: number;
}