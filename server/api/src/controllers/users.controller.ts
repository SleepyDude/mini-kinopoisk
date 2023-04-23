import { Body, Controller, Get, Inject, Param, Post, UseFilters } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AllExceptionsFilter } from 'src/filters/all.exceptions.filter';

@Controller('users')
export class UsersController {

  constructor(
      @Inject('USERS-SERVICE') private usersService: ClientProxy,
  ) {}

  @UseFilters(AllExceptionsFilter)
  @Post()
  async createUser(
    @Body() dto: any
  ) {
    return this.usersService.send(
      {
        cmd: 'create-user',
      },
      dto,
    )
  }

    // @RoleAccess({minRoleVal: initRoles.ADMIN.value, allowSelf: true})
    // @UseGuards(RolesGuard)
    @Get('/:email')
    async getUserByEmail(
        @Param('email') email: string,
    ) {
        return this.usersService.send(
            {
                cmd: 'get-user-by-email',
            },
            email,
        )
    }

    // @RoleAccess(initRoles.ADMIN.value)
    // @UseGuards(RolesGuard)
    @Post('/add_role')
    async addRole(
        @Body() addRoleDto: any
    ) {
        return this.usersService.send(
            {
                cmd: 'add-role-to-user',
            },
            addRoleDto,
        )
    }
}