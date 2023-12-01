import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';
import 'es6-shim';
// import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.setGlobalPrefix('/v0/api');

  app.enableCors(); // TODO: add CorsOptions next time
  app.use(cookieParser());
  app.use(json());
  // app.use(bodyParser.urlencoded({ verify: applyRawBody, extended: true }));
  // app.use(bodyParser.json({ verify: applyRawBody }));

  await app.listen(3000);
}

bootstrap();
