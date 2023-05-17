import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'persons_films' })
export class PersonsFilms extends Model<PersonsFilms> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.INTEGER })
  filmId: number;

  @Column({ type: DataType.INTEGER })
  staffId: number;

  @Column({ type: DataType.STRING })
  professionText: string;

  @Column({ type: DataType.STRING })
  professionKey: string;
}
