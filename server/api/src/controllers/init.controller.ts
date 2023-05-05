import { Controller, Get, Inject, UseFilters } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AllExceptionsFilter } from '../filters/all.exceptions.filter';
import { TokenEmail } from '../types/token.return.type';
import { ClientProxy } from '@nestjs/microservices';

@ApiTags('Инициализация приложения')
@Controller('init')
export class InitController {

    constructor(
        @Inject('AUTH-SERVICE') private authService: ClientProxy,
    ) {}

    @UseFilters(AllExceptionsFilter)
    @ApiOperation({ summary: 'Инициализация сервера' })
    @ApiResponse({ status: 201, type: TokenEmail, description: 'Инициализация сервера и создание главного администратора' })
    @Get()
    async createAdminAndRoles(
    ) {
        return await this.authService.send( { cmd: 'init' }, {} );
    }
}
