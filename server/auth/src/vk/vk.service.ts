import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AuthVK } from './vk.model';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, switchMap } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class VkService {
    constructor(
        private http: HttpService,  
        private authService: AuthService,
        @Inject('USER_SERVICE') private readonly userService: ClientProxy,) {}

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

      async loginVk(auth: AuthVK, response) {
        let authData;
    
        try {
          authData = await this.getVkToken(auth.code);
        } catch (err) {
          throw new BadRequestException("Wrong VK code");
        }
    
        const hasEmail = authData.data.hasOwnProperty("email");

        const user$ = (!hasEmail)? this.userService.send( {cmd: 'get-user-by-vk-id'}, authData.data.user_id).pipe(
            switchMap((user) => {
              return user
            })
          ) : this.userService.send( {cmd: 'get-user-by-email'}, authData.data.email).pipe(
            switchMap((user) => {
              return user
            })
          )

        const _user : any = await firstValueFrom(user$);

        if (_user) {
          return await this.authService.login({..._user}, response, true);
        }
    
        try {
          const { data } = await this.getUserDataFromVk(
            authData.data.user_id,
            authData.data.access_token
          );
    
          let user = {
            vk_id: authData.data.user_id,
            email: authData.data.email,
            password: null,
            roles: []
          };
    
          await this.userService.send( {cmd: 'create-user'}, {...user});

          // создать профиль
    
          return this.authService.login(user, response, true);
        } catch (err) {
            console.log(err)
          throw new BadRequestException(err);
        }
      }
    
}
