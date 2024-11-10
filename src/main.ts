import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './v1/config/config.service';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './commons/filters/global-exception.filter';
import { ParamValidationPipe } from './commons/pipes/param-validation.pipe';
import { TransformInterceptor } from './commons/interceptors/response-transform.interceptor';
import * as fs from 'fs';
import { rateLimit } from 'express-rate-limit';
import { ormConfig } from './database/config/orm.config';

async function bootstrap() {
  const config = new ConfigService();
  const app = await NestFactory.create(AppModule, {
    httpsOptions: {
      key: fs.readFileSync('server.key'),
      cert: fs.readFileSync('server.cert'),
    },
  });

  console.log('ormConfig', ormConfig);
  const reflector = app.get(Reflector);

  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 15 minutes
      max: 10, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
    }),
  );

  app.enableCors(); // TODO: Restrict to our frontend only on production, we can configure this via env
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalPipes(new ParamValidationPipe());

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  await app.listen(config.PORT);
}
bootstrap();
