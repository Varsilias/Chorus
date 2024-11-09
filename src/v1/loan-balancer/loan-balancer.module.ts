import { Module } from '@nestjs/common';
import { LoanBalancerService } from './loan-balancer.service';
import { HealthModule } from '../health/health.module';

@Module({
  imports: [HealthModule],
  providers: [LoanBalancerService],
  exports: [LoanBalancerService],
})
export class LoanBalancerModule {}
