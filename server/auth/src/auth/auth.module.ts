import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TokensService } from 'src/tokens/tokens.service';
import { TokensModule } from 'src/tokens/tokens.module';
import { VkModule } from 'src/vk/vk.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [TokensModule,
            forwardRef(() => VkModule),
            ClientsModule.register([
              {
                name: 'USERS-SERVICE',
                transport: Transport.RMQ,
                options: {
                  urls: [process.env.CLOUDAMQP_URL],
                  queue: process.env.USERS_QUEUE,
                  queueOptions: { durable: false },
                },
              },  
            ])
          ],
  exports: [AuthService]
})
export class AuthModule {}
