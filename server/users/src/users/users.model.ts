import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface UserCreateAttrs {
  email: string;
  password: string;
}

@Table({ tableName: 'users' })
export class Users extends Model<Users, UserCreateAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  password: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isActivated: boolean;

  @Column({ type: DataType.STRING, allowNull: false })
  activationLink: string;

  @Column({ type: DataType.STRING, defaultValue: 'USER' })
  role: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  profileId: number;
}
