import { Client, ClientConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pgClientConfig: ClientConfig = {
  connectionString: 
  `postgres://${process.env.POSTGRES_USERNAME}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB_NAME}`,
};

const pgClient: Client = new Client(pgClientConfig);

export default pgClient;
