import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { AuthService } from "src/auth/auth.service";
import { UsersService } from "src/users/users.service";

@Injectable()
export class GoogleService {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
    @Inject('SOCIAL-SERVICE') private readonly socialService: ClientProxy) {}

  async googleLogin(ticketPayload) {
    if (!ticketPayload) {
        return 'No user from google'
    }
    
    const [email, firstName, lastName] = [ticketPayload.email, ticketPayload.given_name, ticketPayload.family_name];
    let candidate = await this.userService.getUserByEmail(email);
    // console.log(`[ID] == ${candidate.id}`)
    if (!candidate) {
      candidate = await this.userService.createUser({email: email, password: null});
      const avatarId = await firstValueFrom(this.socialService.send( { cmd: 'upload-avatar-by-link' }, ticketPayload.picture));
    
    //create profile with firstName and lastName
    let profileData = {
      user_id: candidate.id,
      name: firstName,
      lastName: lastName,
      avatarId: avatarId
    };

    // console.log(JSON.stringify(profileData))
    await firstValueFrom(this.socialService.send( { cmd: 'create-profile' }, profileData ));
    }
    
    return await this.authService.login({email: email, password: null}, true, candidate.id);

    // return {accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, email: email, id: candidate.id};
  }
}