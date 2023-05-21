import { CreateUserDto, UserDto } from '@shared/dto';
import { HttpRpcException } from '@shared';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { TokensService } from '../tokens/tokens.service';
import { UsersService } from '../users/users.service';
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
        `Пользователя не существует`,
        HttpStatus.NOT_FOUND,
      );
    }

    const userPassword = user.password;
    let isRightPassword;
    if (userPassword) {
      isRightPassword = await bcrypt.compare(userDto.password, userPassword);
    }

    if (!isRightPassword && !skipPasswordCheck) {
      throw new HttpRpcException('Неверный пароль', HttpStatus.UNAUTHORIZED);
    }
    const tokenData = new UserDto(user);
    const tokens = await this.tokenService.generateAndSaveToken(tokenData);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      email: userDto.email,
      id: user.id,
    };
  }

  async registration(userDto: CreateUserDto) {
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

    const user = await this.userService.createUser({
      email: userDto.email,
      password: hashedPassword,
    });

    await firstValueFrom(
      this.socialService.send({ cmd: 'create-profile' }, { userId: user.id }),
    );

    const tokenData = new UserDto(user);
    const tokens = await this.tokenService.generateAndSaveToken(tokenData);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      email: userDto.email,
      id: user.id,
    };
  }

  async logout(refreshToken) {
    return await this.tokenService.removeToken(refreshToken);
  }
}
