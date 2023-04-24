import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'films' })
export class Films extends Model<Films> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.INTEGER })
  kinopoiskId: number;

  @Column({ type: DataType.STRING })
  nameRu: string;

  @Column({ type: DataType.STRING })
  nameOriginal: string;

  @Column({ type: DataType.STRING })
  posterUrl: string;

  @Column({ type: DataType.STRING })
  posterUrlPreview: string;

  @Column({ type: DataType.STRING })
  coverUrl: string;

  @Column({ type: DataType.STRING })
  logoUrl: string;

  @Column({ type: DataType.INTEGER })
  reviewsCount: number;

  @Column({ type: DataType.INTEGER })
  ratingGoodReview: number;

  @Column({ type: DataType.INTEGER })
  ratingGoodReviewVoteCount: number;

  @Column({ type: DataType.INTEGER })
  ratingKinopoisk: number;

  @Column({ type: DataType.INTEGER })
  ratingKinopoiskVoteCount: number;

  @Column({ type: DataType.INTEGER })
  ratingFilmCritics: number;

  @Column({ type: DataType.INTEGER })
  ratingFilmCriticsVoteCount: number;

  @Column({ type: DataType.INTEGER })
  year: number;

  @Column({ type: DataType.STRING })
  filmLength: string;

  @Column({ type: DataType.TEXT })
  slogan: string;

  @Column({ type: DataType.TEXT })
  description: string;

  @Column({ type: DataType.TEXT })
  shortDescription: string;

  @Column({ type: DataType.STRING })
  type: string;

  @Column({ type: DataType.STRING })
  ratimgMpaa: string;

  @Column({ type: DataType.STRING })
  ratingAgeLimits: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  serial: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  shortFilm: boolean;
}
