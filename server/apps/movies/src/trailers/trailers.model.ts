import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Films } from '../films/films.model';

@Table({ tableName: 'trailers' })
export class Trailers extends Model<Trailers> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.TEXT })
  url: string;

  @Column({ type: DataType.STRING })
  name: string;

  @Column({ type: DataType.STRING })
  site: string;

  @ForeignKey(() => Films)
  @Column({ type: DataType.INTEGER })
  kinopoiskFilmId: number;

  @BelongsTo(() => Films)
  film: Films[];
}
