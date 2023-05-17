import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Films } from '../films/films.model';
import { Budget } from './budget.model';

@Table({ tableName: 'films_budget' })
export class BudgetFilms extends Model<BudgetFilms> {
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

  @ForeignKey(() => Budget)
  @Column({ type: DataType.INTEGER })
  budgetId: number;
}