import { Controller, UseFilters } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Token } from './tokens.model';
import { ExceptionFilter } from '../rpc-exception.filter';

@UseFilters(ExceptionFilter)
@Controller('tokens')
export class TokensController {
    constructor(private tokenService: TokensService) {}

    @MessagePattern({ cmd: 'remove_token' })
    async remove(@Payload() token: Token, response) {
        return await this.tokenService.removeToken(token);
    }

    @MessagePattern({ cmd: 'get_id_by_token' })
    async getUserId(@Payload() token: Token) {
        return await this.tokenService.getUserIdByRefreshToken(token);
    }

    @MessagePattern({ cmd: 'verify-access-token' })
    async verifyAccessToken(
        // @Ctx() context: RmqContext,
        @Payload() token: string
    ) {
        // this.sharedService.acknowledgeMessage(context);
        // console.log(`[auth][users.controller][getUserByEmail] email: ${JSON.stringify(email)}`);

        return await this.tokenService.validateAccessToken(token);
    }

    @MessagePattern({ cmd: 'verify-refresh-token' })
    async verifyRefreshToken(
        // @Ctx() context: RmqContext,
        @Payload() token: string
    ) {
        // this.sharedService.acknowledgeMessage(context);
        // console.log(`[auth][users.controller][getUserByEmail] email: ${JSON.stringify(email)}`);

        return await this.tokenService.validateRefreshToken(token);
    }

    // @MessagePattern({ cmd: 'generate-and-save-tokens' })
    // async generateAndSaveTokens(
    //     // @Ctx() context: RmqContext,
    //     @Payload() userDto: UserDto, response
    // ) {
    //     // this.sharedService.acknowledgeMessage(context);
    //     // console.log(`[auth][users.controller][getUserByEmail] email: ${JSON.stringify(email)}`);
    //
    //     return await this.tokenService.generateAndSaveToken(userDto, response)
    // }
}
