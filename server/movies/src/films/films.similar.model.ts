import { BelongsToMany, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Films } from "./films.model";
import { SimilarFilms } from "./films.similar.m2m.model";

@Table({ tableName: 'similar' })
export class Similar extends Model<Similar> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({type: DataType.INTEGER})
  filmId: number;

  @Column({type: DataType.STRING})
  nameRu: string;

  @Column({type: DataType.STRING})
  nameEng: string;

  @Column({type: DataType.STRING})
  nameOriginal: string;

  @Column({type: DataType.TEXT})
  posterUrl: string;

  @Column({type: DataType.TEXT})
  posterUrlPreview: string;

  @ForeignKey(() => Films)
  @Column({ type: DataType.INTEGER })
  similarFilmId: number;

  @BelongsToMany(() => Films, () => SimilarFilms)
  films: [];
}