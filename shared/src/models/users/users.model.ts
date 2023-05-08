import { BelongsToMany, Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from './roles.model';
import { UserRoles } from './user-roles.model';

interface UserCreateAttrs {
  email: string;
  password: string;
}

@Table({ tableName: 'users' })
export class User extends Model<User, UserCreateAttrs> {

  @ApiProperty({example: '1', description: 'Unique identifier'}) 
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({example: '1', description: 'Вк identifier'}) 
  @Column({
    type: DataType.INTEGER,
    unique: true
  })
  vk_id: number;

  @ApiProperty({example: 'name@post.ru', description: 'E-mail адрес'}) 
  @Column({ type: DataType.STRING, unique: true, allowNull: true })
  email: string;

  @ApiProperty({example: 'ё12амКвв%%цы', description: 'Пароль'}) 
  @Column({ type: DataType.STRING, allowNull: true })
  password: string;

  @ApiProperty({example: 'false', description: 'Активирован ли аккаунт?'}) 
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isActivated: boolean;

  @BelongsToMany( () => Role, () => UserRoles)
  roles: Role[];
}
