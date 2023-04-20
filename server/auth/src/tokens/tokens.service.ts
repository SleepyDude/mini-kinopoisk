import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Token } from './tokens.model';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from './dto/user.dto';

@Injectable()
export class TokensService { constructor(@InjectModel(Token) private tokenRepo: typeof Token,
    private jwtService: JwtService
    ){}

async generateToken(payload : UserDto) {
    
    const refreshToken = this.jwtService.sign(payload, {secret: process.env.JWT_REFRESH_SECRET, expiresIn: '30d' });
    const accessToken = this.jwtService.sign(payload, {secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' });

    await this.saveToken(payload.id, refreshToken);

    return {refreshToken, accessToken}
}

async validateRefreshToken(token) {
    try {
        const userData = this.jwtService.verify(token, {secret: process.env.JWT_REFRESH_SECRET});
        return userData;
    } catch(e) {
        return null;
    } 
}

async validateAccessToken(token) {
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

async removeToken(token) {
    const tokenData = await this.tokenRepo.destroy({
        where: {
          refreshToken: token,
        },
    });
    return tokenData;
}

async isTokenInDb(token) {
    const tokenData = await this.tokenRepo.findOne({where: {refreshToken: token}});
    return (tokenData) ? true : false;
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
}
