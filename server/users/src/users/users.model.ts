import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

interface UserCreateAttrs {
  email: string;
  password: string;
}

@Table({ tableName: 'users' })
export class Users extends Model<Users, UserCreateAttrs> {

  @ApiProperty({example: '1', description: 'Unique identifier'}) 
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({example: 'name@post.ru', description: 'E-mail address'}) 
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  email: string;

  @ApiProperty({example: '********', description: 'Secure password'}) 
  @Column({ type: DataType.STRING, allowNull: false })
  password: string;

  @ApiProperty({example: 'false', description: 'Is account activated?'}) 
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isActivated: boolean;

  @ApiProperty({example: '', description: 'Activation link'}) 
  @Column({ type: DataType.STRING, allowNull: false })
  activationLink: string;
}
