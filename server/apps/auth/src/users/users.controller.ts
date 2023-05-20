import { Controller, UseFilters } from '@nestjs/common';
import { UsersService } from './users.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ExceptionFilter } from '../rpc-exception.filter';
import { AddRoleDto, AddRoleDtoEmail, CreateUserDto } from '@shared/dto';

@UseFilters(ExceptionFilter)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @MessagePattern({ cmd: 'get-user-by-email' })
  async getUserByEmail(@Payload() email: string) {
    return await this.usersService.getUserByEmail(email);
  }

  @MessagePattern({ cmd: 'get-user-by-id' })
  async getUserById(@Payload() id: number) {
    return await this.usersService.getUserById(id);
  }

  @MessagePattern({ cmd: 'get-user-public-by-id' })
  async getUserPublicById(@Payload() id: number) {
    return await this.usersService.getUserPublicById(id);
  }

  @MessagePattern({ cmd: 'create-user' })
  async createUser(@Payload() dto: CreateUserDto) {
    return await this.usersService.createUser(dto);
  }

  @MessagePattern({ cmd: 'add-role-to-user-by-email' })
  async addRoleByEmail(
    @Payload('dto') dto: AddRoleDtoEmail,
    @Payload('maxRoleValue') maxRoleValue: number,
  ) {
    return await this.usersService.addRoleByEmail(dto, maxRoleValue);
  }

  @MessagePattern({ cmd: 'add-role-to-user-by-id' })
  async addRoleById(@Payload() dto: AddRoleDto) {
    return await this.usersService.addRole(dto);
  }
}
