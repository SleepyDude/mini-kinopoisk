import { CreateUserDto } from '@hotels2023nestjs/shared';
import { Body, Controller, Inject, Post, Req, Res, UseFilters } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from "express";
import { firstValueFrom } from "rxjs";
import { AllExceptionsFilter } from 'src/filters/all.exceptions.filter';
import { DtoValidationPipe } from 'src/pipes/dto-validation.pipe';
import { Token, TokenEmail } from 'src/types/token.return.type';

@UseFilters(AllExceptionsFilter)
@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {

  constructor(
      @Inject('AUTH-SERVICE') private authService: ClientProxy,
  ) {}

  
  @ApiOperation({ summary: 'Регистрация' })
  @ApiResponse({ status: 201, type: TokenEmail, description: 'Регистрация, refresh token записывает в куки' })
  @Post('registration')
  async registration(
      @Body(DtoValidationPipe) dto: CreateUserDto, 
      @Res({ passthrough: true }) response: Response
  ) {
      const {accessToken, refreshToken} = await firstValueFrom(this.authService.send({cmd: 'registration'}, dto));
      response.cookie('refreshToken', refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
      return {email: dto.email, token: accessToken};
  }

  @ApiOperation({ summary: 'Логин' })
  @ApiResponse({ status: 200, type: Token, description: 'Вернёт access token, а refresh token запишет в куки' })
  @Post('login')
  async login(
    @Body(DtoValidationPipe) dto: CreateUserDto, 
    @Res({ passthrough: true }) response: Response
  ) {
    const {accessToken, refreshToken} = await firstValueFrom(this.authService.send({cmd: 'login'}, dto));
    response.cookie('refreshToken', refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
    return {token: accessToken};
  }

    @ApiOperation({ summary: 'Логаут' })
    @ApiResponse({ status: 200, description: 'Удалит refresh token из куков и из БД, если всё успешно возвращает true' })
    @Post('logout')
    async logout(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response
    ) {
        const { refreshToken } = request.cookies;
        response.clearCookie('refreshToken');
        const success =  await firstValueFrom(this.authService.send({cmd: 'logout'}, refreshToken));
        return !!success;
    }  
    
    @ApiOperation({ summary: 'Получение нового токена доступа' })
    @ApiResponse({ status: 200, type: Token, description: 'Вернёт access token, а refresh token запишет в куки' })
    @Post('refresh')
    async refresh(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response
    ) {
        const { refreshToken } = request.cookies;
        const { accessToken, newRefreshToken } = await firstValueFrom( this.authService.send({cmd: 'refresh'}, refreshToken) );
        response.cookie('refreshToken', newRefreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
        return {token: accessToken};
    }

    @ApiOperation({ summary: `Вход через ВК, получает объект типа AuthVK {code: string} ` })
    @ApiResponse({ status: 200, type: TokenEmail, description: 'refresh token записывает в куки'})
    @Post('vk')
    async vkLogin(
        @Body() auth: any) {
        return this.authService.send( { cmd: 'vk' }, auth)
    }
}