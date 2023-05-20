import {
  Body,
  Controller,
  Inject,
  Post,
  Req,
  Res,
  UseFilters,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { AllExceptionsFilter } from '../filters/all.exceptions.filter';
import { DtoValidationPipe } from '../pipes/dto-validation.pipe';
import { AuthVKDto, CreateUserDto } from '@shared/dto';
import { OAuth2Client } from 'google-auth-library';
import { Token, TokenEmailId, TokenId } from '@shared/interfaces';

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_SECRET,
);

@UseFilters(AllExceptionsFilter)
@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH-SERVICE') private authService: ClientProxy) {}

  @ApiOperation({
    summary:
      'Регистрация, Refresh token записывается в куки. Access token возвращается, он должен ставиться в заголовок Authorization и иметь тип Bearer',
  })
  @ApiOkResponse({
    status: 201,
    type: TokenId,
    description: 'Успешный запрос',
  })
  @ApiConflictResponse({
    status: 409,
    description: 'Пользователь уже существует',
  })
  @ApiBadRequestResponse({
    status: 424,
    description: 'Инициализация сервера не выполнена!',
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Ошибка при создании пользователя/профиля',
  })
  @Post('registration')
  async registration(
    @Body(DtoValidationPipe) dto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<TokenId> {
    const { accessToken, refreshToken, id } = await firstValueFrom(
      this.authService.send({ cmd: 'registration' }, dto),
    );
    response.cookie('refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return { token: accessToken, id: id };
  }

  @ApiOperation({
    summary:
      'Логин, Refresh token записывается в куки. Access token возвращается, он должен ставиться в заголовок Authorization и иметь тип Bearer',
  })
  @ApiResponse({
    status: 200,
    type: TokenId,
    description: 'Успешный запрос',
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Пользователь не найден',
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Неверный пароль',
  })
  @Post('login')
  async login(
    @Body(DtoValidationPipe) dto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<TokenId> {
    const { accessToken, refreshToken, id } = await firstValueFrom(
      this.authService.send({ cmd: 'login' }, dto),
    );
    response.cookie('refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return { token: accessToken, id: id };
  }

  @ApiOperation({ summary: 'Логаут, удалит Refresh token из куков и из БД' })
  @ApiResponse({
    status: 200,
    type: Boolean,
    description: 'Успешный запрос',
  })
  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<boolean> {
    const { refreshToken } = request.cookies;
    response.clearCookie('refreshToken');
    const success = await firstValueFrom(
      this.authService.send({ cmd: 'logout' }, refreshToken),
    );

    return !!success;
  }

  @ApiOperation({
    summary: 'Получение нового токена доступа, Refresh token запишет в куки',
  })
  @ApiResponse({
    status: 200,
    type: Token,
    description: 'Успешный запрос',
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Токен отсутствует',
  })
  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Token> {
    const { refreshToken } = request.cookies;
    const { accessToken, newRefreshToken } = await firstValueFrom(
      this.authService.send({ cmd: 'refresh' }, refreshToken),
    );
    response.cookie('refreshToken', newRefreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return { token: accessToken };
  }

  @ApiOperation({
    summary: `Вход через ВК, Refresh token записывается в куки. Access token возвращается, он должен ставиться в заголовок Authorization и иметь тип Bearer`,
  })
  @ApiResponse({
    status: 200,
    type: TokenEmailId,
    description: 'Успешный запрос',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Плохой вк-код либо ошибка при получении данных с ВК',
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Ошибка при создании пользователя/профиля',
  })
  @Post('vk')
  async vkLogin(
    @Body(DtoValidationPipe) auth: AuthVKDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<TokenEmailId> {
    const dataFromVk = await firstValueFrom(
      this.authService.send({ cmd: 'vk-login' }, auth),
    );
    response.cookie('refreshToken', dataFromVk.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return {
      token: dataFromVk.accessToken,
      email: dataFromVk.email,
      id: dataFromVk.id,
    };
  }

  @ApiOperation({
    summary: `Вход через google, Refresh token записывается в куки. Access token возвращается, он должен ставиться в заголовок Authorization и иметь тип Bearer`,
  })
  @ApiResponse({
    status: 200,
    type: TokenEmailId,
    description: 'Успешный запрос',
  })
  @Post('google')
  async googleLogin(
    @Body() token: Token,
    @Res({ passthrough: true }) response: Response,
  ): Promise<TokenEmailId> {
    console.log('start login google');
    const ticket = await googleClient.verifyIdToken({
      idToken: token.token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const googleResponseData = await firstValueFrom(
      this.authService.send({ cmd: 'google-login' }, ticket.getPayload()),
    );
    response.cookie('refreshToken', googleResponseData.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return {
      token: googleResponseData.accessToken,
      email: googleResponseData.email,
      id: googleResponseData.id,
    };
  }
}
