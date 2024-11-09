import { DataSource, Repository } from 'typeorm';
import { TransactionEntity } from '../entities/transaction.entities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionRepository extends Repository<TransactionEntity> {
  constructor(private datasource: DataSource) {
    super(TransactionEntity, datasource.createEntityManager());
  }
}
