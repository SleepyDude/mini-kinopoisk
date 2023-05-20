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
import { UpdateCountryDto } from '@shared/dto';

import { RolesGuard } from '../guards/roles.guard';
import { RoleAccess } from '../guards/roles.decorator';
import { AllExceptionsFilter } from '../filters/all.exceptions.filter';
import { initRoles } from '@shared';

@UseFilters(AllExceptionsFilter)
@ApiTags('Фильмы-страны')
@Controller('movies')
export class MoviesCountriesController {
  constructor(@Inject('MOVIES-SERVICE') private moviesService: ClientProxy) {}

  @ApiOperation({ summary: 'Получение списка стран' })
  @ApiResponse({ status: 200, description: 'Выводит список всех стран' })
  @Get('/countries')
  getAllCountries() {
    return this.moviesService.send({ cmd: 'get-all-countries' }, {});
  }

  @ApiOperation({ summary: 'Получение страны по айди' })
  @ApiResponse({ status: 200, description: 'Выводит страну по айди' })
  @Get('/countries/:id')
  getCountryById(@Param('id', ParseIntPipe) countryId: number) {
    return this.moviesService.send({ cmd: 'get-country-byId' }, countryId);
  }

  @UseGuards(RolesGuard)
  @RoleAccess(initRoles.ADMIN.value)
  @ApiOperation({ summary: 'Апдейт имени страны по айди' })
  @ApiResponse({ status: 201, description: 'Обновление стран' })
  @Put('/countries/:id')
  updateCountryById(
    @Param('id', ParseIntPipe) id: number,
    @Body() country: UpdateCountryDto,
  ) {
    return this.moviesService.send(
      { cmd: 'update-country-byId' },
      { id: id, country: country },
    );
  }

  @UseGuards(RolesGuard)
  @RoleAccess(initRoles.ADMIN.value)
  @ApiOperation({ summary: 'Удаление страны по айди' })
  @HttpCode(204)
  @Delete('/countries/:id')
  deleteCountriesById(@Param('id', ParseIntPipe) countryId: number) {
    return this.moviesService.send({ cmd: 'delete-country' }, countryId);
  }
}
