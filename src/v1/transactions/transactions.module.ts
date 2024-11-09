import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { LoanBalancerModule } from '../loan-balancer/loan-balancer.module';
import { HttpModule } from '@nestjs/axios';
import { TransactionRepository } from './repository/transaction.repository';

@Module({
  imports: [HttpModule.register({}), LoanBalancerModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionRepository],
})
export class TransactionsModule {}
