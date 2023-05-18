import { Controller, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TokensService } from '../tokens/tokens.service';
import { VkService } from '../vk/vk.service';
import { ExceptionFilter } from '../rpc-exception.filter';
import { InitService } from '../init/init.service';
import { GoogleService } from '../google/google.service';
import { AuthVKDto, CreateUserDto } from '@shared/dto';
import { TokenId } from '@shared/interfaces';

@UseFilters(ExceptionFilter)
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenService: TokensService,
    private vkService: VkService,
    private initService: InitService,
    private googleService: GoogleService,
  ) {}

  @MessagePattern({ cmd: 'init' })
  async init() {
    return await this.initService.createAdminAndRoles();
  }

  @MessagePattern({ cmd: 'vk-login' })
  async vkAuth(@Payload() auth: AuthVKDto) {
    return await this.vkService.loginVk(auth);
  }

  @MessagePattern({ cmd: 'google-login' })
  async googleAuthRedirect(@Payload() ticketPayload: any) {
    return await this.googleService.googleLogin(ticketPayload);
  }

  @MessagePattern({ cmd: 'login' })
  async login(@Payload() dto: CreateUserDto) {
    return await this.authService.login(dto);
  }

  @MessagePattern({ cmd: 'registration' })
  async registration(@Payload() dto: CreateUserDto) {
    return await this.authService.registration(dto);
  }

  @MessagePattern({ cmd: 'logout' })
  async logout(@Payload() refreshToken: string) {
    return await this.authService.logout(refreshToken);
  }

  @MessagePattern({ cmd: 'refresh' })
  async refresh(@Payload() refreshToken: string) {
    return await this.tokenService.refresh(refreshToken);
  }
}
