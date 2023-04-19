import { Module, DynamicModule } from '@nestjs/common';
import { SharedService } from './shared.service';
import { SharedOptionsDto } from './dto/shared-options.dto';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory } from '@nestjs/microservices/client/client-proxy-factory';
import { Transport } from '@nestjs/microservices/enums/transport.enum';

@Module({})
export class SharedModule {
  static registerRmq(service: string, queue: string): DynamicModule {
    const providers = [
      {
        provide: service,
        useFactory: () => {
          // const URL = configService.get('CLOUDAMQP_URL');
          return ClientProxyFactory.create({
            transport: Transport.RMQ,
            options: {
              urls: [process.env.CLOUDAMQP_URL],
              queue: queue,
              queueOptions: {
                durable: false,
              }
            }
          });
        },
        inject: []
      },
    ];

    return {
        module: SharedModule,
        providers,
        exports: providers,
    };
  }
}