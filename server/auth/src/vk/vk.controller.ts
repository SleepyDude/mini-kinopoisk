import { BadRequestException, Body, Controller, UseFilters, ValidationPipe } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { TokensService } from 'src/tokens/tokens.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { AuthVK } from './vk.model';
import { VkService } from './vk.service';
import { ExceptionFilter } from '../rpc-exception.filter';

@UseFilters(ExceptionFilter)
@Controller("/login/vk")
export class VkController {

    constructor(
        private vkService: VkService,
        private tokenService: TokensService,
        // private readonly sharedService: SharedService,
    ) {}

    @MessagePattern({ cmd: 'login-vk' })
    async loginVk(@Body(new ValidationPipe()) auth: AuthVK) {
        this.vkService.loginVk(auth);
     }
  
}
