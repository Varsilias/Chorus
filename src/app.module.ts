import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { V1Module } from './v1/v1.module';
import { RequestLoggerMiddleware } from './commons/middlewares/request-logger.middleware';
import { DatabaseModule } from './database/database.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './v1/auth/jwt/guards/jwt-auth.guard';
import { JwtStrategy } from './v1/auth/jwt/strategy/jwt.strategy';
import { AuthModule } from './v1/auth/auth.module';
import { ConfigModule } from './v1/config/config.module';

@Module({
  imports: [V1Module, DatabaseModule, AuthModule, ConfigModule],
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
