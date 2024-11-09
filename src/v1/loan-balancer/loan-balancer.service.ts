import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HealthService } from '../health/health.service';

@Injectable()
export class LoanBalancerService {
  private currentIndex = 0;
  private readonly logger = new Logger(LoanBalancerService.name);

  constructor(private readonly healthService: HealthService) {}

  getNextHealthySwitch() {
    const healthySwitches = this.healthService.getHealthySwitches();

    if (healthySwitches.length === 0) {
      //TODO: we could setup a retry mechanism here
      //TODO: we could also setup a circuit breaker here
      //TODO: we could also setup a fallback mechanism here
      //TODO: we should definitely setup alerting here(Maybe integrate with sentry, or slack to notify the team)

      this.logger.error('No healthy switches found');
      throw new InternalServerErrorException(
        'Service Unavailable. Try again later',
      );
    }

    const nextSwitch = healthySwitches[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % healthySwitches.length;
    return nextSwitch.url;
  }
}
