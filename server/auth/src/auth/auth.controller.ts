import { Controller, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { LoginDto } from './dto/login.dto';
import { TokensService } from 'src/tokens/tokens.service';
import { AuthVK } from 'src/vk/vk.model';
import { VkService } from 'src/vk/vk.service';
import { ExceptionFilter } from '../rpc-exception.filter';
import { InitService } from '../init/init.service';
import { GoogleService } from 'src/google/google.service';

@UseFilters(ExceptionFilter)
@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService,
        private tokenService: TokensService,
        private vkService: VkService,
        private initService: InitService,
        private googleService: GoogleService,
        // private readonly sharedService: SharedService,
    ) {}

    @MessagePattern({ cmd: 'init' })
    async init(
    ) {
        return await this.initService.createAdminAndRoles();
    }

    @MessagePattern({ cmd: 'vk' })
    async vkAuth(
        // @Ctx() context: RmqContext,
        @Payload() auth: AuthVK,
    ) {
        return await this.vkService.loginVk(auth); 
    }

    @MessagePattern({ cmd: 'google-callback' })
    async googleAuthRedirect(
        // @Ctx() context: RmqContext,
        @Payload() user 
    ) {
        // this.sharedService.acknowledgeMessage(context);
        // console.log(`[auth][users.controller][getUserByEmail] email: ${JSON.stringify(email)}`);

        return await this.googleService.googleLogin(user);
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
