import IORedis, { Redis } from 'ioredis';

const redisClient: Redis = new IORedis();

redisClient.on('error', (err: Error) => {
  console.error('Redis client error:', err);
});

export default redisClient;
