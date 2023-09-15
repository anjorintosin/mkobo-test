import { Client } from 'pg';

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

