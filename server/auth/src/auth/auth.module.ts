import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokensModule } from 'src/tokens/tokens.module';
import { VkModule } from 'src/vk/vk.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [TokensModule,
            UsersModule,
            forwardRef(() => VkModule)
          ],
  exports: [AuthService]
})
export class AuthModule {}
