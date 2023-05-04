import { HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AuthVK } from './vk.model';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { HttpRpcException } from '@hotels2023nestjs/shared';

@Injectable()
export class VkService {
    constructor(
        private http: HttpService,  
        private authService: AuthService,
        private userService: UsersService) {}

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
            `https://oauth.vk.com/access_token?client_id=${VKDATA.client_id}&client_secret=${VKDATA.client_secret}&redirect_uri=${host}/signin&code=${code}`
          )
          .toPromise();
      }

      async loginVk(auth: AuthVK) {
        let authData;
    
        try {
          authData = await this.getVkToken(auth.code);
        } catch (err) {
          throw new HttpRpcException('Wrong VK code', HttpStatus.BAD_REQUEST);
          // throw new BadRequestException("Wrong VK code");
        }
    
        const hasEmail = authData.data.hasOwnProperty("email");

        const user = (hasEmail)? await this.userService.getUserByEmail(authData.data.email) 
        : await this.userService.getUserById(authData.data.user_id);

        if (user) {
          return await this.authService.login({...user}, true);
        }
    
        try {
          const { data } = await this.getUserDataFromVk(
            authData.data.user_id,
            authData.data.access_token
          );
          const profile = data.response[0];

          let userData = {
            vk_id: authData.data.user_id,
            email: authData.data.email,
            password: null,
            roles: []
          };

          const id = await this.userService.createUser({...userData});

          let profileData = {
            id: id,
            name: profile.first_name,
            lastName: profile.last_name,
            avatar: profile.photo_400
          };

          // создать профиль
    
          return this.authService.login(userData, true);
        } catch (err) {
          throw new HttpRpcException(err, HttpStatus.BAD_REQUEST);
          // throw new BadRequestException(err);
        }
      }
    
}
