import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Token } from './tokens.model';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from './dto/user.dto';
import { UsersService } from 'src/users/users.service';
import { HttpRpcException } from '@hotels2023nestjs/shared';

@Injectable()
export class TokensService { 
    constructor(@InjectModel(Token) private tokenRepo: typeof Token,
    private userService: UsersService,
    private jwtService: JwtService
    ){}

async generateAndSaveToken(payload : UserDto) {
    const refreshToken = this.jwtService.sign({...payload}, {secret: process.env.JWT_REFRESH_SECRET, expiresIn: '30d' });
    const accessToken = this.jwtService.sign({...payload}, {secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' });
    await this.saveToken(payload.id, refreshToken);
   
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
        await tokenData.save();
        return;
    }

    await this.tokenRepo.create({
        id: id,
        refreshToken: refreshToken
    })
}

async removeToken(refreshToken) {
  return await this.tokenRepo.destroy({
    where: {
      refreshToken: refreshToken,
    },
  });
}

async tokenFromDB(refreshToken) {
    const tokenData = await this.tokenRepo.findOne({where: {refreshToken: refreshToken}});
    return (tokenData) ? tokenData : null;
}

async getUserIdByRefreshToken(refreshToken) {
    if (!refreshToken) {
      throw new HttpRpcException('Не авторизован', HttpStatus.UNAUTHORIZED);
    }
    const userData = await this.validateRefreshToken(refreshToken);
    return (userData) ? userData.id : null
  }


  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new HttpRpcException('Не авторизован', HttpStatus.UNAUTHORIZED);
    }
    const userId = await this.getUserIdByRefreshToken(refreshToken);
    const tokenFromDb = await this.tokenFromDB(refreshToken);
    if (!userId || !tokenFromDb) {
      throw new HttpRpcException('Не авторизован', HttpStatus.UNAUTHORIZED);
    }
  
    const user = await this.userService.getUserById(userId);
    const userDto = new UserDto(user);
    const tokens = await this.generateAndSaveToken({...userDto});
  
    return {accessToken: tokens.accessToken, newRefreshToken: tokens.refreshToken};
  }

}