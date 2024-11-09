import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  MaxLength,
  IsOptional,
  ValidateNested,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { TransactionStatus } from '../types';

export class TransactionDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  sourceAccountNumber: string;

  @IsNotEmpty()
  @IsString()
  sourceBankCode: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  destinationAccountNumber: string;

  @IsNotEmpty()
  @IsString()
  destinationBankCode: string;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return Number(value.replace(/,/g, ''));
    } else if (typeof value === 'number') {
      return value;
    }
  })
  amount: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  narration: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus = TransactionStatus.PENDING;
}

export class ProcessTransactionDto {
  @IsNotEmpty()
  @IsUUID()
  transactionId: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => TransactionDto)
  data: TransactionDto;
}
