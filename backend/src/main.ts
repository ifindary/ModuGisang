import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = configService.get<number>('NEST_PORT');
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PATCH,POST',
    credentials: true,
  });
  await app.listen(port);
}
bootstrap();
