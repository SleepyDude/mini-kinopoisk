import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { UserPermission } from '../decorators/user-permission.decorator';
import { AllExceptionsFilter } from '../filters/all.exceptions.filter';
import { RoleAccess } from '../guards/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { initRoles } from '../guards/init.roles';
import { DtoValidationPipe } from '../pipes/dto-validation.pipe';
import { CreateRoleDto, UpdateRoleDto } from '@shared/dto';
import { RolePublic } from '@shared/interfaces';

@UseFilters(AllExceptionsFilter)
@ApiTags('Работа с ролями')
@Controller('roles')
export class RolesController {
  constructor(@Inject('AUTH-SERVICE') private authService: ClientProxy) {}

  @UseGuards(RolesGuard)
  @RoleAccess(initRoles.ADMIN.value)
  @ApiOperation({ summary: 'Создание новой роли' })
  @ApiCreatedResponse({
    type: RolePublic,
    description:
      'Новые роли может создавать только пользователь не ниже ранга 10 (ADMIN) и только роли с рангом меньшим, чем у него',
  })
  @ApiForbiddenResponse({
    description:
      'Недостаточно прав. Либо Ваша роль слебее ADMIN, либо пытаетесь создать более сильную чем у Вас роль',
  })
  @ApiConflictResponse({
    description: 'Ошибка при создании роли, возможно роль уже существует',
  })
  @Post()
  async createRole(
    @Body(DtoValidationPipe) dto: CreateRoleDto,
    @UserPermission() maxRoleValue: number,
  ) {
    return await firstValueFrom(
      this.authService.send({ cmd: 'create-role' }, { dto, maxRoleValue }),
    );
  }

  @ApiOperation({ summary: 'Получение всех ролей' })
  @ApiResponse({
    status: 200,
    type: [RolePublic],
    description: 'Выводит все роли, незащищенный endpoint',
  })
  @Get()
  async getAllRoles() {
    return await firstValueFrom(
      this.authService.send({ cmd: 'get-all-roles' }, {}),
    );
  }

  @UseGuards(RolesGuard)
  @RoleAccess(initRoles.ADMIN.value)
  @ApiOperation({ summary: 'Удаление роли по имени' })
  @ApiResponse({
    status: 204,
    type: null,
    description: 'Удаляяет существующую роль',
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав',
  })
  @HttpCode(204)
  @Delete('/:name')
  async deleteRole(
    @Param('name') name: string,
    @UserPermission() maxRoleValue: number,
  ) {
    return await firstValueFrom(
      this.authService.send(
        { cmd: 'delete-role-by-name' },
        { name, maxRoleValue },
      ),
    );
  }

  @UseGuards(RolesGuard)
  @RoleAccess(initRoles.ADMIN.value)
  @ApiOperation({ summary: 'обновление роли по имени' })
  @ApiOkResponse({
    type: RolePublic,
    description: 'Обновляет существующую роль',
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав',
  })
  @ApiNotFoundResponse({
    description: 'Роль не найдена',
  })
  @Put('/:name')
  async updateRole(
    @Param('name') name: string,
    @UserPermission() maxRoleValue: number,
    @Body(DtoValidationPipe) dto: UpdateRoleDto,
  ) {
    return await firstValueFrom(
      this.authService.send(
        { cmd: 'update-role-by-name' },
        { name, maxRoleValue, dto },
      ),
    );
  }
}
