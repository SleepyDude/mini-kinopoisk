import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { AuthVKDto } from '@shared/dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { HttpRpcException } from '@shared';
import {
  AuthData,
  AuthDataResponse,
  ProfileFromVk,
  UserData,
  UserDataForVK,
  UserDataResponse,
} from './response.types';

@Injectable()
export class VkService {
  constructor(
    private http: HttpService,
    private authService: AuthService,
    private userService: UsersService,
    @Inject('SOCIAL-SERVICE') private readonly socialService: ClientProxy,
  ) {}

  async getUserDataFromVk(userId: number, token: string): Promise<any> {
    return firstValueFrom(
      this.http.get(
        `https://api.vk.com/method/users.get?user_ids=${userId}&fields=photo_400,has_mobile,home_town,contacts,mobile_phone&access_token=${token}&v=5.120`,
      ),
    );
  }

  private async getUserDataFromVk2(authData: AuthData): Promise<UserData> {
    try {
      const userdata: UserDataResponse = await firstValueFrom(
        this.http.get(
          `https://api.vk.com/method/users.get?user_ids=${authData.user_id}&fields=photo_400,has_mobile,home_town,contacts,mobile_phone&access_token=${authData.access_token}&v=5.120`,
        ),
      );
      return userdata.data;
    } catch (e) {
      console.log(`[VK][SERVICE][GETDATA] ${e}`);
      throw new HttpRpcException(
        'Ошибка при получении данных с ВК',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getVkToken(code: string): Promise<AuthData> {
    const VKDATA = {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    };

    const host = process.env.HOST;
    const redirectLink = process.env.REDIRECT_LINK;

    try {
      const authDataResponse: AuthDataResponse = await firstValueFrom(
        this.http.get(
          `https://oauth.vk.com/access_token?client_id=${VKDATA.client_id}&client_secret=${VKDATA.client_secret}&redirect_uri=${host}${redirectLink}&code=${code}`,
        ),
      );
      return authDataResponse.data;
    } catch (err) {
      console.log(`[VK][SERVICE][ERROR][FORM][getVkToken] ${err}`);
      throw new HttpRpcException('Плохой вк-код', HttpStatus.BAD_REQUEST);
    }
  }

  private async loginAttempt(
    authData: AuthData,
  ): Promise<ReturnType<typeof this.authService.login> | null> {
    const hasEmail = authData.hasOwnProperty('email');

    const user = hasEmail
      ? await this.userService.getUserByEmail(authData.email)
      : await this.userService.getUserByVkId(authData.user_id);

    if (!user) return null;

    return await this.authService.login(
      { email: user.email, password: user.password },
      true,
      user.id,
    );
  }

  private async registerAttempt(
    profileFromVk: ProfileFromVk,
    userDataForVk: UserDataForVK,
  ) {
    try {
      const user = await this.userService.createUser({ ...userDataForVk });

      const avatarId = await firstValueFrom(
        this.socialService.send(
          { cmd: 'upload-avatar-by-link' },
          profileFromVk.photo_400,
        ),
      );

      const profileData = {
        userId: user.id,
        name: profileFromVk.first_name,
        lastName: profileFromVk.last_name,
        avatarId: avatarId.avatarId,
      };

      await firstValueFrom(
        this.socialService.send({ cmd: 'create-profile' }, profileData),
      );

      return await this.authService.login(
        { email: userDataForVk.email, password: null },
        true,
        user.id,
      );
    } catch (err) {
      console.log(`[VK][SERVICE][ERROR][FROM][getUserDataFromVk] ${err}`);
      throw new HttpRpcException(err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Странное решение смешение логина и регистрации
  async loginVk(auth: AuthVKDto) {
    const authData = await this.getVkToken(auth.code);

    const loginData = await this.loginAttempt(authData);

    if (loginData) return loginData;

    const userdata = await this.getUserDataFromVk2(authData);

    const profileFromVk = userdata.response[0];

    const userDataForVk = {
      vk_id: authData.user_id,
      email: 'email' in authData ? authData.email : null,
      password: null,
    };

    return await this.registerAttempt(profileFromVk, userDataForVk);
  }
}
