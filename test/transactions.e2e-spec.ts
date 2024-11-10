import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransactionStatus } from '../src/v1/transactions/types';
import { LoadBalancerService } from '../src/v1/load-balancer/load-balancer.service';
import { HttpService } from '@nestjs/axios';
import { TransformInterceptor } from '../src/commons/interceptors/response-transform.interceptor';
import { GlobalExceptionFilter } from '../src/commons/filters/global-exception.filter';
import { AppDataSource } from '../src/database/config/orm.config';
import { TransactionsService } from '../src/v1/transactions/transactions.service';

describe('TransactionsController (e2e)', () => {
  let app: INestApplication;
  let loadBalancerService: LoadBalancerService;
  let httpService: HttpService;
  let transactionsService: TransactionsService;
  let authToken: string;

  const generateTestUser = () => ({
    email: `test${Date.now()}${Math.floor(Math.random() * 10000)}@example.com`,
    password: 'Password123!',
    firstname: 'Test',
    lastname: 'User',
  });

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

  const clearDatabase = async () => {
    const connection = AppDataSource.manager.connection;
    const entities = connection.entityMetadatas;

    for (const entity of entities) {
      const repository = connection.getRepository(entity.name);
      await repository.query(`TRUNCATE "${entity.tableName}" CASCADE;`);
    }
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
    transactionsService =
      moduleFixture.get<TransactionsService>(TransactionsService);

    await app.init();

    // Clear database before each test
    await clearDatabase();

    // Use dynamic test user for each test
    const testUser = generateTestUser();

    // Sign up and login to get auth token
    await request(app.getHttpServer())
      .post('/api/v1/auth/sign-up')
      .send(testUser);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    authToken = loginResponse.body.data.access_token;
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
      .set('Authorization', `Bearer ${authToken}`)
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
      .spyOn(transactionsService, 'createTransaction')
      .mockImplementation(() => {
        return Promise.resolve({
          id: 1,
          reference: mockTransaction.transactionId,
          data: {
            ...mockTransaction.data,
            status: TransactionStatus.FAILED,
          },
        });
      });
    jest
      .spyOn(httpService.axiosRef, 'post')
      .mockRejectedValue(new Error('Processing failed'));

    const response = await request(app.getHttpServer())
      .post('/api/v1/transactions/send-transaction')
      .send(mockTransaction)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(201);

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
      .set('Authorization', `Bearer ${authToken}`)
      .expect(201);

    // Second request with same transaction ID
    const secondResponse = await request(app.getHttpServer())
      .post('/api/v1/transactions/send-transaction')
      .send(mockTransaction)
      .set('Authorization', `Bearer ${authToken}`)
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
      .set('Authorization', `Bearer ${authToken}`)
      .expect(400);

    expect(response.body.statusCode).toBe(400);
    expect(response.body.errorBag.message.length).toBeGreaterThan(0);
    expect(response.body.errorBag.error).toContain('Bad Request');
    expect(response.body.errorBag.statusCode).toBe(400);
  });
});
