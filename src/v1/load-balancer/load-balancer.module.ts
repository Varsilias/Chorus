import { Module } from '@nestjs/common';
import { LoadBalancerService } from './load-balancer.service';
import { HealthModule } from '../health/health.module';

@Module({
  imports: [HealthModule],
  providers: [LoadBalancerService],
  exports: [LoadBalancerService],
})
export class LoadBalancerModule {}
