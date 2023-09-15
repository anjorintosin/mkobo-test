import { isPhoneNumberAvaliable } from '../../src/utils/sms';
import pgClient from "../../src/config/db";


describe('Testing checkIfToExists function', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if check if found in the db', async () => {
      jest.spyOn(pgClient, 'query').mockResolvedValueOnce({rowCount: 1} as never);
      const result = await isPhoneNumberAvaliable('mockedUsername', 'mockedPhoneNumber', pgClient);

      expect(result).toBe(true);
  });
 

  it('should return false if check if found', async () => {
      jest.spyOn(pgClient, 'query').mockResolvedValueOnce({rowCount: 0} as never);
      const result = await isPhoneNumberAvaliable('mockedUsername', 'mockedPhoneNumber', pgClient);
  
      expect(result).toBe(false);
  });

});

