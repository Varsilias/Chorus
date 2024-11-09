import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { get } from 'https';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  // We could make this dynamic by passing it in as an
  // environment variable, but for now it's fine to have it
  // hardcoded.
  private endpoints = [
    // {
    //   url: 'switchpartner1.com',
    //   healthCheckPath: '/health-check',
    //   isHealthy: true,
    // },
    // {
    //   url: 'switchpartner2.com',
    //   healthCheckPath: '/health-check',
    //   isHealthy: true,
    // },
    // {
    //   url: 'https://switchpartner3.com',
    //   healthCheckPath: '/health-check',
    //   isHealthy: true,
    // },
    {
      url: 'jsonplaceholder.typicode.com',
      healthCheckPath: '/posts',
      isHealthy: true,
    },
    {
      url: 'fakestoreapi.com',
      healthCheckPath: '/products',
      isHealthy: true,
    },
    {
      url: 'dummyjson.com',
      healthCheckPath: '/users',
      isHealthy: true,
    },
  ];

  async checkHealth() {
    for (const endpoint of this.endpoints) {
      try {
        // We use http module instead of axios because it's more lightweight, easier to use,
        // and we don't need all the extra features of axios.
        get(`https://${endpoint.url}${endpoint.healthCheckPath}`, (res) => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            this.logger.warn(
              `Health check failed for ${endpoint.url} with status code: ${res.statusCode}`,
            );
            endpoint.isHealthy = false;
          } else {
            endpoint.isHealthy = true;
          }

          res.on('error', (err) => {
            this.logger.warn(
              `Response error for ${endpoint.url}: ${err.message}`,
            );
            endpoint.isHealthy = false;
          });
        }).on('error', (err) => {
          console.log('err', err);

          this.logger.warn(`Request error for ${endpoint.url}: ${err.message}`);
          endpoint.isHealthy = false;
        });
      } catch (error) {
        this.logger.warn(
          `Health check failed for ${endpoint.url}: ${error.message}`,
        );
        endpoint.isHealthy = false;
      }
    }
  }

  getHealthySwitches() {
    return this.endpoints.filter((endpoint) => endpoint.isHealthy);
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkHealthCron() {
    await this.checkHealth();
    this.logger.log(
      `Health check completed - ${this.getHealthySwitches().length} healthy switches found`,
    );
  }
}
