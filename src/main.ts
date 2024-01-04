import 'reflect-metadata';
import 'es6-shim';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';
import { json } from 'express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const httpsOptions = {
  key: fs.readFileSync('src/ssl/bidding.eccube.key'),
  cert: fs.readFileSync('src/ssl/bidding.eccube.crt'),
};

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create(AppModule, { httpsOptions });

  // app.setGlobalPrefix('/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // TODO: fix CorsOptions next time
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.use(cookieParser());
  app.use(json());

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
