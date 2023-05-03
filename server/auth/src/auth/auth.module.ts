import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokensModule } from 'src/tokens/tokens.module';
import { UsersModule } from 'src/users/users.module';
import { InitService } from '../init/init.service';
import { VkService } from 'src/vk/vk.service';
import { HttpModule } from '@nestjs/axios';
import { RolesModule } from 'src/roles/roles.module';
import { VkModule } from 'src/vk/vk.module';
import { GoogleService } from 'src/google/google.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, InitService, VkService, GoogleService],
  imports: [TokensModule,
            UsersModule,
            RolesModule,
            HttpModule
          ],
  exports: [AuthService]
})
export class AuthModule {}
