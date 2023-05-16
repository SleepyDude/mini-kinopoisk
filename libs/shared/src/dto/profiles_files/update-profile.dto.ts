import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Ubivashka666', description: 'Имя пользователя' })
  @IsString({ message: 'Должно быть строкой' })
  @IsOptional()
  readonly username: string;

  @ApiProperty({ example: 'Минди', description: 'Имя' })
  @IsString({ message: 'Должно быть строкой' })
  @IsOptional()
  readonly name: string;

  @ApiProperty({ example: 'Макриди', description: 'Фамилия' })
  @IsString({ message: 'Должно быть строкой' })
  @IsOptional()
  readonly lastName: string;

  @ApiProperty({ example: 'Пипец', description: 'Любимый фильм' })
  @IsString({ message: 'Должно быть строкой' })
  @IsOptional()
  readonly favMovie: string;
}
