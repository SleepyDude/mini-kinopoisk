import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProfileDto {
  @ApiProperty({ example: '2', description: 'ID юзера' })
  @IsNumber({}, { message: 'Должно быть числом' })
  readonly user_id: number;

  @ApiProperty({ example: 'Ubivashka666', description: 'Никнейм' })
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

  @ApiProperty({ example: '1', description: 'ID аватара' })
  @IsNumber({}, { message: 'Должно быть числом' })
  @IsOptional()
  readonly avatarId: number;

  @ApiProperty({ example: 'Пипец', description: 'Любимый фильм' })
  @IsString({ message: 'Должно быть строкой' })
  @IsOptional()
  readonly favMovie: string;
}
