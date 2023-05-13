import { ApiProperty, OmitType, PickType } from "@nestjs/swagger";

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

    @ApiProperty({example: '42', description: 'id пользователя, который владеет данным профилем'})
    user_id: number;
};

export class ProfileModelCreationAttrs extends PickType(ProfileModelAttrs, ['user_id'] as const) {}

// Возвращая профиль мы не показываем user_id
export class ProfileModelReturnAttrs extends OmitType(ProfileModelAttrs, ['user_id'] as const) {}

export class UpdateProfileDtoAttrs extends OmitType(ProfileModelAttrs, ['id', 'user_id'] as const) {};