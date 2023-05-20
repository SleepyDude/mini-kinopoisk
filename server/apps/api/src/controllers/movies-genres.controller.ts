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
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateGenreDto } from '@shared/dto';

import { RolesGuard } from '../guards/roles.guard';
import { RoleAccess } from '../guards/roles.decorator';
import { initRoles } from '../guards/init.roles';
import { AllExceptionsFilter } from '../filters/all.exceptions.filter';

@UseFilters(AllExceptionsFilter)
@ApiTags('Фильмы-жанры')
@Controller('movies')
export class MoviesGenresController {
  constructor(@Inject('MOVIES-SERVICE') private moviesService: ClientProxy) {}

  @ApiOperation({ summary: 'Получение списка жанров' })
  @ApiResponse({ status: 200, description: 'Выводит список всех жанров' })
  @Get('/genres')
  getAllGenres() {
    return this.moviesService.send({ cmd: 'get-all-genres' }, {});
  }

  @ApiOperation({ summary: 'Получение жанра по айди' })
  @ApiResponse({ status: 200, description: 'Выводит один жанр' })
  @Get('/genres/:id')
  getGenreById(@Param('id', ParseIntPipe) genreId: number) {
    return this.moviesService.send({ cmd: 'get-genre-byId' }, genreId);
  }

  @UseGuards(RolesGuard)
  @RoleAccess(initRoles.ADMIN.value)
  @ApiOperation({ summary: 'Удаление жанра по айди' })
  @HttpCode(204)
  @Delete('/genres/:id')
  deleteGenreById(@Param('id', ParseIntPipe) genreId: number) {
    return this.moviesService.send({ cmd: 'delete-genre-byId' }, genreId);
  }

  @UseGuards(RolesGuard)
  @RoleAccess(initRoles.ADMIN.value)
  @ApiOperation({ summary: 'Апдейт жанров по айди' })
  @ApiResponse({ status: 201, description: 'Обновление жанорв' })
  @Put('/genres/:id')
  updateGenreById(
    @Param('id', ParseIntPipe) id: number,
    @Body() genre: UpdateGenreDto,
  ) {
    return this.moviesService.send(
      { cmd: 'update-genre-byId' },
      { id: id, genre: genre },
    );
  }
}
