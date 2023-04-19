import { Controller, Delete, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create.user.dto';
import {MessagePattern, Payload} from '@nestjs/microservices';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @MessagePattern({ cmd: 'get-all-users' })
  @Get()
  getAll() {
    return 'ALL USERS';
    // return this.usersService.getAll();
  }

}
