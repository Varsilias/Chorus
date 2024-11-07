import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { UserService } from './_users/services/user.service';
import { TokenService } from './services/token.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { AuthController } from './auth.controller';
import { UserRepository } from './_users/repositories/user.repository';
import { PasswordResetTokenRepository } from './_users/repositories/password-reset-token.repository';
import { SessionRepository } from './_users/repositories/session.repository';
import { SessionService } from './_users/services/session.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { PasswordResetService } from './_users/services/password-reset.service';

@Module({
  imports: [
    ConfigModule,
    NotificationsModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.JWT_ACCESS_TOKEN_SECRET,
        signOptions: {
          expiresIn: `${config.JWT_ACCESS_TOKEN_EXPIRY}m`,
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    UserService,
    TokenService,
    UserRepository,
    PasswordResetTokenRepository,
    PasswordResetService,
    SessionRepository,
    SessionService,
  ],
  controllers: [AuthController],
  exports: [UserService, AuthService],
})
export class AuthModule {}
