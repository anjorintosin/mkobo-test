/**
 * Sets up an Express server with middleware and routes for handling SMS-related requests.
 * @module Server
 */

import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import pgClient from './config/db';
import * as dotenv from 'dotenv';
import { smsRouter } from './routes';

interface CustomRequest extends Request {
    username?: string;
    authId?: string;
}

dotenv.config();
const app = express();
const port = process.env.PORT || 3000
console.log()

pgClient.connect();

app.use(bodyParser.json());

app.use(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;

    if (!auth) {
        res.status(403).json({ message: '', error: 'Basic Authentication required' });
    } else {
        const [username, authId] = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');

        const result = await pgClient.query('SELECT id FROM account WHERE username = $1 AND auth_id = $2', [username, authId]);

        if (result.rowCount === 1) {
            req.username = username;
            req.authId = authId;
            next();
        } else {
            res.status(403).json({ message: '', error: 'Basic Authentication required' });
        }
    }
});

app.use('/', smsRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(405).json({ message: '', error: 'Method Not Allowed' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
