import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class DepthQueryDto {
  @ApiProperty({
    example: 3,
    description: 'Глубина дерева отзывов',
    required: false,
  })
  @IsOptional()
  depth: number;
}
