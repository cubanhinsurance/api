import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json } from 'body-parser';
import * as cookieParser from 'cookie-parser';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  // app.setGlobalPrefix('v1/api');
  app.useGlobalPipes(new ValidationPipe());

  app.use(cookieParser());
  app.use(
    json({
      limit: '20mb',
    }),
  );

  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: 'redis',
      connect_timeout: 2000,
      retryAttempts: 400,
      retryDelay: 10000,
    },
  });

  app.useWebSocketAdapter(new IoAdapter(app));

  const options = new DocumentBuilder()
    .setTitle('Who fix services')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('doc', app, document);

  app.startAllMicroservices();
  await app.listen(4000);
}
bootstrap();
