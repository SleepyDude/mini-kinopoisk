import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class ReviewQueryDto {
  @ApiProperty({
    example: 10,
    description: 'Размер выгрузки комментариев по ширине. 0 - Все комментарии',
    default: '',
    required: false,
  })
  @IsOptional()
  size: number;

  @ApiProperty({
    example: 0,
    description: 'Номер страницы при выгрузке по ширине. Начало с 0',
    default: '',
    required: false,
  })
  @IsOptional()
  page: number;

  @ApiProperty({
    example: 3,
    description: 'Размер выгрузки комментариев в грубину. 0 - Все доступные',
    default: '',
    required: false,
  })
  @IsOptional()
  depth: number;
}
