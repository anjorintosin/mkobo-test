const request = require('supertest');
const expressTest = require('express');
const { createServer } = require('http');
const { Pool } = require('pg');
const smsRouter = require('../../src/routes/sms');
const redisClient = require('../../src/config/redis');

// Mock your database connection (pgClient)
const pgClientMock = new Pool();
jest.mock('../../src/config/db', () => ({
  connect: () => pgClientMock,
  query: () => ({ rowCount: 1 }), // Mock query result
}));

// Mock Redis methods
const app = expressTest();
app.use(expressTest.json());
app.use('/api', smsRouter);

describe('SMS Routes', () => {
  let server: any;

  beforeAll(() => {
    server = createServer(app);
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    // Clear mock function calls before each test
    jest.clearAllMocks();
  });

  it('should process inbound SMS with valid input', async () => {
    const requestBody = {
      from: '91983435345',
      to: '14152243533',
      text: 'Hello World',
    };

    const authorizationHeader = 'Basic YXpyMToyMFMwS1BOT0lN'; // Replace with valid credentials

    const response = await request(server)
      .post('/api/inbound/sms')
      .send(requestBody)
      .set('Authorization', authorizationHeader);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'inbound sms ok', error: '' });
  });

  it('should process outbound SMS with valid input', async () => {
    const requestBody = {
      from: '919823243432',
      to: '919343542749',
      text: 'hello from India',
    };

    const authorizationHeader = 'Basic YXpyMToyMFMwS1BOT0lN';

    const response = await request(server)
      .post('/api/outbound/sms')
      .send(requestBody)
      .set('Authorization', authorizationHeader);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'outbound sms ok', error: '' });
  });

  it('should return error if from datatype is not string', async () => {
    const requestBody = {
      from: '919823243432',
      to: 91,
      text: 'hello from India',
    };

    const authorizationHeader = 'Basic YXpyMToyMFMwS1BOT0lN';

    const response = await request(server)
      .post('/api/outbound/sms')
      .send(requestBody)
      .set('Authorization', authorizationHeader);

    expect(response.status).toBe(400);
  });

});
