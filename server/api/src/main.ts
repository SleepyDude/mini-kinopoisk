import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);

  const PORT = 3000;

  await app.listen(PORT, () => {`Сервер запущен на внутреннем порту ${PORT}`}); // Внутри контейнера порт 3000 всегда
}

bootstrap();
