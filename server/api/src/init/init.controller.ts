import { Body, Controller, Get, Post, Res, UseFilters } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { HttpRpcException } from 'src/exceptions/http.rpc.exception';
import { AllExceptionsFilter } from 'src/filters/all.exceptions.filter';
import { DtoValidationPipe } from 'src/pipes/dto-validation.pipe';
import { TokenEmail } from 'src/types/token.return.type';
import { InitDto } from './dto/init.dto';
// import { DtoValidationPipe, HttpExceptionFilter, ObservableExceptionFilter, SharedService } from 'y/shared';
// import { InitDto } from './dto/init.dto';
import { InitService } from './init.service';

@ApiTags('Инициализация приложения')
@Controller('init')
export class InitController {

    constructor(
        private initService: InitService,
    ) {}

    @UseFilters(AllExceptionsFilter)
    @ApiOperation({ summary: 'Инициализация сервера' })
    @ApiResponse({ status: 201, type: TokenEmail, description: 'Инициализация сервера и создание главного администратора' })
    @Post()
    async createAdminAndRoles(
        @Body(new DtoValidationPipe()) dto: InitDto,
        @Res({ passthrough: true }) response: Response
    ) {
        console.log(`[init.controller] +`);
        const {refreshToken, accessToken} =  await this.initService.createAdminAndRoles(dto);
        response.cookie('refreshToken', refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
        return { email: dto.email, token: accessToken };
    }
}
