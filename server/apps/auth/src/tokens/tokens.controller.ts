import { Controller, UseFilters } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Token } from '../../models/tokens.model';
import { ExceptionFilter } from '../rpc-exception.filter';

@UseFilters(ExceptionFilter)
@Controller('tokens')
export class TokensController {
  constructor(private tokenService: TokensService) {}

  @MessagePattern({ cmd: 'remove_token' })
  async remove(@Payload() token: Token) {
    return await this.tokenService.removeToken(token);
  }

  @MessagePattern({ cmd: 'get_id_by_token' })
  async getUserId(@Payload() token: Token) {
    return await this.tokenService.getUserIdByRefreshToken(token);
  }

  @MessagePattern({ cmd: 'verify-access-token' })
  async verifyAccessToken(@Payload() token: string) {
    return await this.tokenService.validateAccessToken(token);
  }

  @MessagePattern({ cmd: 'verify-refresh-token' })
  async verifyRefreshToken(@Payload() token: string) {
    return await this.tokenService.validateRefreshToken(token);
  }
}
