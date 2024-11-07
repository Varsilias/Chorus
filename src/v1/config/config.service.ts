import { z } from 'zod';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { AppStatus } from '../../commons/helpers/enum';
import { DatabaseType } from 'typeorm';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

const envConfigSchema = z.object({
  PORT: z.string().default('3000'),
  ENV: z.union([
    z.literal('development'),
    z.literal('staging'),
    z.literal('test'),
    z.literal('production'),
  ]),
  DB_ROOT: z.string(),
  DB_PASSWORD: z.string(),
  DB_ROOT_PASSWORD: z.string(),
  DB_USER: z.string(),
  DB_PORT: z.string(),
  DB_NAME: z.string(),
  JWT_ACCESS_TOKEN_SECRET: z.string(),
  JWT_REFRESH_TOKEN_SECRET: z.string(),
  JWT_ACCESS_TOKEN_EXPIRY: z.string(),
  JWT_REFRESH_TOKEN_EXPIRY: z.string(),
  DB_URL: z.string(),
  DB_SYNC: z.string(),
  DB_HOST: z.string().default('localhost'),
  DB_TYPE: z.string(),
  FRONTEND_URL: z.string(),
});

interface IEnvConfig {
  [prop: string]: string;
  PORT: string;
  ENV: 'development' | 'staging' | 'test' | 'production';
  DB_ROOT: string;
  DB_PASSWORD: string;
  DB_PORT: string;
  DB_NAME: string;
  JWT_ACCESS_TOKEN_SECRET: string;
  JWT_REFRESH_TOKEN_SECRET: string;
  JWT_ACCESS_TOKEN_EXPIRY: string;
  JWT_REFRESH_TOKEN_EXPIRY: string;
  DB_ROOT_PASSWORD: string;
  DB_USER: string;
  DB_URL: string;
  DB_SYNC: string;
  DB_HOST: string;
  DB_TYPE: DatabaseType;
  FRONTEND_URL: string;
}

@Injectable()
export class ConfigService {
  private readonly config: IEnvConfig;

  constructor() {
    const config = ConfigService.parseEnvFile();
    this.config = ConfigService.validateEnvConfig(config);
  }

  private static parseEnvFile() {
    const envFile =
      process.env.ENV !== 'development'
        ? `${process.cwd()}/.env.${process.env.ENV}`
        : `${process.cwd()}/.env`;

    return dotenv.parse(fs.readFileSync(envFile));
  }

  private static validateEnvConfig(envConfig: dotenv.DotenvParseOutput) {
    const parsedResult = envConfigSchema.safeParse(envConfig);

    if (!parsedResult.success) {
      throw new InternalServerErrorException(
        `Invalid Configuration from Env File: ${parsedResult.error.message}`,
        AppStatus.CONFIGURATION_ERROR,
      );
    }

    return parsedResult.data as IEnvConfig;
  }

  get(key: string): string {
    return this.config[key];
  }

  get inProduction(): boolean {
    return this.config.ENV === 'production';
  }

  get PORT(): number {
    return parseInt(this.config.PORT || '3000', 10);
  }

  get DB_USER(): string {
    return this.config.DB_USER;
  }

  get DB_NAME(): string {
    return this.config.DB_NAME;
  }

  get DB_PASSWORD(): string {
    return this.config.DB_PASSWORD;
  }

  get DB_HOST(): string {
    return this.config.DB_HOST;
  }
  get DB_PORT(): number {
    return Number(this.config.DB_PORT);
  }

  get DB_TYPE(): string {
    return this.config.DB_TYPE;
  }
  get DB_URL(): string {
    return this.inProduction ? this.config.DB_URL : '';
  }
  get JWT_ACCESS_TOKEN_SECRET(): string {
    return this.config.JWT_ACCESS_TOKEN_SECRET;
  }

  get JWT_ACCESS_TOKEN_EXPIRY(): string {
    return this.config.JWT_ACCESS_TOKEN_EXPIRY;
  }

  get JWT_REFRESH_TOKEN_SECRET(): string {
    return this.config.JWT_REFRESH_TOKEN_SECRET;
  }

  get JWT_REFRESH_TOKEN_EXPIRY(): string {
    return this.config.JWT_REFRESH_TOKEN_EXPIRY;
  }

  get DB_SYNC() {
    return /(true|on|1)/gi.test(this.config.DB_SYNC);
  }

  get FRONTEND_URL() {
    return this.config.FRONTEND_URL;
  }
}
