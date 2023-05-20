import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserPermission } from '../decorators/user-permission.decorator';
import { AllExceptionsFilter } from '../filters/all.exceptions.filter';
import { RoleAccess } from '../guards/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { DtoValidationPipe } from '../pipes/dto-validation.pipe';
import { initRoles } from '@shared';
import { UserData } from '../decorators/user-data.decorator';
import { RolePublic, UserPublic } from '@shared/interfaces';
import { AddRoleDtoEmail } from '@shared/dto';

@UseFilters(AllExceptionsFilter)
@ApiTags('Работа с пользователями')
@Controller('users')
export class UsersController {
  constructor(@Inject('AUTH-SERVICE') private authService: ClientProxy) {}

  @UseGuards(RolesGuard)
  @RoleAccess({ minRoleVal: initRoles.USER.value, allowSelf: true })
  @ApiOperation({
    summary: 'Получение своих данных пользователя (email и роли)',
  })
  @ApiOkResponse({
    type: UserPublic,
    description: 'Объект может получить только сам пользователь',
  })
  @ApiForbiddenResponse({
    description: 'Пользователь не залогинен',
  })
  @Get('me')
  async getMyUserData(@UserData('id') id: number) {
    return this.authService.send(
      {
        cmd: 'get-user-public-by-id',
      },
      id,
    );
  }

  @UseGuards(RolesGuard)
  @RoleAccess({ minRoleVal: initRoles.ADMIN.value, allowSelf: true })
  @ApiOperation({ summary: 'Получение пользователя по email' })
  @ApiOkResponse({
    type: UserPublic,
    description:
      'Объект может получить только администратор (ADMIN и выше) или сам пользователь',
  })
  @ApiForbiddenResponse({
    description:
      'Недостаточно прав. Доступ имеет только администратор (роль ADMIN и выше) или сам пользователь',
  })
  @Get('/:email')
  async getUserByEmail(@Param('email') email: string) {
    return this.authService.send(
      {
        cmd: 'get-user-by-email',
      },
      email,
    );
  }

  @UseGuards(RolesGuard)
  @RoleAccess(initRoles.ADMIN.value)
  @ApiOperation({ summary: 'Добавление роли пользователю' })
  @ApiCreatedResponse({
    type: RolePublic,
    description: 'Добавляет роль пользователю. Возвращает ее.',
  })
  @ApiNotFoundResponse({
    type: RolePublic,
    description: 'Роль или пользователь не найдены',
  })
  @ApiForbiddenResponse({
    description:
      'Недостаточно прав. Добавить роль может только пользователь не ниже ранга 10 (ADMIN), только роль с рангом меньшим, чем у него',
  })
  @Post('/add_role')
  async addRole(
    @Body(DtoValidationPipe) dto: AddRoleDtoEmail,
    @UserPermission() maxRoleValue: number,
  ) {
    return this.authService.send(
      {
        cmd: 'add-role-to-user-by-email',
      },
      { dto, maxRoleValue },
    );
  }
}
