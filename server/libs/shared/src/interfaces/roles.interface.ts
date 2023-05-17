import { ApiProperty, OmitType } from '@nestjs/swagger';

export class RoleModelAttrs {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор роли' })
  id: number;

  @ApiProperty({ example: 'ADMIN', description: 'Имя роли' })
  name: string;

  @ApiProperty({ example: '10', description: 'Сила роли администратора' })
  value: number;

  @ApiProperty({ example: 'Администратор', description: 'Описание роли' })
  description: string;
}

export class RoleCreationAttrs extends OmitType(RoleModelAttrs, [
  'id',
] as const) {}

export class RolePublic extends RoleModelAttrs {}
