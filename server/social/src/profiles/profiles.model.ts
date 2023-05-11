import {
  ProfileModelAttrs,
  ProfileModelCreationAttrs,
} from '@hotels2023nestjs/shared';
import { Model, Table, Column, DataType, HasMany } from 'sequelize-typescript';
import { Review } from '../reviews/reviews.model';

@Table({ tableName: 'profiles' })
export class Profile extends Model<
  ProfileModelAttrs,
  ProfileModelCreationAttrs
> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING })
  username: string;

  @Column({ type: DataType.STRING })
  favMovie: string;

  @Column({ type: DataType.STRING })
  avatarUrl: string;

  @Column({ type: DataType.INTEGER, unique: true, allowNull: false })
  user_id: number;

  @HasMany(() => Review)
  reviews: Review[];
}
