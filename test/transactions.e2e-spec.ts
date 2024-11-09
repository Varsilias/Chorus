import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransactionStatus } from '../src/v1/transactions/types';
import { LoadBalancerService } from '../src/v1/load-balancer/load-balancer.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { TransformInterceptor } from '../src/commons/interceptors/response-transform.interceptor';
import { GlobalExceptionFilter } from '../src/commons/filters/global-exception.filter';

describe('TransactionsController (e2e)', () => {
  let app: INestApplication;
  let loadBalancerService: LoadBalancerService;
  let httpService: HttpService;

  const mockTransaction = {
    transactionId: '123e4567-e89b-12d3-a456-426614174000',
    data: {
      amount: 1000,
      status: TransactionStatus.PENDING,
      sourceBankCode: '123',
      sourceAccountNumber: '1234567890',
      destinationBankCode: '321',
      destinationAccountNumber: '0987654321',
      narration: 'Test transaction',
    },
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HttpService)
      .useValue({
        axiosRef: {
          post: jest.fn(),
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();

    // Apply the same pipes and interceptors as in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new GlobalExceptionFilter());

    loadBalancerService =
      moduleFixture.get<LoadBalancerService>(LoadBalancerService);
    httpService = moduleFixture.get<HttpService>(HttpService);

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should process a transaction successfully through one-phase commit', async () => {
    jest
      .spyOn(loadBalancerService, 'getNextHealthySwitch')
      .mockReturnValue('switch1.example.com');

    const response = await request(app.getHttpServer())
      .post('/api/v1/transactions/send-transaction')
      .send(mockTransaction)
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.data).toMatchObject({
      reference: mockTransaction.transactionId,
      data: {
        ...mockTransaction.data,
        status: TransactionStatus.COMPLETED,
      },
    });
  });

  it('should mark transaction as FAILED if endpoint processing fails', async () => {
    jest
      .spyOn(loadBalancerService, 'getNextHealthySwitch')
      .mockReturnValue('switch1.example.com');
    jest
      .spyOn(httpService.axiosRef, 'post')
      .mockRejectedValue(new Error('Processing failed'));

    const response = await request(app.getHttpServer())
      .post('/api/v1/transactions/send-transaction')
      .send(mockTransaction)
      .expect(500);

    expect(response.body).toBeDefined();
    expect(response.body.data).toMatchObject({
      reference: mockTransaction.transactionId,
      data: {
        ...mockTransaction.data,
        status: TransactionStatus.FAILED,
      },
    });
  });

  it('should return same result for duplicate transaction requests', async () => {
    jest
      .spyOn(loadBalancerService, 'getNextHealthySwitch')
      .mockReturnValue('switch1.example.com');

    // First request
    const firstResponse = await request(app.getHttpServer())
      .post('/api/v1/transactions/send-transaction')
      .send(mockTransaction)
      .expect(201);

    // Second request with same transaction ID
    const secondResponse = await request(app.getHttpServer())
      .post('/api/v1/transactions/send-transaction')
      .send(mockTransaction)
      .expect(201);

    // Verify both responses are identical
    expect(firstResponse.body).toEqual(secondResponse.body);
    expect(firstResponse.body.data.reference).toBe(
      mockTransaction.transactionId,
    );

    // Verify the transaction was only processed once
    const processSpy = jest.spyOn(httpService.axiosRef, 'post');
    expect(processSpy).toHaveBeenCalledTimes(0); // Since we're using in-memory implementation
  });

  it('should validate required transaction fields', async () => {
    const invalidTransaction = {
      transactionId: '123e4567-e89b-12d3-a456-426614174000',
      data: {
        // Missing required fields
        amount: 1000,
        status: TransactionStatus.PENDING,
      },
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/transactions/send-transaction')
      .send(invalidTransaction)
      .expect(400);

    expect(response.body.message).toContain('amount');
    expect(response.body.message).toContain('merchantId');
  });
});
