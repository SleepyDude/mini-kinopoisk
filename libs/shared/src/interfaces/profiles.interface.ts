import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';

export class ProfileModelAttrs {
  id: number;

  @ApiProperty({ example: 'Ubivashka666', description: 'Имя пользователя' })
  username: string;

  @ApiProperty({ example: 'Минди', description: 'Имя' })
  name: string;

  @ApiProperty({ example: 'Макриди', description: 'Фамилия' })
  lastName: string;

  @ApiProperty({ example: 'Пипец', description: 'Любимый фильм' })
  favMovie: string;

  @ApiProperty({ example: '1', description: 'ID аватара' })
  avatarId: number;

  @ApiProperty({
    example: '42',
    description: 'id пользователя, который владеет данным профилем',
  })
  userId: number;
}

export class ProfileModelCreationAttrs extends PickType(ProfileModelAttrs, [
  'userId',
] as const) {}

// Возвращая профиль мы не показываем user_id
export class ProfilePublic extends OmitType(ProfileModelAttrs, [
  'userId',
] as const) {}

export class UpdateProfileDtoAttrs extends OmitType(ProfileModelAttrs, [
  'id',
  'userId',
] as const) {}
