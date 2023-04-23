import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'countries_films' })
export class CountriesFilms extends Model<CountriesFilms> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.INTEGER })
  kinopoiskFilmId: number;

  @Column({ type: DataType.INTEGER })
  countryId: number;
}
