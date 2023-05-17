import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { FiltersProfessionQuery } from '@shared/dto/persons/filters.query.enum';

export class PersonsQueryDto {
  @ApiProperty({
    example: 1,
    description: 'Номер страницы',
    required: false,
  })
  @IsOptional()
  page?: number;

  @ApiProperty({
    example: 10,
    description: 'Чисто элементов на одной странице',
    required: false,
  })
  @IsOptional()
  size?: number;

  @ApiProperty({
    example: 'Егор',
    description: 'Имя только на русском языке',
    required: false,
  })
  @IsOptional()
  name?: string;
}

export class PersonsAutosagestDto {
  @ApiProperty({
    enum: FiltersProfessionQuery,
    description: 'квери по актеру или режиссеру',
  })
  profession: string;

  @ApiProperty({
    example: 'Квентин тар',
    description: 'Только русское имя',
  })
  name: string;

  @ApiProperty({
    example: 10,
    description: 'Количество объектов',
    required: false,
  })
  @IsOptional()
  size?: number;
}

export class StaffQueryDto {
  id: number;
  size?: number;
}
