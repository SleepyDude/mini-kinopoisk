import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('users')
export class UsersController {

  constructor(
      @Inject('USERS-SERVICE') private usersService: ClientProxy,
  ) {}

  @Get()
  async getAllUsers() {
    return this.usersService.send(
      {
        cmd: 'get-all-users',
      },
      {},
    )
  }

}