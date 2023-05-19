import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateGenreDto {
  @ApiProperty({
    example: 'ужасы',
    description: 'Название жанра на русском',
    required: false,
  })
  @IsString({ message: 'Строка' })
  genreNameRu?: string;

  @ApiProperty({
    example: 'horror',
    description: 'Название жанра на английском',
    required: false,
  })
  @IsString({ message: 'Строка' })
  genreNameEng?: string;
}
