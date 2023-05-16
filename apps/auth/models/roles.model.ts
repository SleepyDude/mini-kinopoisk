import {
  Model,
  Table,
  Column,
  DataType,
  BelongsToMany,
} from 'sequelize-typescript';
import { User } from './users.model';
import { UserRoles } from './user-roles.model';
import { RoleModelAttrs, RoleCreationAttrs } from '@shared/interfaces';

@Table({ tableName: 'roles' })
export class Role extends Model<RoleModelAttrs, RoleCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.INTEGER,
    unique: false,
    allowNull: false,
    defaultValue: 1,
  })
  value: number;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, allowNull: false })
  description: string;

  @BelongsToMany(() => User, () => UserRoles)
  users: User[];
}
