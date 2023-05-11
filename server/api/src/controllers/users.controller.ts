import { AddRoleDtoEmail, Role, User } from '@hotels2023nestjs/shared';
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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserPermission } from '../decorators/user-permission.decorator';
import { AllExceptionsFilter } from '../filters/all.exceptions.filter';
import { RoleAccess } from '../guards/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { DtoValidationPipe } from '../pipes/dto-validation.pipe';
import { initRoles } from '../guards/init.roles';

@UseFilters(AllExceptionsFilter)
@ApiTags('Работа с пользователями')
@Controller('users')
export class UsersController {
  constructor(@Inject('AUTH-SERVICE') private authService: ClientProxy) {}

  @UseGuards(RolesGuard)
  @RoleAccess({ minRoleVal: initRoles.ADMIN.value, allowSelf: true })
  @ApiOperation({ summary: 'Получение пользователя по email' })
  @ApiResponse({
    status: 200,
    type: User,
    description:
      'Объект может получить только администратор (ADMIN и выше) или сам пользователь',
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
  @ApiResponse({
    status: 201,
    type: Role,
    description:
      'Добавить роль может только пользователь не ниже ранга 10 (ADMIN), только роль с рангом меньшим, чем у него',
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
