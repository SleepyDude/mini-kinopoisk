import { CreateRoleDto, Role } from '@hotels2023nestjs/shared';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Post, Put, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from "express";
import { firstValueFrom } from "rxjs";
import { UserPermission } from 'src/decorators/user-permission.decorator';
import { AllExceptionsFilter } from 'src/filters/all.exceptions.filter';
import { RoleAccess } from 'src/guards/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { initRoles } from 'src/init/init.roles';
import { DtoValidationPipe } from 'src/pipes/dto-validation.pipe';
import { UpdateRoleDto } from 'src/types/update-role.model';

@UseFilters(AllExceptionsFilter)
@ApiTags('Работа с ролями')
@Controller('roles')
export class RolesController {

  constructor(
      @Inject('USERS-SERVICE') private usersService: ClientProxy,
  ) {}


  @UseGuards(RolesGuard)
  @RoleAccess(initRoles.ADMIN.value)
  @ApiOperation({ summary: 'Создание новой роли' })
  @ApiResponse({ status: 201, type: Role, description: 'Новые роли может создавать только пользователь не ниже ранга 10 (ADMIN) и только роли с рангом меньшим, чем у него' })
  @Post()
  async createRole(
      @Body(DtoValidationPipe) dto: CreateRoleDto,
      @UserPermission() maxRoleValue: number,
  ) {
      console.log(`[api][create-role] maxRoleValue: ${maxRoleValue}`);
      return await firstValueFrom(this.usersService.send({cmd: 'create-role'}, {dto, maxRoleValue}));
  }

  @ApiOperation({ summary: 'Получение всех ролей' })
  @ApiResponse({ status: 200, type: [Role], description: 'Выводит все роли, незащищенный endpoint' })
  @Get()
  async getAllRoles() {
      return await firstValueFrom(this.usersService.send({cmd: 'get-all-roles'}, {}));
  }

  @UseGuards(RolesGuard)
  @RoleAccess(initRoles.ADMIN.value)
  @ApiOperation({ summary: 'Удаление роли по имени' })
  @ApiResponse({ status: 204, type: null, description: 'Удаляяет существующую роль' })
  @HttpCode(204)
  @Delete('/:name')
  async deleteRole(
      @Param('name') name: string,
      @UserPermission() maxRoleValue: number,
  ) {
    //   console.log(`[api][delete-role] maxRoleValue: ${maxRoleValue}`);
      return await firstValueFrom(this.usersService.send({cmd: 'delete-role-by-name'}, {name, maxRoleValue}));
  }

  @UseGuards(RolesGuard)
  @RoleAccess(initRoles.ADMIN.value)
  @ApiOperation({ summary: 'обновление роли по имени' })
  @ApiResponse({ status: 200, type: Role, description: 'Обновляет существующую роль' })
  @Put('/:name')
  async updateRole(
      @Param('name') name: string,
      @UserPermission() maxRoleValue: number,
      @Body(DtoValidationPipe) dto: UpdateRoleDto
  ) {
    //   console.log(`[api][delete-role] maxRoleValue: ${maxRoleValue}`);
      return await firstValueFrom(this.usersService.send({cmd: 'update-role-by-name'}, {name, maxRoleValue, dto}));
  }

}