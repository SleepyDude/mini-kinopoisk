import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ProfileModelReturnAttrs } from './profiles.interface';

export class ReviewModelAttrs {
    id: number;

    @ApiProperty({ example: '13', description: 'id которое является PK для фильма' })
    film_id: number;

    // @ApiProperty({ example: '42', description: 'id родительского review' })
    // parent_id: number | null;

    @ApiProperty({ example: '7', description: 'id профиля' })
    profile_id: number;

    @ApiProperty({ example: 'Ужасный фильм!', description: 'Заголовок' })
    title: string;

    @ApiProperty({ example: 'Мне очень не понравилось, 0/10', description: 'Текст обзора' })
    text: string;

    @ApiProperty({ example: '4', description: 'Число комментариев-потомков' })
    childsNum: number;

    @ApiProperty({ example: '1.3.14.15.17.', description: 'Описывает иерархию комментария в дереве комментариев' })
    path: string;

    @ApiProperty({ example: '3', description: 'Глубина комментария, 0 - комментарий к фильму' })
    depth: number;

    @ApiProperty({ example: '17', description: 'id родителя если он есть' })
    parent_id: number;

};

export class ReviewModelCreationAttrs extends OmitType(ReviewModelAttrs, ['id'] as const) {};

export class ReviewModelReturnAttrs extends OmitType(ReviewModelAttrs, ['id'] as const) {};

export class ReviewModelWithProfile extends OmitType(ReviewModelAttrs, ['profile_id'] as const) {
    profile: ProfileModelReturnAttrs;
};

export class ReviewModelWithProfileAndChilds extends OmitType(ReviewModelAttrs, ['profile_id'] as const) {
    profile: ProfileModelReturnAttrs;
    childs: ReviewModelWithProfileAndChilds[];
};
