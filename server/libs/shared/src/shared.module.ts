import { Module, DynamicModule } from '@nestjs/common';
import { ClientProxyFactory } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';

@Module({})
export class SharedModule {
  static registerRmq(service: string, queue: string): DynamicModule {
    const providers = [
      {
        provide: service,
        useFactory: () => {
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