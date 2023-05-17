import { ApiProperty, PickType } from '@nestjs/swagger';
import { RoleModelAttrs } from './roles.interface';

export class UserModelAttrs {
  @ApiProperty({ example: '1', description: 'Unique identifier' })
  id: number;

  @ApiProperty({
    example: '1',
    description: 'Вк identifier (при регистрации через вк)',
  })
  vkId: number;

  @ApiProperty({ example: 'name@post.ru', description: 'E-mail адрес' })
  email: string;

  @ApiProperty({ example: 'ё12амКвв%%цы', description: 'Пароль' })
  password: string;

  @ApiProperty({ example: 'false', description: 'Активирован ли аккаунт?' })
  isActivated: boolean;

  //   @ApiProperty({
  //     description: '',
  //     isArray: true,
  //     type: [RoleModelAttrs],
  //   })
  //   roles: RoleModelAttrs[];
}

export class UserCreationAttrs extends PickType(UserModelAttrs, [
  'email',
  'password',
  'vkId',
] as const) {}

export class UserPublic extends PickType(UserModelAttrs, [
  'email',
  'vkId',
] as const) {
  @ApiProperty({
    description: 'Роли пользователя',
    isArray: true,
    type: [RoleModelAttrs],
  })
  roles: RoleModelAttrs;
}
