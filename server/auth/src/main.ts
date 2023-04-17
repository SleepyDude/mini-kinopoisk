import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const PORT = process.env.PORT || 3000;

  const config = new DocumentBuilder()
  .setTitle('Kinopoisk API')
  .setDescription('REST API docs')
  .setVersion('1.0.0')
  .addTag('Hotels.ru Juniors ^^')
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('/api/docs', app, document);

  await app.listen(PORT, () => {
    console.log(`Server started on ${PORT} port...`);
  });
}
bootstrap();
