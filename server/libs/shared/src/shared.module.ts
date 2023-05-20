import { Module, DynamicModule } from '@nestjs/common';
import { ClientProxyFactory } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { SequelizeModule } from '@nestjs/sequelize';

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
              },
            },
          });
        },
        inject: [],
      },
    ];

    return {
      module: SharedModule,
      providers,
      exports: providers,
    };
  }

  static registerDatabase(dbName: string): DynamicModule {
    const imports = [
      SequelizeModule.forRootAsync({
        imports: [],
        useFactory: () => ({
          dialect: 'postgres',
          host: process.env.POSTGRES_HOST,
          port: Number(process.env.POSTGRES_PORT_INSIDE),
          username: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD,
          database: dbName,
          autoLoadModels: true,
        }),

        inject: [],
      }),
    ];

    return {
      module: SharedModule,
      imports,
    };
  }
}
