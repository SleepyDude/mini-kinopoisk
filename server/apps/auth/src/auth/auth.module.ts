import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokensModule } from '../tokens/tokens.module';
import { UsersModule } from '../users/users.module';
import { InitService } from '../init/init.service';
import { VkService } from '../vk/vk.service';
import { HttpModule } from '@nestjs/axios';
import { RolesModule } from '../roles/roles.module';
import { GoogleService } from '../google/google.service';
import { SharedModule } from '@shared';

@Module({
  controllers: [AuthController],
  providers: [AuthService, InitService, VkService, GoogleService],
  imports: [
    TokensModule,
    UsersModule,
    RolesModule,
    HttpModule,
    SharedModule.registerRmq('SOCIAL-SERVICE', process.env.SOCIAL_QUEUE),
  ],
  exports: [AuthService],
})
export class AuthModule {}
