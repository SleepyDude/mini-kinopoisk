import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateGenreDto {

  @ApiProperty({ example: 'ужасы', description: 'Название жанра на русском' })
  @IsString({ message: 'Строка' })
  genreNameRu?: string;

  @ApiProperty({ example: 'horror', description: 'Название жанра на английском' })
  @IsString({ message: 'Строка' })
  genreNameEng?: string;
}
