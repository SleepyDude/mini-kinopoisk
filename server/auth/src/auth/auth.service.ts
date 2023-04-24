import { CreateUserDto } from '@hotels2023nestjs/shared';
import { BadRequestException, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs'
import {catchError, firstValueFrom, lastValueFrom, switchMap, of, throwError} from 'rxjs';
import { TokensService } from 'src/tokens/tokens.service';

@Injectable()
export class AuthService {
  constructor(
  @Inject('USERS-SERVICE') private readonly userService: ClientProxy,
  private tokenService: TokensService) {}

  async login(userDto: CreateUserDto | any, skipPasswordCheck: boolean = false) {

    const user = await this.defineUserExists(userDto.email);
    const userPassword = user?.password;
    const isRightPassword = await bcrypt.compare(userDto.password, userPassword);

    if (!isRightPassword && !skipPasswordCheck) {
      throw new RpcException("Invalid credentials");
    }
    const tokens = await this.tokenService.generateAndSaveToken({...user});
    return tokens;
  }

  async defineUserExists(email: string) : Promise<any> {

    const user$ = this.userService.send( {cmd: 'get-user-by-email' }, email ).pipe(
      switchMap((user) => { 
        if (user) return of(user);
        return of(null);
      }),
      catchError( (error) => {
        console.log(error)
        throw new BadRequestException;
      })
    );
    const user = await firstValueFrom(user$);
    return user;
  }

  async registration(userDto: LoginDto) {
    if (await this.defineUserExists(userDto.email)) {
      throw new HttpException(`Пользователь с таким e-mail уже существует`, HttpStatus.NOT_FOUND);
    }
    const hashedPassword = await bcrypt.hash(userDto.password, +process.env.SALT);

    const id = await firstValueFrom(this.userService.send( {cmd: 'create-user'}, {email: userDto.email, password: hashedPassword}))

    // createProfile(userDto)

    return await this.tokenService.generateAndSaveToken({email: userDto.email, id: id, roles: []})
  }

  async logout(refreshToken) {
    return await this.tokenService.removeToken(refreshToken);
  }
}
