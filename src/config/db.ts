import { Client, ClientConfig } from 'pg';

const pgClientConfig: ClientConfig = {
  connectionString: 'postgres://postgres:test@localhost:5433/Database',
};

const pgClient: Client = new Client(pgClientConfig);

export default pgClient;
