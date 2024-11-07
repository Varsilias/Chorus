import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [ConfigModule, AuthModule, NotificationsModule],
})
export class V1Module {}
