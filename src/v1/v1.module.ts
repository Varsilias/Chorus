import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { HealthModule } from './health/health.module';
import { LoanBalancerModule } from './loan-balancer/loan-balancer.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    NotificationsModule,
    HealthModule,
    LoanBalancerModule,
    TransactionsModule,
  ],
})
export class V1Module {}
