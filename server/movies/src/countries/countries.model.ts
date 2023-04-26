import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { Films } from '../films/films.model';
import { CountriesFilms } from './countries.m2m.model';

@Table({ tableName: 'countries' })
export class Countries extends Model<Countries> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING })
  countryNameRu: string;

  @Column({ type: DataType.STRING })
  countryNameEng: string;

  @BelongsToMany(() => Films, () => CountriesFilms)
  films: [];
}