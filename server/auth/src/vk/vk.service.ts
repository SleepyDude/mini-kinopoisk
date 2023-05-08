import { BadRequestException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { AuthVK, HttpRpcException } from '@hotels2023nestjs/shared';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class VkService {
    constructor(
        private http: HttpService,  
        private authService: AuthService,
        private userService: UsersService,
        @Inject('SOCIAL-SERVICE') private readonly socialService: ClientProxy) {}

    async getUserDataFromVk(userId: number, token: string): Promise<any> {
        return this.http
          .get(
            `https://api.vk.com/method/users.get?user_ids=${userId}&fields=photo_400,has_mobile,home_town,contacts,mobile_phone&access_token=${token}&v=5.120`
          )
          .toPromise();
      }
    
      async getVkToken(code: string): Promise<any> {
        const VKDATA = {
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
        };
    
        const host = process.env.HOST
    
        return this.http
          .get(
            `https://oauth.vk.com/access_token?client_id=${VKDATA.client_id}&client_secret=${VKDATA.client_secret}&redirect_uri=${host}/login&code=${code}`
          )
          .toPromise();
      }

      async loginVk(auth: AuthVK) {
        let authData;
    
        try {
          authData = await this.getVkToken(auth.code);
        } catch (err) {
          throw new BadRequestException("Wrong VK code");
        }
    
        const hasEmail = authData.data.hasOwnProperty("email");

        const user = (hasEmail)? await this.userService.getUserByEmail(authData.data.email) 
        : await this.userService.getUserByVkId(authData.data.user_id);

        if (user) {
          const tokens = await this.authService.login({email: user.email, password: user.password}, true, user.id);
          return {accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, email: user.email}
        }
    
        try {
          
          const { data } = await this.getUserDataFromVk(
            authData.data.user_id,
            authData.data.access_token
          );
          const profileFromVk = data.response[0];

          let userData = {
            vk_id: authData.data.user_id,
            email: (hasEmail)? authData.data.email : null,
            password: null
          };

          const user = await this.userService.createUser({...userData});
          const avatarId = firstValueFrom(this.socialService.send( { cmd: 'upload-photo' }, profileFromVk.photo_400 ));

          let profileData = {
            user_id: user.id,
            name: profileFromVk.first_name,
            lastName: profileFromVk.last_name,
            avatarId: avatarId
          };

          await this.socialService.send( { cmd: 'create-profile' }, profileData );
          // await firstValueFrom(this.socialService.send( { cmd: 'set-avatar' }, {profileId: profile.id, avatarId: avatarId} ));
    
          return await this.authService.login({email: userData.email, password: null}, true, user.id);

        } catch (err) {
          throw new HttpRpcException(err, HttpStatus.BAD_REQUEST);
        }
      }
    
}
