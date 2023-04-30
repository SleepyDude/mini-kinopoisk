import { Module, forwardRef } from '@nestjs/common';
import { VkService } from './vk.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from 'src/auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [VkService],
  exports: [VkService],
  imports: [HttpModule,
    UsersModule,
    forwardRef(() => AuthModule)
  ]
})
export class VkModule {}
