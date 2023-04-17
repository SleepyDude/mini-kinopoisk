import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientProxy) {}

  async login(userDto: CreateUserDto) {
    return 'login';
  }

  async registration(userDto: CreateUserDto) {
    console.log('SERVICE AUTH: ', userDto)
    try {
      let user = await this.client.send({ cmd: 'create_user' }, userDto).toPromise();
      return user;
    } catch (e) {
      console.log(e)
    }
  }

  async logout() {
    return 'logout';
  }
}
