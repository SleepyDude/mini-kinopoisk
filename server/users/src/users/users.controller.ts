import { Controller, Delete, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create.user.dto';
import {MessagePattern, Payload} from '@nestjs/microservices';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @MessagePattern({ cmd: 'create_user' })
  async create(@Payload() userDto: CreateUserDto) {
    return await this.usersService.createUser(userDto);
  }

  @Get()
  getAll() {
    return this.usersService.getAll();
  }

  @Delete('/:id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
