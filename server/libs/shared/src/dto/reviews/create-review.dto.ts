import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    example: '13',
    description: 'id фильма на странице которого находится комментарий',
  })
  @IsInt({ message: 'Должно быть целым числом' })
  readonly filmId: number;

  @ApiProperty({ example: '4', description: 'id комментария родителя' })
  @IsInt({ message: 'Должно быть целым числом' })
  @IsOptional()
  readonly parentId: number;

  @ApiProperty({ example: 'Ужасный филем', description: 'Заголовок' })
  @IsString({ message: 'Должно быть строкой' })
  @IsOptional()
  readonly title: string;

  @ApiProperty({
    example: 'Мне очень не понравилось, 0/10',
    description: 'Текст комментария',
  })
  @IsString({ message: 'Должно быть строкой' })
  readonly text: string;
}
