import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Films } from '../films/films.model';

@Table({ tableName: 'reviews' })
export class Reviews extends Model<Reviews> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => Films)
  @Column({ type: DataType.INTEGER })
  filmIdFK: number;

  @ForeignKey(() => Reviews)
  @Column({ type: DataType.INTEGER })
  parentId: number;

  @Column({ type: DataType.INTEGER })
  filmId: number;

  @Column({ type: DataType.INTEGER })
  userId: number;

  @Column({ type: DataType.STRING })
  name: string;

  @Column({ type: DataType.TEXT })
  text: string;

  @BelongsTo(() => Films)
  film: Films[];

  @HasMany(() => Reviews)
  reviews: Reviews[];
}
