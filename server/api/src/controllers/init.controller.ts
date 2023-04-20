import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('init')
export class InitController {

  constructor(
      @Inject('USERS-SERVICE') private usersService: ClientProxy,
  ) {}

  @Post()
  async initServer(
    @Body() dto: any
  ) {
    return this.usersService.send(
      {
        cmd: 'init-server',
      },
      dto,
    )
  }
}