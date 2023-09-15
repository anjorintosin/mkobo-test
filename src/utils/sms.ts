import { Client } from 'pg';

/**
 * Checks if a phone number is available for a specific user account.
 * @param {string} username - The username of the user account.
 * @param {string} to - The phone number to check availability for.
 * @param {Client} pgClient - The PostgreSQL database client.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the phone number is available.
 * @throws {Error} - Throws an error if there's an issue with the database query.
 */
export async function isPhoneNumberAvaliable(username: string, to: string, pgClient: Client): Promise<boolean> {
  try {    
    const result = await pgClient.query('SELECT id FROM phone_number WHERE number = $1 AND account_id = (SELECT id FROM account WHERE username = $2)', [to, username]);    

    if (result.rowCount >= 1) {      
      return true;
    } 
    return false;
  } catch (error) {
    throw error;
  }
}

