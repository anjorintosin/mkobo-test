import { Client } from 'pg';
import * as yup from 'yup';
import pgClient from '../config/db';
import redisClient from '../config/redis';

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

/**
 * Validates the request body against a schema.
 * @param {any} req - The Express request object.
 * @returns {Promise<void>} - A promise that resolves when validation is complete.
 */
export const validateRequest = async (req: any) => {
  const schema = yup.object().shape({
    from: yup.string().min(6).max(16).required(),
    to: yup.string().min(6).max(16).required(),
    text: yup.string().min(1).max(120).required(),
  });

  await schema.validate(req.body);
};

/**
 * Checks if the 'from' parameter exists in the database.
 * @param {string} username - The username.
 * @param {string} from - The 'from' parameter.
 * @param {any} pgClient - The PostgreSQL database client.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether 'from' exists.
 */
export const checkFromParameter = async (username: string, from: string, pgClient: any) => {
  try {
    const result = await pgClient.query('SELECT id FROM phone_number WHERE number = $1 AND account_id = (SELECT id FROM account WHERE username = $2)', [from, username]);
    return result.rowCount >= 1;
  } catch (error) {
    throw error;
  }
};

/**
 * Checks if the message is blocked by a STOP request and performs further checks.
 * @param {any} req - The Express request object.
 * @param {any} res - The Express response object.
 * @param {any} redisClient - The Redis client.
 * @param {Function} checkRequestLimit - The function for checking request limits.
 */
export const checkStopRequest = (req: any, res: any, redisClient: any, checkRequestLimit: Function) => {
  redisClient.get(`stop:${req.body.from}:${req.body.to}`, (err: any, reply: any) => {
    if (err) {
      return res.status(500).json({ message: '', error: 'unknown failure' });
    } else if (reply) {
      return res.status(400).json({ message: '', error: `sms from ${req.body.from} to ${req.body.to} blocked by STOP request` });
    } else {
      checkRequestLimit(req, res, redisClient);
    }
  });
};

/**
 * Checks the request limit and handles expiration.
 * @param {any} req - The Express request object.
 * @param {any} res - The Express response object.
 * @param {any} redisClient - The Redis client.
 */
export const checkRequestLimit = (req: any, res: any, redisClient: any) => {
  redisClient.incr(`limit:${req.body.from}`, (err: any, count: any) => {
    if (err) {
      return res.status(500).json({ message: '', error: 'unknown failure' });
    } else if (count !== undefined && count > 50) {
      return res.status(400).json({ message: '', error: `limit reached for from ${req.body.from}` });
    } else {
      if (count !== undefined) {
        redisClient.expire(`limit:${req.body.from}`, 24 * 60 * 60);
      }
      return res.status(200).json({ message: 'outbound sms ok', error: '' });
    }
  });
};
