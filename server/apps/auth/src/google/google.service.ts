import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class GoogleService {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
    @Inject('SOCIAL-SERVICE') private readonly socialService: ClientProxy,
  ) {}

  async googleLogin(ticketPayload) {
    if (!ticketPayload) {
      return 'No user from google';
    }

    const [email, firstName, lastName] = [
      ticketPayload.email,
      ticketPayload.given_name,
      ticketPayload.family_name,
    ];

    let candidate = await this.userService.getUserByEmail(email);
    if (candidate) {
      return await this.authService.login(
        { email: email, password: null },
        true,
        candidate.id,
      );
    }

    candidate = await this.userService.createUser({
      email: email,
      password: null,
    });
    const avatarData = await firstValueFrom(
      this.socialService.send(
        { cmd: 'upload-avatar-by-link' },
        ticketPayload.picture,
      ),
    );

    const profileData = {
      userId: candidate.id,
      name: firstName,
      lastName: lastName,
      avatarId: avatarData.avatarId,
    };

    await firstValueFrom(
      this.socialService.send({ cmd: 'create-profile' }, profileData),
    );
    return await this.authService.login(
      { email: candidate.email, password: null },
      true,
      candidate.id,
    );
  }
}
