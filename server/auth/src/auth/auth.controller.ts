import { Controller, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { LoginDto } from './dto/login.dto';
import { TokensService } from 'src/tokens/tokens.service';
import { AuthVK } from 'src/vk/vk.model';
import { VkService } from 'src/vk/vk.service';

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


    // @UseFilters(new HttpExceptionFilter())
    @MessagePattern({ cmd: 'login' })
    async login(
        // @Ctx() context: RmqContext,
        @Payload('dto') dto: LoginDto, 
        @Payload('response') response
    ){
        // this.sharedService.acknowledgeMessage(context);
        // console.log(`[auth][users.controller][getUserByEmail] email: ${JSON.stringify(email)}`);

        return await this.authService.login(dto, response); 
    }

    // @UseFilters(new HttpExceptionFilter())
    @MessagePattern({ cmd: 'registration' })
    async registration(
        // @Ctx() context: RmqContext,
        // @Payload('dto') dto: LoginDto,
        // @Payload('response') response
        @Payload() obj
    ) {
        return await this.authService.registration(obj)
        // this.sharedService.acknowledgeMessage(context);
        // console.log(`[auth][users.controller][getUserByEmail] email: ${JSON.stringify(email)}`);

        // return await this.authService.registration(dto, response);
    }

    // @UseFilters(new HttpExceptionFilter())
    @MessagePattern({ cmd: 'logout' })
    async logout(
        // @Ctx() context: RmqContext,
        @Payload('token') refreshToken,
        @Payload('response') response
    ) {
        // this.sharedService.acknowledgeMessage(context);
        // console.log(`[auth][users.controller][createUser] +`);

        return await this.authService.logout(refreshToken, response);
    }

    // @UseFilters(new HttpExceptionFilter())
    @MessagePattern({ cmd: 'refresh' })
    async refresh(
        // @Ctx() context: RmqContext,
        @Payload('token') refreshToken,
        @Payload('response') response
    ) {
        // this.sharedService.acknowledgeMessage(context);

        return await this.tokenService.refresh(refreshToken, response);
    }
}
