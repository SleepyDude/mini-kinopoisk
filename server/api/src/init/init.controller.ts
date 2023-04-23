import { Body, Controller, Get, Post, UseFilters } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
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

    @UseFilters(new AllExceptionsFilter())
    @Post()
    async createAdminAndRoles(
        @Body(new DtoValidationPipe()) dto: InitDto
    ) {
        console.log(`[init.controller] +`);
        return await this.initService.createAdminAndRoles(dto);
    }
    
}
