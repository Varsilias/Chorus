import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let healthService: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();

    healthService = module.get<HealthService>(HealthService);
  });

  it('should return only healthy endpoints', async () => {
    await healthService.checkHealth();
    const healthyEndpoints = healthService.getHealthySwitches();
    expect(healthyEndpoints.every((e) => e.isHealthy)).toBe(true);
  });

  it('should handle an endpoint going down', async () => {
    jest.spyOn(healthService, 'getHealthySwitches').mockImplementation(() => {
      return [
        { url: 'healthyUrl', healthCheckPath: '/healthy', isHealthy: true },
        {
          url: 'unhealthyUrl',
          healthCheckPath: '/unhealthy',
          isHealthy: false,
        },
      ];
    });

    await healthService.checkHealth();
    const healthyEndpoints = healthService.getHealthySwitches();

    expect(healthyEndpoints.every((e) => e.isHealthy)).toBe(false);
    expect(healthyEndpoints.filter((e) => !e.isHealthy).length).toBe(1);
  });
});
