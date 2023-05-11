import { Body, Controller, Inject, Post, Req, Res, UseFilters, ValidationPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from "express";
import { firstValueFrom } from "rxjs";
import { AllExceptionsFilter } from '../filters/all.exceptions.filter';
import { DtoValidationPipe } from '../pipes/dto-validation.pipe';
import { Token, TokenEmail, TokenEmailId, TokenId } from '../types/token.return.type';
import { AuthVK, CreateUserDto } from '@hotels2023nestjs/shared';
import {OAuth2Client} from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_SECRET)

@UseFilters(AllExceptionsFilter)
@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {

  constructor(
      @Inject('AUTH-SERVICE') private authService: ClientProxy,
  ) {}

  @ApiOperation({ summary: 'Регистрация' })
  @ApiResponse({ status: 201, type: TokenId, description: 'Refresh token записывает в куки' })
  @Post('registration')
  async registration(
      @Body(DtoValidationPipe) dto: CreateUserDto,
      @Res({ passthrough: true }) response: Response
  ) {
      const {accessToken, refreshToken, id} = await firstValueFrom(this.authService.send({cmd: 'registration'}, dto));
      response.cookie('refreshToken', refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
      
      return {token: accessToken, id: id};
  }

  @ApiOperation({ summary: 'Логин' })
  @ApiResponse({ status: 200, type: TokenId, description: 'Refresh token запишет в куки' })
  @Post('login')
  async login(
    @Body(DtoValidationPipe) dto: CreateUserDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const {accessToken, refreshToken, id} = await firstValueFrom(this.authService.send({cmd: 'login'}, dto));
    response.cookie('refreshToken', refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});

    return {token: accessToken, id: id};
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
    @ApiResponse({ status: 200, type: Token, description: 'Refresh token запишет в куки' })
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

    @ApiOperation({ summary: `Вход через ВК` })
    @ApiResponse({ status: 200, type: TokenEmailId, description: 'Refresh token записывает в куки'})
    @Post('vk')
    async vkLogin(
        @Body(new ValidationPipe()) auth: AuthVK,
        @Res({ passthrough: true }) response: Response) {
            const dataFromVk = await firstValueFrom(this.authService.send( { cmd: 'vk-login' }, auth));
            response.cookie('refreshToken', dataFromVk.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
            
            return {token: dataFromVk.accessToken, email: dataFromVk.email, id: dataFromVk.id};
    }

    @ApiOperation({ summary: `Вход через google` })
    @ApiResponse({ status: 200, type: TokenEmailId, description: 'Refresh token записывает в куки'})
    @Post('google')
    async googleLogin(
        @Body() token: Token,
        @Res({ passthrough: true }) response: Response
        ) {
            const ticket = await googleClient.verifyIdToken({
                idToken: token.token,
                audience: process.env.GOOGLE_CLIENT_ID
            })
            const googleResponseData = await firstValueFrom(this.authService.send( { cmd: 'google-login' }, ticket.getPayload()));
            response.cookie('refreshToken', googleResponseData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});

            return {token: googleResponseData.accessToken, email: googleResponseData.email, id: googleResponseData.id};
    }
}