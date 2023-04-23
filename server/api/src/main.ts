import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  app.setGlobalPrefix('api');

  const PORT = 3000;

  const config = new DocumentBuilder()
    .setTitle('Фильмы. Финальный проект')
    .setDescription('Документация REST API')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);



  await app.listen(PORT, () => {`Сервер запущен на внутреннем порту ${PORT}`}); // Внутри контейнера порт 3000 всегда
}

bootstrap();
