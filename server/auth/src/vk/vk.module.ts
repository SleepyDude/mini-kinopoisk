import { Module } from '@nestjs/common';
import { VkService } from './vk.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [VkService],
  exports: [VkService],
  imports: [AuthModule,
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
  ]
})
export class VkModule {}
