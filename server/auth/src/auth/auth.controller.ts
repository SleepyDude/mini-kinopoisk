import { Controller, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { LoginDto } from './dto/login.dto';
import { TokensService } from 'src/tokens/tokens.service';
import { AuthVK } from 'src/vk/vk.model';
import { VkService } from 'src/vk/vk.service';
import { ExceptionFilter } from '../rpc-exception.filter';
import { InitService } from '../init/init.service';

@UseFilters(ExceptionFilter)
@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService,
        private tokenService: TokensService,
        private vkService: VkService,
        private initService: InitService
    ) {}

    @MessagePattern({ cmd: 'init' })
    async init(
    ) {
        return await this.initService.createAdminAndRoles();
    }

    @MessagePattern({ cmd: 'vk' })
    async loginVk(
        @Payload() auth: AuthVK,
    ) {
        return await this.vkService.loginVk(auth); 
    }


    @MessagePattern({ cmd: 'login' })
    async login(
        @Payload() dto: LoginDto, 
    ){
        return await this.authService.login(dto); 
    }

    @MessagePattern({ cmd: 'registration' })
    async registration(
        @Payload() dto: LoginDto
    ) {
        return await this.authService.registration(dto)
    }

    @MessagePattern({ cmd: 'logout' })
    async logout(
        @Payload() refreshToken
    ) {
        return await this.authService.logout(refreshToken);
    }

    @MessagePattern({ cmd: 'refresh' })
    async refresh(
        @Payload() refreshToken
    ) {
        return await this.tokenService.refresh(refreshToken);
    }
}
