import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create.user.dto';
import { CreateProfileDto } from './dto/create.profile.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({summary: 'Login'})
  @ApiResponse({status: 200})
  @Post('/login')
  async login(@Body() userDto: CreateUserDto) {
    return this.authService.login(userDto);
  }

  @ApiOperation({summary: 'Registration'})
  @ApiResponse({status: 200, type: CreateUserDto})
  @Post('/registration')
  async registration(
    @Body() userDto: CreateUserDto,
    // profileDto: CreateProfileDto,
    // avatar,
  ) {
    console.log('CONTROLLER AUTH: ', userDto)
    return this.authService.registration(userDto);
  }

  @ApiOperation({summary: 'Logout'})
  @ApiResponse({status: 200})
  @Post('logout')
  async logout() {
    return this.authService.logout();
  }
}
