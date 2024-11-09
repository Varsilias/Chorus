import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import {
  ProcessTransactionDto,
  TransactionDto,
} from './dto/process-transaction.dto';
import { VERSION_ONE } from '../../commons/constants';

@Controller(`${VERSION_ONE}/transactions`)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('send-transaction')
  processTransaction(@Body() processTransactionDto: ProcessTransactionDto) {
    return this.transactionsService.createTransaction(
      processTransactionDto.transactionId,
      processTransactionDto.data,
    );
  }
}
