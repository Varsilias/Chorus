import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../v1/config/config.module';
import { ConfigService } from '../v1/config/config.service';
import { ormConfig } from './config/orm.config';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        ...ormConfig,
      }),
    }),
  ],
  providers: [],
  exports: [],
})
export class DatabaseModule {}
