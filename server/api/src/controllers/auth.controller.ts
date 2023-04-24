import { CreateUserDto } from '@hotels2023nestjs/shared';
import { Body, Controller, Get, Inject, Param, Post, Req, Res, UseFilters } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {Request, Response} from "express";
import {firstValueFrom, lastValueFrom} from "rxjs";
import { AllExceptionsFilter } from 'src/filters/all.exceptions.filter';
import { rpcToHttp } from 'src/filters/proxy.error';
import { DtoValidationPipe } from 'src/pipes/dto-validation.pipe';
import { MessageOutput } from 'src/types/message-output.type';
import { TokenPair } from 'src/types/token.pair';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {

  constructor(
      @Inject('AUTH-SERVICE') private authService: ClientProxy,
  ) {}

  @UseFilters(AllExceptionsFilter)
  @ApiOperation({ summary: 'Регистрация' })
  @ApiResponse({ status: 201, type: MessageOutput })
  @Post('registration')
  async registration(
      @Body(DtoValidationPipe) dto: CreateUserDto, 
      @Res({ passthrough: true }) response: Response
  ) {
      const {accessToken, refreshToken} = await lastValueFrom(this.authService.send({cmd: 'registration'}, dto));
      response.cookie('refreshToken', refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
      response.cookie('accessToken', accessToken, {maxAge: 15 * 60 * 1000, httpOnly: true});
      return {"message": `Регистрация успешна, добро пожаловать на борт, ${dto.email}!`};
  }

  @ApiOperation({ summary: 'Логин' })
  @ApiResponse({ status: 200, type: MessageOutput })
  @Post('login')
  async login(
    @Body(DtoValidationPipe) dto: CreateUserDto, 
    @Res({ passthrough: true }) response: Response
  ) {
    const {accessToken, refreshToken} = await firstValueFrom(this.authService.send({cmd: 'login'}, dto));
    response.cookie('refreshToken', refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
    response.cookie('accessToken', accessToken, {maxAge: 15 * 60 * 1000, httpOnly: true});
    return {"message": "Логин успешен, токены ищи в куках"};
  }

    @ApiOperation({ summary: 'Логаут' })
    @ApiResponse({ status: 200, type: MessageOutput })
    @Post('logout')
    async logout(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response
    ) {
        response.clearCookie('refreshToken');
        const { refreshToken } = request.cookies;
        await firstValueFrom( this.authService.send({cmd: 'logout'}, refreshToken) );
        return {"message": "Вы успешно вышли из системы (рефреш токен удален)."}
    }  
    
    @ApiOperation({ summary: 'Получение нового токена доступа' })
    @ApiResponse({ status: 200, type: MessageOutput })
    @Post('refresh')
    async refresh(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response
    ) {
        const { refreshToken } = request.cookies;
        
        const { accessToken } = await firstValueFrom( this.authService.send({cmd: 'refresh'}, refreshToken) );
        response.cookie('accessToken', accessToken, {maxAge: 15 * 60 * 1000, httpOnly: true});
        return {"message": "Токен доступа успешно обновлен."}
    }
}

   // Пока что закомментировал, чтобы фронты дергали роут
    // @Post('vk')
    // async addRole(
    //     @Body() auth: any, 
    //     @Res({ passthrough: true }) response: Response
    // ) {
    //     return this.authService.send(
    //         {
    //             cmd: 'vk',
    //         },
    //         {auth, response},
    //     )
    // }