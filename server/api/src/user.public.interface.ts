import { Role } from '@hotels2023nestjs/shared';
import { ApiProperty } from '@nestjs/swagger';

export class UserPublic {
  @ApiProperty({
    example: 'user@mail.ru',
    description: 'email пользователя, если имеется',
  })
  email: string;

  @ApiProperty({
    isArray: true,
    type: Role,
  })
  roles: Role[];
}
