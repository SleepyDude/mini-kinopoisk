import { Body, Controller, Get, Post, Res, UseFilters } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { HttpRpcException } from 'src/exceptions/http.rpc.exception';
import { AllExceptionsFilter } from 'src/filters/all.exceptions.filter';
import { DtoValidationPipe } from 'src/pipes/dto-validation.pipe';
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
    @Post()
    async createAdminAndRoles(
        @Body(new DtoValidationPipe()) dto: InitDto,
        @Res({ passthrough: true }) response: Response
    ) {
        console.log(`[init.controller] +`);
        const {refreshToken, accessToken} =  await this.initService.createAdminAndRoles(dto);
        response.cookie('refreshToken', refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
        response.cookie('accessToken', accessToken, { maxAge: 15 * 60 * 1000, httpOnly: true });
        return {message: `Вы теперь тут главный, ${dto.email}, поздравляем!`};
    }
}
