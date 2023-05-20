import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteRoleDto {
  @ApiProperty({ example: 'SMALLADMIN', description: 'Имя роли' })
  @IsString({ message: 'Должно быть строкой' })
  readonly name: string;
}
