import { Request, Response } from 'express';
import pgClient from '../config/db';
import redisClient from '../config/redis';
import { validateRequest, checkFromParameter, checkStopRequest, checkRequestLimit } from '../utils/sms';

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
export const processInbound = async (req: InboundRequest, res: Response) => {
  try {
    await validateRequest(req);

    const toExists = await checkFromParameter(req.username, req.body.to, pgClient);

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
 * Process outbound SMS requests.
 * @param {OutboundRequest} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} - A promise that resolves when processing is complete.
 */
export const processOutbound = async (req: OutboundRequest, res: Response) => {
  try {
    await validateRequest(req);
    const fromExists = await checkFromParameter(req.username, req.body.from, pgClient);

    if (!fromExists) {
      return res.status(400).json({ message: '', error: 'from parameter not found' });
    }

    checkStopRequest(req, res, redisClient, checkRequestLimit);
  } catch (error: any) {
    return res.status(400).json({ message: '', error: error.message });
  }
};
