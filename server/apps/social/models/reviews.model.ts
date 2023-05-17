import { ReviewModelAttrs, ReviewModelCreationAttrs } from '@shared/interfaces';
import {
  Model,
  Table,
  Column,
  DataType,
  Index,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Profile } from './profiles.model';

@Table({ tableName: 'reviews' })
export class Review extends Model<ReviewModelAttrs, ReviewModelCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Index
  @Column({ type: DataType.INTEGER, allowNull: false })
  filmId: number;

  @Column({ type: DataType.STRING })
  title: string;

  @Column({ type: DataType.TEXT })
  text: string;

  @Column({ type: DataType.TEXT, defaultValue: '' })
  path: string;

  @ForeignKey(() => Profile)
  @Column({ type: DataType.INTEGER, allowNull: false })
  profileId: number;

  @BelongsTo(() => Profile)
  profile: Profile;

  @Column({ type: DataType.INTEGER, allowNull: false })
  depth: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  childsNum: number;

  @Column({ type: DataType.INTEGER })
  parentId: number;
}
