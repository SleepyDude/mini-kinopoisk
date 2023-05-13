import { ApiProperty } from '@nestjs/swagger';
import { Model, Table, Column, DataType } from 'sequelize-typescript';

interface ProfileAttrs {
  id: number;
  username: string;
  favMovie: string;
  avatarId: number;
  user_id: number;
}

type ProfileCreationAttrs = Pick<ProfileAttrs, 'user_id'>;

@Table({ tableName: 'profiles' })
export class Profile extends Model<ProfileAttrs, ProfileCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  // @ApiProperty({ example: 'dsgserEEgsdg', description: 'Внутренний id профиля пользователя' })
  // @Column({ type: DataType.STRING })
  // uuid: string;

  @ApiProperty({ example: 'Ubivashka666', description: 'Имя пользователя' })
  @Column({ type: DataType.STRING })
  username: string;

  @ApiProperty({ example: 'Минди', description: 'Имя' })
  @Column({ type: DataType.STRING })
  name: string;

  @ApiProperty({ example: 'Макриди', description: 'Фамилия' })
  @Column({ type: DataType.STRING })
  lastName: string;

  @ApiProperty({ example: 'Пипец', description: 'Любимый фильм' })
  @Column({ type: DataType.STRING })
  favMovie: string;

  @ApiProperty({ example: '1', description: 'ID аватара' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  avatarId: number;

  @ApiProperty({
    example: '42',
    description: 'id пользователя, который владеет данным профилем',
  })
  @Column({ type: DataType.INTEGER, unique: true, allowNull: false })
  user_id: number;
}
