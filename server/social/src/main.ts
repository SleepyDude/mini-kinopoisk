import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.CLOUDAMQP_URL],
      queue: process.env.SOCIAL_QUEUE,
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.listen();
}
bootstrap();
