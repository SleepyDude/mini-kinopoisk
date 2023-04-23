import { BadRequestException, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs'
import {catchError, firstValueFrom, lastValueFrom, switchMap, of} from 'rxjs';
import { TokensService } from 'src/tokens/tokens.service';

@Injectable()
export class AuthService {
  constructor(
  @Inject('USERS-SERVICE') private readonly userService: ClientProxy,
  private tokenService: TokensService) {}

  async login(userDto: LoginDto | any, response, skipPasswordCheck: boolean = false) {
    // response получим уже в main
    
    const hashedPassword = bcrypt.hash(userDto.password, process.env.SALT);
    const user = await this.defineUserExists(userDto.email);
    const userPassword = user?.password;
    const isRightPassword = (hashedPassword == userPassword);

    if (!isRightPassword && !skipPasswordCheck) {
      throw new BadRequestException("Invalid credentials");
    }
    // return await this.tokenService.generateAndSaveToken({...userDto}, response)
  }

  async defineUserExists(email: string) : Promise<any> {
    const user$ = this.userService.send( {cmd: 'get-user-by-email' }, email ).pipe(
      switchMap((user) => { 
        if (user) return user;
        return of(null); // Женя: если пользователя нет то он возвращает undef и крашится, добавил 
      }),
      catchError( (error) => {
        console.log(error)
        throw new BadRequestException;
      })
    );
    const user = await firstValueFrom(user$);
    return (user)? user : null;
  }

  async registration(userDto: LoginDto) {
    console.log(`[auth][auth.service][registration] userDto: ${JSON.stringify(userDto)}`);
    // response получим уже в main

    console.log(`SALT = ${process.env.SALT}`);
    const hashedPassword = await bcrypt.hash(userDto.password, +process.env.SALT);
    console.log(`hashedPassword = ${hashedPassword}`);

    if (await this.defineUserExists(userDto.email)) {
      throw new HttpException(`Пользователь с таким e-mail уже существует`, HttpStatus.NOT_FOUND);
    }

    // const id$ = this.userService.send( {cmd: 'create-user'}, {...userDto, password: hashedPassword}).pipe(
    //   switchMap((id) => {
    //     return id
    //   })
    // )
    // const id = +await firstValueFrom(id$);

    // Просто оставлю в таком виде, работает точно так же, как функция выше.
    const id = await lastValueFrom(this.userService.send( {cmd: 'create-user'}, {email: userDto.email, password: hashedPassword}))
    console.log(`[auth][auth.service][registration] new user id: ${JSON.stringify(id)}`)
    // createProfile(userDto)

    return await this.tokenService.generateAndSaveToken({email: userDto.email, id: id, roles: []})
  }

  async logout(refreshToken, response) {
    await this.tokenService.removeToken(refreshToken, response);
  }
}
