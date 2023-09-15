import { checkFromParameter } from '../../src/utils/sms';
import pgClient from "../../src/config/db";

describe('Testing checkIfToExists function', () => {

  beforeEach(() => {
    // Clear mock function calls before each test
    jest.clearAllMocks();
  });

  /**
   * Test Case: Should return true if phone number is found in the database
   * It spies on the 'query' method of the PostgreSQL client to mock a successful database query.
   * Expects the utility function to return true.
   */
  it('should return true if phone number is found in the database', async () => {
    jest.spyOn(pgClient, 'query').mockResolvedValueOnce({ rowCount: 1 } as never);
    const result = await checkFromParameter('mockedUsername', 'mockedPhoneNumber', pgClient);

    expect(result).toBe(true);
  });

  /**
   * Test Case: Should return false if phone number is not found in the database
   * It spies on the 'query' method of the PostgreSQL client to mock an empty database query result.
   * Expects the utility function to return false.
   */
  it('should return false if phone number is not found in the database', async () => {
    jest.spyOn(pgClient, 'query').mockResolvedValueOnce({ rowCount: 0 } as never);
    const result = await checkFromParameter('mockedUsername', 'mockedPhoneNumber', pgClient);

    expect(result).toBe(false);
  });

});
