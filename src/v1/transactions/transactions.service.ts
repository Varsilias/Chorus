import { Injectable, Logger } from '@nestjs/common';
import { LoadBalancerService } from '../load-balancer/load-balancer.service';
import { HttpService } from '@nestjs/axios';
import { TransactionDto } from './dto/process-transaction.dto';
import { TransactionRepository } from './repository/transaction.repository';
import { TransactionStatus } from './types';

type TransactionResponse = {
  id: number;
  reference: string;
  data: TransactionDto;
};

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  private transactions: Map<string, TransactionResponse> = new Map();
  private lastTransactionId: number = 0;

  constructor(
    private readonly loadBalancerService: LoadBalancerService,
    private readonly httpService: HttpService,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  // We process the transaction by sending it to the next switch,
  // we make the transaction idempotent by utilising a UUID as the transactionId
  // we check for existing transaction by transactionId and check it's status
  // if the transaction is already completed, we return the transaction details
  // if the transaction is not completed, we send it to the next switch
  // we save the transaction details to our database and return the transaction details to the client
  // we will use an in-memory MAP to simulate idempotency
  async createTransaction(transactionId: string, data: TransactionDto) {
    if (this.transactions.has(transactionId)) {
      this.logger.log(`Transaction ${transactionId} is already processed.`);
      return this.transactions.get(transactionId);
    }

    const normalId = ++this.lastTransactionId;
    this.transactions.set(transactionId, {
      id: normalId,
      reference: transactionId,
      data,
    });

    try {
      const nextSwitchUrl = this.loadBalancerService.getNextHealthySwitch();
      this.logger.log(
        `Routing transaction ${transactionId} to ${nextSwitchUrl}`,
      );

      // Simulate sending transaction to endpoint
      // and getting response. We save the transaction to our
      // DB for record keeping

      // const response = await this.httpService.axiosRef.post(
      //   `https://${nextSwitchUrl}/process-transaction`, //
      //   data,
      // );
      // const transactionData = response.data;

      // const transactionEntity = this.transactionRepository.create({
      //   ...transactionData,
      //   reference: transactionId,
      // });
      // const savedTransaction =
      //   await this.transactionRepository.save(transactionEntity);

      data.status = TransactionStatus.COMPLETED;
      this.logger.log(`Transaction ${transactionId} completed successfully.`);
    } catch (error) {
      data.status = TransactionStatus.FAILED;
      this.logger.error(`Transaction ${transactionId} failed.`);
      throw error;
    } finally {
      this.transactions.set(transactionId, {
        id: normalId,
        reference: transactionId,
        data,
      });
    }

    return { id: normalId, reference: transactionId, data };
  }
}
