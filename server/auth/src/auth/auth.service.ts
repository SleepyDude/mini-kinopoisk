import { BadRequestException, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs'
import { catchError, firstValueFrom, switchMap } from 'rxjs';

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

  async isUserExists(email: string) : Promise<Boolean> {
    const user$ = this.userService.send( {cmd: 'get-user-by-email' }, email ).pipe(
      switchMap((user) => { 
        if (user) return user;
      }),
      catchError( (error) => {
        console.log(error)
        throw new BadRequestException;
      })
    );

    const user = await firstValueFrom(user$);
    return (user)? true : false;
   
  }

  async registration(userDto: LoginDto) {

    const hashedPassword = this.hashPassword(userDto.password);

    if (this.isUserExists(userDto.email)) {
      throw new HttpException(`Пользователь с таким e-mail уже существует`, HttpStatus.NOT_FOUND);
    }

    const userData$ = this.userService.send( {cmd: 'create-user'}, userDto).pipe(
      switchMap((userData) => {
        const {id, roles} = userData;
        return {id, roles}
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
