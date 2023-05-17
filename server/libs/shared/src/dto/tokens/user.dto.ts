import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: 'name@post.com', description: 'Адрес e-mail' })
  email: string;

  @ApiProperty({ example: '1', description: 'Уникальный id пользователя' })
  id: number;

  @ApiProperty({ example: '1', description: 'Роли пользователя' })
  roles: [any] | [];

  constructor(model) {
    this.email = model.email;
    this.id = model.id;
    this.roles = model.roles;
  }
}
