import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Token } from './tokens.model';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from './dto/user.dto';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, switchMap } from 'rxjs';

@Injectable()
export class TokensService { 
    constructor(@InjectModel(Token) private tokenRepo: typeof Token,
    @Inject('USERS-SERVICE') private readonly userService: ClientProxy,
    private jwtService: JwtService
    ){}

async generateAndSaveToken(payload : UserDto, response) {
    
    const refreshToken = this.jwtService.sign(payload, {secret: process.env.JWT_REFRESH_SECRET, expiresIn: '30d' });
    const accessToken = this.jwtService.sign(payload, {secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' });

    await this.saveToken(payload.id, refreshToken);
    response.cookie('refreshToken', refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true}) // будет жить в куках 30 дней в безопасности.

    return {refreshToken, accessToken}

}

async validateRefreshToken(token) : Promise<UserDto> {
    try {
        const userData = this.jwtService.verify(token, {secret: process.env.JWT_REFRESH_SECRET});
        return userData;
    } catch(e) {
        return null;
    } 
}

async validateAccessToken(token) : Promise<UserDto>{
    try {
        const userData = this.jwtService.verify(token, {secret: process.env.JWT_ACCESS_SECRET});
        return userData;
    } catch(e) {
        return null;
    } 
}

private async saveToken(id, refreshToken) {
    const tokenData = await this.tokenRepo.findOne({
        where: {
          id: id,
        },
    });
    if (tokenData) {
        tokenData.refreshToken = refreshToken;
        return await tokenData.save();
    }

    const token = await this.tokenRepo.create({
        id: id,
        refreshToken: refreshToken
    })
    return token;
}

async removeToken(token, response) : Promise<void> {
    await this.tokenRepo.destroy({
        where: {
          refreshToken: token,
        },
    });
    response.cookie('refreshToken', null);
}

async isTokenInDb(token) {
    const tokenData = await this.tokenRepo.findOne({where: {refreshToken: token}});
    return (tokenData) ? tokenData.id : false;
}

async getUserIdByRefreshToken(token) {
    if (!token) {
      throw new UnauthorizedException();
    }
    const userData = await this.validateRefreshToken(token);
    if (!userData || !this.isTokenInDb(token)) {
        throw new UnauthorizedException();
    }

    return userData.id
  }


  async refresh(refreshToken, response) {
    if (!refreshToken) {
      throw UnauthorizedException;
    }
    const userData = await this.validateRefreshToken(refreshToken);
    const tokenFromDb = await this.isTokenInDb(refreshToken);
    if (!userData || !tokenFromDb) {
      throw UnauthorizedException;
    }

    const user$ = this.userService.send( {cmd: 'get-user-by-id' }, userData.id ).pipe(
        switchMap((user) => { 
          if (user) return user;
        }),
        catchError( (error) => {
          console.log(error)
          throw new BadRequestException;
        })
      );
    const user = await firstValueFrom(user$);
    const userDto = new UserDto(user);
    const tokens = await this.generateAndSaveToken({...userDto}, response);
        
    return {...tokens, user: userDto};
    }

}
