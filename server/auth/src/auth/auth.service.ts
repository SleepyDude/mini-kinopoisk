import { CreateUserDto, HttpRpcException } from '@hotels2023nestjs/shared';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { TokensService } from 'src/tokens/tokens.service';
import { UsersService } from 'src/users/users.service';
import { UserDto } from 'src/tokens/dto/user.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private tokenService: TokensService,
    @Inject('SOCIAL-SERVICE') private readonly socialService: ClientProxy,
  ) {}

  async login(
    userDto: CreateUserDto | any,
    skipPasswordCheck = false,
    id: number = null,
  ) {
    const user = id
      ? await this.userService.getUserById(id)
      : await this.userService.getUserByEmail(userDto.email);

    if (!user) {
      throw new HttpRpcException(
        `Пользователя с email ${userDto.email} не существует`,
        HttpStatus.NOT_FOUND,
      );
    }

    const userPassword = user.password;
    let isRightPassword;
    if (userPassword) {
      isRightPassword = await bcrypt.compare(userDto.password, userPassword);
    }

    if (!isRightPassword && !skipPasswordCheck) {
      throw new HttpRpcException(
        'Invalid credentials',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const tokenData = new UserDto(user);
    const tokens = await this.tokenService.generateAndSaveToken(tokenData);

    return tokens;
  }

  async registration(userDto: LoginDto) {
    if (await this.userService.getUserByEmail(userDto.email)) {
      throw new HttpRpcException(
        `Пользователь с таким e-mail уже существует`,
        HttpStatus.CONFLICT,
      );
    }
    const hashedPassword = await bcrypt.hash(
      userDto.password,
      +process.env.SALT,
    );

    const id = await this.userService.createUser({
      email: userDto.email,
      password: hashedPassword,
    });

    await firstValueFrom(
      this.socialService.send({ cmd: 'create-profile' }, id),
    );
    // createProfile(userDto)

    return await this.tokenService.generateAndSaveToken({
      email: userDto.email,
      id: id,
      roles: [],
    });
  }

  async logout(refreshToken) {
    return await this.tokenService.removeToken(refreshToken);
  }
}
