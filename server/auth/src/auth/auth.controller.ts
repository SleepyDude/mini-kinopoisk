import { Controller, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TokensService } from 'src/tokens/tokens.service';
import { VkService } from 'src/vk/vk.service';
import { ExceptionFilter } from '../rpc-exception.filter';
import { InitService } from '../init/init.service';
import { GoogleService } from 'src/google/google.service';
import { AuthVK, CreateUserDto } from '@hotels2023nestjs/shared';

@UseFilters(ExceptionFilter)
@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService,
        private tokenService: TokensService,
        private vkService: VkService,
        private initService: InitService,
        private googleService: GoogleService
    ) {}

    @MessagePattern({ cmd: 'init' })
    async init(
    ) {
        return await this.initService.createAdminAndRoles();
    }

    @MessagePattern({ cmd: 'vk' })
    async vkAuth(
        @Payload() auth: AuthVK,
    ) {
        return await this.vkService.loginVk(auth); 
    }

    @MessagePattern({ cmd: 'google-callback' })
    async googleAuthRedirect(
        @Payload() user: any
    ) {
        return await this.googleService.googleLogin(user);
    }

    @MessagePattern({ cmd: 'login' })
    async login(
        @Payload() dto: CreateUserDto
    ){
        return await this.authService.login(dto); 
    }

    @MessagePattern({ cmd: 'registration' })
    async registration(
        @Payload() dto: CreateUserDto
    ) {
        return await this.authService.registration(dto)
    }

    @MessagePattern({ cmd: 'logout' })
    async logout(
        @Payload() refreshToken: string
    ) {
        return await this.authService.logout(refreshToken);
    }

    @MessagePattern({ cmd: 'refresh' })
    async refresh(
        @Payload() refreshToken: string
    ) {
        return await this.tokenService.refresh(refreshToken);
    }
}