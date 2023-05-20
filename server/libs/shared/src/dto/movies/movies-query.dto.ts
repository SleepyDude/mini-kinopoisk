import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  FiltersMoviesOrderBy,
  FiltersMoviesTypes,
} from '@shared/dto/movies/filters-movies-query.enum';

export class MoviesQueryDto {
  @ApiProperty({
    example: 0,
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
    example: 'Криминальное',
    description: 'Имя только на русском языке',
    required: false,
  })
  @IsOptional()
  name?: string;
}

export class MoviesFiltersQueryDto {
  @ApiProperty({
    example: '2000',
    description: 'Год',
    required: false,
  })
  @IsOptional()
  year?: string;

  @ApiProperty({
    enum: FiltersMoviesTypes,
    description: 'По сериалам или фильмам',
    required: false,
  })
  @IsOptional()
  type?: string;

  @ApiProperty({
    example: '6.1',
    description: 'Рейтинг от значения и выше',
    required: false,
  })
  @IsOptional()
  ratingKinopoisk?: number;

  @ApiProperty({
    example: '100000',
    description: 'Количество голосов и выше',
    required: false,
  })
  @IsOptional()
  ratingKinopoiskVoteCount?: number;

  @ApiProperty({
    example: '1',
    description: 'Айди жанра из модели жанров, поле id',
    required: false,
  })
  @IsOptional()
  genreId?: number;

  @ApiProperty({
    example: '1',
    description: 'Айди стран из модели стран, поле id',
    required: false,
  })
  @IsOptional()
  countryId?: number;

  @ApiProperty({
    enum: FiltersMoviesOrderBy,
    description: 'Сортировка по',
    required: false,
  })
  @IsOptional()
  orderBy?: string;

  @ApiProperty({
    example: '7640',
    description: 'Айди режиссера из модели persons по personId',
    required: false,
  })
  @IsOptional()
  DIRECTOR?: string;

  @ApiProperty({
    example: '7640',
    description: 'Айди актера из модели persons по personId',
    required: false,
  })
  @IsOptional()
  ACTOR?: string;

  @ApiProperty({
    example: '1',
    description: 'Страница для пагинации',
    required: false,
  })
  @IsOptional()
  page?: number;

  @ApiProperty({
    example: '1',
    description: 'Лимит объектов на странице',
    required: false,
  })
  @IsOptional()
  size?: number;
}

export class MoviesQueryAutosagestDto {
  @ApiProperty({
    example: 'аватар',
    description: 'Название фильма на русском языке',
    required: false,
  })
  @IsOptional()
  nameRu?: string;

  @ApiProperty({
    example: 'avatar',
    description: 'Название фильма на английском языке',
    required: false,
  })
  @IsOptional()
  nameOriginal?: string;

  @ApiProperty({
    example: '10',
    description: 'Лимит фильмов. По умолчанию 10, можно меньше но не больше',
    required: false,
  })
  @IsOptional()
  size?: number;
}

export class MoviesUpdateFilmDto {
  @ApiProperty({
    example: 'аватар',
    description: 'Название фильма на русском языке',
    required: false,
  })
  @IsOptional()
  nameRu?: string;

  @ApiProperty({
    example: 'avatar',
    description: 'Название фильма на английском языке',
    required: false,
  })
  @IsOptional()
  nameOriginal?: string;
}

export class MoviesGetStaffByFilmIdDto {
  @ApiProperty({
    example: '1',
    description: 'Лимит вывода',
    required: false,
  })
  @IsOptional()
  size?: number;
}
