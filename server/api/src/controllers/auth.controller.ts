import { Body, Controller, Get, Inject, Param, Post, Res } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {Response} from "express";
import {lastValueFrom} from "rxjs";

@Controller('auth')
export class AuthController {

  constructor(
      @Inject('AUTH-SERVICE') private authService: ClientProxy,
  ) {}

  @Post('login')
  async login(
    @Body() dto: any, 
    @Res({ passthrough: true }) response: Response
  ) {
    return this.authService.send(
      {
        cmd: 'login',
      },
      {dto: dto, response: response}
    )
  }

    // @RoleAccess({minRoleVal: initRoles.ADMIN.value, allowSelf: true})
    // @UseGuards(RolesGuard)
    @Post('registration')
    async registration(
        @Body() dto: any, 
        @Res({ passthrough: true }) response: Response
    ) {
            const userData = await lastValueFrom(this.authService.send({cmd: 'registration'}, dto));
            response.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
            return userData;

    }

    // @RoleAccess(initRoles.ADMIN.value)
    // @UseGuards(RolesGuard)
    @Post('vk')
    async addRole(
        @Body() auth: any, 
        @Res({ passthrough: true }) response: Response
    ) {
        return this.authService.send(
            {
                cmd: 'vk',
            },
            {auth, response},
        )
    }
  // @RoleAccess(initRoles.ADMIN.value)
    // @UseGuards(RolesGuard)
    @Post('logout')
    async logout(
        @Body() token: any, 
        @Res({ passthrough: true }) response: Response
    ) {
        return this.authService.send(
            {
                cmd: 'logout',
            },
            {token, response},
        )
    }  
    
    // @RoleAccess(initRoles.ADMIN.value)
    // @UseGuards(RolesGuard)
    @Post('refresh')
    async refresh(
        @Body() token: any, 
        @Res({ passthrough: true }) response: Response
    ) {
        return this.authService.send(
            {
                cmd: 'refresh',
            },
            {token, response},
        )
    }

}