import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create.user.dto';
import { CreateProfileDto } from './dto/create.profile.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  async login(@Body() userDto: CreateUserDto) {
    return this.authService.login(userDto);
  }

  @Post('/registration')
  async registration(
    @Body() userDto: CreateUserDto,
    profileDto: CreateProfileDto,
    avatar,
  ) {
    return this.authService.registration(userDto);
  }

  @Post('logout')
  async logout() {
    return this.authService.logout();
  }
}
