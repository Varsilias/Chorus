import { Test, TestingModule } from '@nestjs/testing';
import { LoadBalancerService } from './load-balancer.service';
import { HealthService } from '../health/health.service';

describe('LoadBalancerService', () => {
  let loadBalancerService: LoadBalancerService;
  let healthService: HealthService;

  const mockEndpoints = [
    { url: 'https://endpoint1.com', isHealthy: true, healthCheckPath: '/api' },
    {
      url: 'https://endpoint2.com',
      isHealthy: true,
      healthCheckPath: '/api',
    },
    { url: 'https://endpoint3.com', isHealthy: true, healthCheckPath: '/api' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoadBalancerService,
        {
          provide: HealthService,
          useValue: {
            getHealthySwitches: jest.fn().mockReturnValue(mockEndpoints),
          },
        },
      ],
    }).compile();

    loadBalancerService = module.get<LoadBalancerService>(LoadBalancerService);
    healthService = module.get<HealthService>(HealthService);
  });

  it('should rotate through healthy endpoints in round-robin order', () => {
    const expectedOrder = [
      'https://endpoint1.com',
      'https://endpoint2.com',
      'https://endpoint3.com',
      'https://endpoint1.com',
    ];
    const actualOrder = expectedOrder.map(() =>
      loadBalancerService.getNextHealthySwitch(),
    );

    expect(actualOrder).toEqual(expectedOrder);
  });

  it('should only select from healthy endpoints', () => {
    jest.spyOn(healthService, 'getHealthySwitches').mockReturnValue([
      {
        url: 'https://endpoint2.com',
        isHealthy: true,
        healthCheckPath: '/api',
      },
      {
        url: 'https://endpoint3.com',
        isHealthy: true,
        healthCheckPath: '/api',
      },
    ]);

    const selectedEndpoints = [
      loadBalancerService.getNextHealthySwitch(),
      loadBalancerService.getNextHealthySwitch(),
      loadBalancerService.getNextHealthySwitch(),
    ];

    expect(selectedEndpoints).toEqual([
      'https://endpoint2.com',
      'https://endpoint3.com',
      'https://endpoint2.com',
    ]);
  });
});
