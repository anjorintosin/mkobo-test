import * as yup from 'yup';
import { Request, Response } from 'express';
import pgClient from '../config/db';
import redisClient from '../config/redis';
import { isPhoneNumberAvaliable } from '../utils/sms';

interface InboundRequest extends Request {
  username: string;
}

interface OutboundRequest extends Request {
  username: string;
}

/**
 * Process inbound SMS requests.
 * @param {InboundRequest} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} - A promise that resolves when processing is complete.
 */
const processInbound = async (req: InboundRequest, res: Response) => {
  const schema = yup.object().shape({
    from: yup.string().min(6).max(16).required(),
    to: yup.string().min(6).max(16).required(),
    text: yup.string().min(1).max(120).required(),
  });

  try {
    await schema.validate(req.body);

    const toExists = await isPhoneNumberAvaliable(req.username, req.body.to, pgClient);

    if (!toExists) {
      return res.status(400).json({ message: '', error: 'to parameter not found' });
    }

    if (req.body.text.includes('STOP')) {
      redisClient.setex(`stop:${req.body.from}:${req.body.to}`, 4 * 60 * 60, '1');
    }

    res.status(200).json({ message: 'inbound sms ok', error: '' });
  } catch (error: any) {
    res.status(400).json({ message: '', error: error.message });
  }
};

/**
 * Validates the request body against a schema.
 * @param {OutboundRequest} req - The Express request object.
 * @returns {Promise<void>} - A promise that resolves when validation is complete.
 */
const validateRequest = async (req: OutboundRequest) => {
  const schema = yup.object().shape({
    from: yup.string().min(6).max(16).required(),
    to: yup.string().min(6).max(16).required(),
    text: yup.string().min(1).max(120).required(),
  });

  await schema.validate(req.body);
};

/**
 * Checks if the 'from' parameter exists in the database.
 * @param {OutboundRequest} req - The Express request object.
 * @param {any} pgClient - The PostgreSQL database client.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether 'from' exists.
 */
const checkFromParameter = async (req: OutboundRequest, pgClient: any) => {
  const fromExists = await isPhoneNumberAvaliable(req.username, req.body.from, pgClient);
  return fromExists;
};


/**
 * Checks if the message is blocked by a STOP request and performs further checks.
 * @param {OutboundRequest} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {any} redisClient - The Redis client.
 */
const checkStopRequest = (req: OutboundRequest, res: Response, redisClient: any) => {
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
 * @param {OutboundRequest} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {any} redisClient - The Redis client.
 */
const checkRequestLimit = (req: OutboundRequest, res: Response, redisClient: any) => {
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

// Main function to process outbound SMS
/**
 * Process outbound SMS requests.
 * @param {OutboundRequest} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} - A promise that resolves when processing is complete.
 */
const processOutbound = async (req: OutboundRequest, res: Response) => {
  try {
    await validateRequest(req);
    const fromExists = await checkFromParameter(req, pgClient);

    if (!fromExists) {
      return res.status(400).json({ message: '', error: 'from parameter not found' });
    }

    checkStopRequest(req, res, redisClient);
  } catch (error: any) {
    return res.status(400).json({ message: '', error: error.message });
  }
};

export { processInbound, processOutbound };
