import {
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Films } from '../films/films.model';
import { BudgetFilms } from './budget.m2m.model';

@Table({ tableName: 'budget' })
export class Budget extends Model<Budget> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING })
  type: string;

  @Column({ type: DataType.INTEGER })
  amount: number;

  @Column({ type: DataType.STRING })
  currencyCode: string;

  @Column({ type: DataType.STRING })
  name: string;

  @Column({ type: DataType.STRING })
  symbol: string;

  @ForeignKey(() => Films)
  @Column({ type: DataType.INTEGER })
  filmId: number;

  @BelongsToMany(() => Films, () => BudgetFilms)
  films: [];
}
