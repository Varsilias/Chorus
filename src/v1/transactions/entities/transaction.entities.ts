import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../commons/entities/base.entity';

@Entity({ name: 'transactions' })
export class TransactionEntity extends BaseEntity<TransactionEntity> {
  @Column({ type: 'jsonb' })
  metadata: any;

  @Column({ type: 'varchar' })
  reference: string;

  @Column({ type: 'varchar', length: 10 })
  sourceAccountNumber: string;

  @Column({ type: 'varchar' })
  sourceBankCode: string;

  @Column({ type: 'varchar', length: 10 })
  destinationAccountNumber: string;

  @Column({ type: 'varchar' })
  destinationBankCode: string;

  @Column({ type: 'varchar' })
  amount: number;

  @Column({ type: 'varchar' })
  narration: string;

  @Column({ type: 'varchar', nullable: true })
  category?: string;
}
