import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { LoadBalancerModule } from '../load-balancer/load-balancer.module';
import { HttpModule } from '@nestjs/axios';
import { TransactionRepository } from './repository/transaction.repository';

@Module({
  imports: [HttpModule.register({}), LoadBalancerModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionRepository],
})
export class TransactionsModule {}
