import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ProfilePublic } from './profiles.interface';

export class ReviewModelAttrs {
  id: number;

  @ApiProperty({
    example: '13',
    description: 'id которое является PK для фильма',
  })
  filmId: number;

  @ApiProperty({ example: '42', description: 'id родительского отзыва' })
  parentId: number | null;

  @ApiProperty({
    example: '7',
    description: 'id профиля пользователя, который написал отзыв',
  })
  profileId: number;

  @ApiProperty({ example: 'Ужасный фильм!', description: 'Заголовок' })
  title: string;

  @ApiProperty({
    example: 'Мне очень не понравилось, 0/10',
    description: 'Текст отзыва',
  })
  text: string;

  @ApiProperty({ example: '4', description: 'Число отзывов-потомков' })
  childsNum: number;

  @ApiProperty({
    example: '1.3.14.15.17.',
    description: 'Описывает иерархию отзыва в дереве отзывов',
  })
  path: string;

  @ApiProperty({
    example: '3',
    description: 'Глубина отзыва, например, 0 - отзыв к самому фильму',
  })
  depth: number;

  profile: any;
  createdAt?: any;
  updatedAt?: any;
}

export class ReviewModelCreationAttrs extends OmitType(ReviewModelAttrs, [
  'id',
] as const) {}

export class ReviewPublic extends OmitType(ReviewModelAttrs, [
  'profileId',
] as const) {
  @ApiProperty({
    description: 'Профиль пользователя',
    isArray: false,
    type: ProfilePublic,
  })
  profile: ProfilePublic;
}

export class ReviewPublicCount {
  @ApiProperty({
    example: '418',
    description: 'Общее число отзывов данного уровня',
  })
  count: number;
  @ApiProperty({
    description: 'Массив отзывов данного уровня на странице',
    isArray: true,
    type: [ReviewPublic],
  })
  rows: ReviewPublic[];
}

export class ReviewTreePublic extends ReviewPublic {
  @ApiProperty({
    description:
      'Дети текущего отзыва (может быть пустым в виду ограничения на глубину)',
    isArray: true,
    type: [ReviewTreePublic],
  })
  childs: ReviewTreePublic[];
}

// export class ReviewModelWithProfileAndChilds extends OmitType(
//   ReviewModelAttrs,
//   ['profileId'] as const,
// ) {
//   profile: ProfileModelReturnAttrs;
//   childs: ReviewModelWithProfileAndChilds[];
// }
