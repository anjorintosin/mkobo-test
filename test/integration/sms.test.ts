/**
 * SMS Routes Test Suite
 *
 * This test suite covers the endpoints of the SMS Gateway API for processing inbound and outbound SMS messages.
 * It uses the Supertest library to make HTTP requests to the server and Jest for assertions.
 * Ensure that the server is running before executing these tests.
 */

const request = require('supertest');
const expressTest = require('express');
const { createServer } = require('http');
const { Pool } = require('pg');
const smsRouter = require('../../src/routes/sms');
const redisClient = require('../../src/config/redis');

// Mock the PostgreSQL client to prevent actual database queries during testing
const pgClientMock = new Pool();
jest.mock('../../src/config/db', () => ({
  connect: () => pgClientMock,
  query: () => ({ rowCount: 1 }), 
}));

// Create an Express application for testing
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

  /**
   * Test Case: Should process inbound SMS with valid input
   * It sends an HTTP POST request to the '/api/inbound/sms' endpoint with valid input data.
   * Expects a 200 status code and a response matching { message: 'inbound sms ok', error: '' }.
   */
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

  /**
   * Test Case: Should process outbound SMS with valid input
   * It sends an HTTP POST request to the '/api/outbound/sms' endpoint with valid input data.
   * Expects a 200 status code and a response matching { message: 'outbound sms ok', error: '' }.
   */
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

  /**
   * Test Case: Should return error if 'to' datatype is not string
   * It sends an HTTP POST request to the '/api/outbound/sms' endpoint with 'to' as a non-string value.
   * Expects a 400 status code indicating a bad request.
   */
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
