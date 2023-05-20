import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  MoviesQueryDto,
  MoviesFiltersQueryDto,
  MoviesQueryAutosagestDto,
  MoviesUpdateFilmDto,
  MoviesGetStaffByFilmIdDto,
} from '@shared/dto';

import { RolesGuard } from '../guards/roles.guard';
import { RoleAccess } from '../guards/roles.decorator';
import { initRoles } from '../guards/init.roles';
import { AllExceptionsFilter } from '../filters/all.exceptions.filter';
import { DtoValidationPipe } from '../pipes/dto-validation.pipe';

@UseFilters(AllExceptionsFilter)
@ApiTags('Фильмы')
@Controller('movies')
export class MoviesController {
  constructor(
    @Inject('MOVIES-SERVICE') private moviesService: ClientProxy,
    @Inject('PERSONS-SERVICE') private personsService: ClientProxy,
  ) {}

  @ApiOperation({ summary: 'Каталог фильмов c пагинацией и поиском по имени' })
  @ApiResponse({
    status: 200,
    description: 'Список фильмов по запросу',
  })
  @Get()
  getAllFilms(@Query(DtoValidationPipe) param: MoviesQueryDto) {
    return this.moviesService.send({ cmd: 'get-all-films' }, param);
  }

  @ApiOperation({ summary: 'Информация о фильме по айди' })
  @ApiResponse({ status: 200, description: 'Вся информация о фильме' })
  @Get('/about/:id')
  getFilmById(@Param('id', ParseIntPipe) filmId: number) {
    return this.moviesService.send({ cmd: 'get-film-byId' }, filmId);
  }

  @ApiOperation({ summary: 'Фильтр по фильмам' })
  @ApiResponse({ status: 200, description: 'Фильтрация по квери строке' })
  @Get('/filters')
  getFilmsByFilters(@Query(DtoValidationPipe) params: MoviesFiltersQueryDto) {
    return this.moviesService.send({ cmd: 'get-films-byFilters' }, params);
  }

  @ApiOperation({ summary: 'Автосаджест фильмов' })
  @ApiResponse({
    status: 200,
    description: 'выводит по 10 элементов из запроса',
  })
  @Get('/name')
  getFilmsAutosagest(
    @Query(DtoValidationPipe) query: MoviesQueryAutosagestDto,
  ) {
    return this.moviesService.send({ cmd: 'get-films-autosagest' }, query);
  }

  @UseGuards(RolesGuard)
  @RoleAccess(initRoles.ADMIN.value)
  @ApiOperation({ summary: 'Обновление имени фильма по айди' })
  @Put('/about/:id')
  updateFilmById(
    @Param('id', ParseIntPipe) id: number,
    @Body() filmData: MoviesUpdateFilmDto,
  ) {
    return this.moviesService.send(
      { cmd: 'update-film-byId' },
      { id: id, film: filmData },
    );
  }

  @UseGuards(RolesGuard)
  @RoleAccess(initRoles.ADMIN.value)
  @ApiOperation({ summary: 'Удаление фильма по айди' })
  @HttpCode(204)
  @Delete('/about/:id')
  deleteFilmById(@Param('id', ParseIntPipe) filmId: number) {
    return this.moviesService.send({ cmd: 'delete-film-byId' }, filmId);
  }

  @ApiOperation({ summary: 'Полный список персонала фильма' })
  @ApiResponse({
    status: 200,
    description: 'Выводит полный список актеров по фильм айди',
  })
  @Get('/about/:id/staff')
  getStaffByFilmId(
    @Param('id', ParseIntPipe) id: number,
    @Query(DtoValidationPipe) params: MoviesGetStaffByFilmIdDto,
  ) {
    return this.personsService.send(
      { cmd: 'get-staff-by-filmId' },
      { id, ...params },
    );
  }
}
