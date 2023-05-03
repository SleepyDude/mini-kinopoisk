import { Injectable } from "@nestjs/common";

@Injectable()
export class GoogleService {

  async googleLogin(user) {
    if (!user) {
        return 'No user from google'
    }
    
    const [email, firstName, lastName] = [user.email, user.firstName, user.lastName];

        return {
        message: "User info from Google",
        user: user
    }
  }
}