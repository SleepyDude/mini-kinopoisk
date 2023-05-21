import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateUserVkDto {
  @ApiProperty({ example: 'user@gmail.com', description: 'Почтовый адрес' })
  readonly email: string;

  @ApiProperty({ example: '4815162342', description: 'Пароль' })
  @IsString({ message: 'Должно быть строкой' })
  @Length(4, 16, { message: 'Длина пароля от 4 до 16 символов' })
  readonly password: string;

  readonly vk_id?: number;
}
