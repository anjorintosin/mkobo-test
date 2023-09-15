import * as yup from 'yup';
import { Request, Response } from 'express';
import pgClient from '../config/db';
import redisClient from '../config/redis';
import { isPhoneNumberAvaliable } from '../utils/sms';

// Define the shape of the request for inbound SMS processing
interface InboundRequest extends Request {
  username: string;
}

// Define the shape of the request for outbound SMS processing
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
  // Define a schema to validate the request body
  const schema = yup.object().shape({
    from: yup.string().min(6).max(16).required(),
    to: yup.string().min(6).max(16).required(),
    text: yup.string().min(1).max(120).required(),
  });

  try {
    // Validate the request body against the schema
    await schema.validate(req.body);

    const toExists = await isPhoneNumberAvaliable(req.username, req.body.to, pgClient);

    if (!toExists) {
      return res.status(400).json({ message: '', error: 'to parameter not found' });
    }

    // Check if the text includes a "STOP" request and block it if necessary
    if (req.body.text.includes('STOP')) {
      redisClient.setex(`stop:${req.body.from}:${req.body.to}`, 4 * 60 * 60, '1');
    }

    res.status(200).json({ message: 'inbound sms ok', error: '' });
  } catch (error: any) {
    res.status(400).json({ message: '', error: error.message });
  }
};

/**
 * Process outbound SMS requests.
 * @param {OutboundRequest} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
const processOutbound = async (req: OutboundRequest, res: Response) => {
  console.log(req.body)
  const schema = yup.object().shape({
    from: yup.string().min(6).max(16).required(),
    to: yup.string().min(6).max(16).required(),
    text: yup.string().min(1).max(120).required(),
  });

  try {
    await schema.validate(req.body);
    const fromExist = await isPhoneNumberAvaliable(req.username, req.body.from, pgClient);

    if (!fromExist) {
      return res.status(400).json({ message: '', error: 'from parameter not found' });
    }

    redisClient.get(`stop:${req.body.from}:${req.body.to}`, (err, reply) => {
      if (err) {
        return res.status(500).json({ message: '', error: 'unknown failure' });
      } else if (reply) {
        return res.status(400).json({ message: '', error: `sms from ${req.body.from} to ${req.body.to} blocked by STOP request` });
      } else {
        redisClient.incr(`limit:${req.body.from}`, (err, count) => {
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
      }
    });
  } catch (error: any) {
    return res.status(400).json({ message: '', error: error.message });
  }
};

export { processInbound, processOutbound };
