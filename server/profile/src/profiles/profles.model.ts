import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface ProfileCreateAttrs {
  lastName: string;
  firstName: string;
  telNumber: string;
}

@Table({ tableName: 'profiles' })
export class Profiles extends Model<Profiles, ProfileCreateAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING })
  lastName: string;

  @Column({ type: DataType.STRING })
  firstName: string;

  @Column({ type: DataType.STRING })
  telNumber: string;

  @Column({ type: DataType.STRING })
  avatar: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;
}
