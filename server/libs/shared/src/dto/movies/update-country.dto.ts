import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateCountryDto {

  @ApiProperty({ example: 'Россия', description: 'Страна на русском' })
  @IsString({ message: 'Строка' })
  readonly countryNameRu?: string;

  @ApiProperty({ example: 'Russia', description: 'Страна на английском' })
  @IsString({ message: 'Строка' })
  readonly countryNameEng?: string;
}
