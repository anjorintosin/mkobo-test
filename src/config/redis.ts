import IORedis, { Redis } from 'ioredis';

// Create a new Redis client
const redisClient: Redis = new IORedis();

redisClient.on('error', (err: Error) => {
  console.error('Redis client error:', err);
});

export default redisClient;
