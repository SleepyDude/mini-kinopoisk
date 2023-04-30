import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateReviewDto {

  @ApiProperty({ example: '1 или null', description: 'указывать число или null' })
  parentId: number | null;

  @ApiProperty({ example: 'Ivan Ivanov', description: 'Указывать имя пользователя' })
  @IsString({ message: 'Должно быть строкой' })
  name: string;

  @ApiProperty({ example: 'some text about film', description: 'Поле для комментария' })
  @IsString({ message: 'Должно быть строкой' })
  text: string;
}