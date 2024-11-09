import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { LoadBalancerService } from '../load-balancer/load-balancer.service';
import { HttpService } from '@nestjs/axios';
import { TransactionRepository } from './repository/transaction.repository';

describe('TransactionsService', () => {
  let transactionsService: TransactionsService;
  let loadBalancerService: LoadBalancerService;
  let httpService: HttpService;
  let transactionRepository: TransactionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: LoadBalancerService,
          useValue: {
            getNextHealthySwitch: jest
              .fn()
              .mockReturnValue('https://endpoint1.com'),
          },
        },
        {
          provide: HttpService,
          useValue: {
            axiosRef: {
              post: jest
                .fn()
                .mockResolvedValue({ data: { status: 'COMPLETED' } }),
            },
          },
        },
        {
          provide: TransactionRepository,
          useValue: {},
        },
      ],
    }).compile();

    transactionsService = module.get<TransactionsService>(TransactionsService);
    loadBalancerService = module.get<LoadBalancerService>(LoadBalancerService);
    httpService = module.get<HttpService>(HttpService);
    transactionRepository = module.get<TransactionRepository>(
      TransactionRepository,
    );
  });

  it('should process a transaction successfully', async () => {
    const transactionId = 'unique-id-123';
    const data = {
      amount: 100,
      sourceAccountNumber: '1234567890',
      sourceBankCode: '123',
      destinationAccountNumber: '0987654321',
      destinationBankCode: '456',
      narration: 'Test transaction',
    };

    const result = await transactionsService.createTransaction(
      transactionId,
      data,
    );

    expect(result).toBeDefined();
    expect(result.data.status).toBe('COMPLETED');
    expect(transactionsService['transactions'].get(transactionId)).toEqual(
      result,
    );
  });

  it('should return the same result if a duplicate transaction is processed', async () => {
    const transactionId = 'unique-id-123';
    const data = {
      amount: 100,
      sourceAccountNumber: '1234567890',
      sourceBankCode: '123',
      destinationAccountNumber: '0987654321',
      destinationBankCode: '456',
      narration: 'Test transaction',
    };
    // Process the transaction once
    const firstResult = await transactionsService.createTransaction(
      transactionId,
      data,
    );

    // Attempt to process the same transaction ID again
    const secondResult = await transactionsService.createTransaction(
      transactionId,
      data,
    );

    // Verify that the result is the same for duplicate requests
    expect(secondResult).toEqual(firstResult);
    expect(transactionsService['transactions'].size).toBe(1); // Only one transaction stored
  });

  it('should mark transaction as FAILED if an error occurs', async () => {
    const transactionId = 'unique-id-error';
    const data = {
      amount: 200,
      sourceAccountNumber: '1234567890',
      sourceBankCode: '123',
      destinationAccountNumber: '0987654321',
      destinationBankCode: '456',
      narration: 'Test transaction',
    };

    jest
      .spyOn(loadBalancerService, 'getNextHealthySwitch')
      .mockImplementationOnce(() => {
        throw new Error('Simulated error');
      });

    // we could further test the error handling of the httpService and database call
    // but for now this is sufficient

    try {
      await transactionsService.createTransaction(transactionId, data);
    } catch (error) {
      expect(error).toBeDefined();
      expect(
        transactionsService['transactions'].get(transactionId).data.status,
      ).toBe('FAILED');
    }
  });
});
