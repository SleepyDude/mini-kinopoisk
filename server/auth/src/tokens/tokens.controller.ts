import { Controller } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserDto } from './dto/user.dto';
import { Token } from './tokens.model';

@Controller('tokens')
export class TokensController {
    constructor(private tokenService: TokensService) {}

    @MessagePattern({ cmd: 'generate_token' })
    async generate(@Payload() userDto: UserDto) {
        return await this.tokenService.generateToken(userDto);
    }

    @MessagePattern({ cmd: 'remove_token' })
    async remove(@Payload() token: Token) {
        return await this.tokenService.removeToken(token);
    }

    @MessagePattern({ cmd: 'get_id_by_token' })
    async getUserId(@Payload() token: Token) {
        return await this.tokenService.getUserIdByRefreshToken(token);
    }
}
