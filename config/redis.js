const IORedis = require('ioredis');

const dotenv = require('dotenv');
dotenv.config();

const REDIS_URL = process.env.REDIS_URL || null;

let redis = null;

if (REDIS_URL) {
    redis = new IORedis(REDIS_URL);
    redis.on('connect', () => console.log('Redis connected'));
    redis.on('error', (e) => console.error('Redis error', e));
}

module.exports = redis;