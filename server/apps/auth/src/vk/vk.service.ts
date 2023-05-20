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

  async getVkToken(code: string): Promise<any> {
    const VKDATA = {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    };

    const host = process.env.HOST;
    const redirectLink = process.env.REDIRECT_LINK;

    return firstValueFrom(
      this.http.get(
        `https://oauth.vk.com/access_token?client_id=${VKDATA.client_id}&client_secret=${VKDATA.client_secret}&redirect_uri=${host}${redirectLink}&code=${code}`,
      ),
    );
  }

  async loginVk(auth: AuthVKDto) {
    let authData;

    try {
      authData = await this.getVkToken(auth.code);
    } catch (err) {
      console.log(`[VK][SERVICE][ERROR][FORM][getVkToken] ${err}`);
      throw new HttpRpcException('Плохой вк-код', HttpStatus.BAD_REQUEST);
    }

    const hasEmail = authData.data.hasOwnProperty('email');

    const user = hasEmail
      ? await this.userService.getUserByEmail(authData.data.email)
      : await this.userService.getUserByVkId(authData.data.user_id);

    if (user) {
      return await this.authService.login(
        { email: user.email, password: user.password },
        true,
        user.id,
      );
    }

    let userdata;
    try {
      userdata = await this.getUserDataFromVk(
        authData.data.user_id,
        authData.data.access_token,
      );
    } catch (e) {
      console.log(`[VK][SERVICE][GETDATA] ${e}`);
      throw new HttpRpcException(
        'Ошибка при получении данных с ВК',
        HttpStatus.BAD_REQUEST,
      );
    }
    const data = userdata.data;
    const profileFromVk = data.response[0];

    const userData = {
      vk_id: authData.data.user_id,
      email: hasEmail ? authData.data.email : null,
      password: null,
    };

    try {
      const user = await this.userService.createUser({ ...userData });

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
        { email: userData.email, password: null },
        true,
        user.id,
      );
    } catch (err) {
      console.log(`[VK][SERVICE][ERROR][FROM][getUserDataFromVk] ${err}`);
      throw new HttpRpcException(err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
