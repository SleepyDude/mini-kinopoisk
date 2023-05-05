import { CreateUserDto, HttpRpcException } from '@hotels2023nestjs/shared';
import { HttpStatus, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs'
import { TokensService } from 'src/tokens/tokens.service';
import { UsersService } from 'src/users/users.service';
import { UserDto } from 'src/tokens/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
  private userService: UsersService,
  private tokenService: TokensService) {}

  async login(userDto: CreateUserDto | any, skipPasswordCheck: boolean = false) {

    const user = await this.defineUserExists(userDto.email);
    const userPassword = user?.password;
    let isRightPassword;
    if (userPassword) {
      isRightPassword = await bcrypt.compare(userDto.password, userPassword);
    }
    
    if (!isRightPassword && !skipPasswordCheck) {
      throw new HttpRpcException("Invalid credentials", HttpStatus.UNAUTHORIZED);
    }
    const tokenData = new UserDto(user);
    const tokens = await this.tokenService.generateAndSaveToken(tokenData);

    return tokens;
  }

  async defineUserExists(email: string) : Promise<any> {

    const user = await this.userService.getUserByEmail(email);
    return user;
  }

  async registration(userDto: LoginDto) {
    if (await this.defineUserExists(userDto.email)) {
      throw new HttpRpcException(`Пользователь с таким e-mail уже существует`, HttpStatus.CONFLICT);
    }
    const hashedPassword = await bcrypt.hash(userDto.password, +process.env.SALT);

    const id = await this.userService.createUser({email: userDto.email, password: hashedPassword})

    // createProfile(userDto)

    return await this.tokenService.generateAndSaveToken({email: userDto.email, id: id, roles: []})
  }

  async logout(refreshToken) {
    return await this.tokenService.removeToken(refreshToken);
  }
}
