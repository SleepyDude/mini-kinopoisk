import { Controller, Get, Inject, UseFilters } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { AllExceptionsFilter } from '../filters/all.exceptions.filter';
import { ClientProxy } from '@nestjs/microservices';

@UseFilters(AllExceptionsFilter)
@ApiTags('Инициализация приложения')
@Controller('init')
export class InitController {
  constructor(@Inject('AUTH-SERVICE') private authService: ClientProxy) {}

  @UseFilters(AllExceptionsFilter)
  @ApiOperation({
    summary: 'Инициализация сервера, требуется так же после очистки БД',
  })
  @ApiResponse({
    status: 201,
    type: Boolean,
    description: 'Успешный запрос',
  })
  @ApiForbiddenResponse({
    status: 403,
    description: 'Повторный вызов',
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Не найдены переменные среды',
  })
  @Get()
  async createAdminAndRoles() {
    return this.authService.send({ cmd: 'init' }, {});
  }
}
