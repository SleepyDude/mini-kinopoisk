import { Injectable } from "@nestjs/common";
import { AuthService } from "src/auth/auth.service";
import { UsersService } from "src/users/users.service";

@Injectable()
export class GoogleService {
  constructor(
    private authService: AuthService,
    private userService: UsersService) {}

  async googleLogin(user) {
    if (!user) {
        return 'No user from google'
    }
    
    const [email, firstName, lastName] = [user.email, user.firstName, user.lastName];
    const candidate = await this.userService.getUserByEmail(email);
    if (!candidate) {
      await this.userService.createUser({email: email, password: null});
    }
    //create profile with firstName and lastName
    const tokens = await this.authService.login({email: email, password: null}, true);

    return {accessTpken: tokens.accessToken, refreshToken: tokens.refreshToken, email: email};
  }
}