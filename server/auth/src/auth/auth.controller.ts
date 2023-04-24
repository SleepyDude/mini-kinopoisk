import { Controller, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { LoginDto } from './dto/login.dto';
import { TokensService } from 'src/tokens/tokens.service';
import { AuthVK } from 'src/vk/vk.model';
import { VkService } from 'src/vk/vk.service';
import { ExceptionFilter } from '../rpc-exception.filter';

@UseFilters(ExceptionFilter)
@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService,
        private tokenService: TokensService,
        private vkService: VkService
        // private readonly sharedService: SharedService,
    ) {}

    @MessagePattern({ cmd: 'vk' })
    async loginVk(
        // @Ctx() context: RmqContext,
        @Payload() auth: AuthVK,
        @Payload('response') response
    ) {
        // this.sharedService.acknowledgeMessage(context);
        // console.log(`[auth][users.controller][getUserByEmail] email: ${JSON.stringify(email)}`);

        return await this.vkService.loginVk(auth, response); 
    }


    @MessagePattern({ cmd: 'login' })
    async login(
        // @Ctx() context: RmqContext,
        @Payload() dto: LoginDto, 
        // @Payload('response') response // Женя: закомментил респонс и убрал его из всей цепочки
    ){
        // this.sharedService.acknowledgeMessage(context);
        // console.log(`[auth][users.controller][getUserByEmail] email: ${JSON.stringify(email)}`);

        return await this.authService.login(dto); 
    }

    @MessagePattern({ cmd: 'registration' })
    async registration(
        // @Ctx() context: RmqContext,
        // @Payload('dto') dto: LoginDto,
        // @Payload('response') response
        @Payload() obj: LoginDto
    ) {
        return await this.authService.registration(obj)
        // this.sharedService.acknowledgeMessage(context);
        // console.log(`[auth][users.controller][getUserByEmail] email: ${JSON.stringify(email)}`);

        // return await this.authService.registration(dto, response);
    }

    @MessagePattern({ cmd: 'logout' })
    async logout(
        // @Ctx() context: RmqContext,
        @Payload() refreshToken,
    ) {
        // this.sharedService.acknowledgeMessage(context);
        // console.log(`[auth][users.controller][createUser] +`);

        return await this.authService.logout(refreshToken);
    }

    @MessagePattern({ cmd: 'refresh' })
    async refresh(
        @Payload() refreshToken,
    ) {
        return await this.tokenService.refresh(refreshToken);
    }
}
