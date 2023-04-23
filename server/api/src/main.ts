import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser())

  const PORT = 3000;

  await app.listen(PORT, () => {`Сервер запущен на внутреннем порту ${PORT}`}); // Внутри контейнера порт 3000 всегда
}

bootstrap();
