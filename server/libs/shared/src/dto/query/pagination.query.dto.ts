import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class PaginationQueryDto {
  @ApiProperty({
    example: 10,
    description: 'Число элементов на одной странице',
    required: false,
  })
  @IsOptional()
  size: number;

  @ApiProperty({
    example: 0,
    description: 'Номер страницы',
    required: false,
  })
  @IsOptional()
  page: number;
}
