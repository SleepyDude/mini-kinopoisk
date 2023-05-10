import { ApiProperty, OmitType } from '@nestjs/swagger';

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

    @ApiProperty({ example: '1.3.14.15.17.', description: 'Описывает иерархию комментария в дереве комментариев' })
    path: string;
};

export class ReviewModelCreationAttrs extends OmitType(ReviewModelAttrs, ['id'] as const) {};

export class ReviewModelReturnAttrs extends OmitType(ReviewModelAttrs, ['id'] as const) {};
