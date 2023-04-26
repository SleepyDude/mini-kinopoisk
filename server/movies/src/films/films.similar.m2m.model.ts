import { Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Films } from "./films.model";
import { Similar } from "./films.similar.model";

@Table({ tableName: 'similar_films' })
export class SimilarFilms extends Model<SimilarFilms> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => Films)
  @Column({ type: DataType.INTEGER })
  kinopoiskId: number;

  @ForeignKey(() => Similar)
  @Column({ type: DataType.INTEGER })
  similarFilmId: number;
}