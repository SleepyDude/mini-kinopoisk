import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs'
import { switchMap } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientProxy,
  @Inject('USER_SERVICE') private readonly userService: ClientProxy,) {}

  private async hashPassword(password: string) {
    return await bcrypt.hash(password, process.env.SALT);
  }

  async login(userDto: LoginDto) {
    return 'login';
  }

  async registration(userDto: LoginDto) {

    const hashedPassword = this.hashPassword(userDto.password);

    const user$ = this.userService.send( {cmd: 'get-user-by-email' }, userDto.email ).pipe(
      switchMap((value) => {
        
      })
    )

    // const id$ = this.authService.send({ cmd: 'register' }, registerProfileDto).pipe(
    //   switchMap((value) => {
    //       // console.log(`[profiles][registration] service. return from authService: ${JSON.stringify(value)}`);
    //       const { id } = value;
    //       // console.log(`id = ${id}`);
    //       return of(id)
    //   }),
    //   catchError( (error) => {
    //       console.log(`[profiles][registration] catchError error = ${JSON.stringify(error)}`)
    //       throw new UnauthorizedException(error);
    //   })

    // const candidate = await this.userService.getUserByEmail(profileDTO.email);
    // if (candidate) {
    //     throw new HttpException(`A user with email ${profileDTO.email} already exists`, HttpStatus.BAD_REQUEST)
    // }

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
