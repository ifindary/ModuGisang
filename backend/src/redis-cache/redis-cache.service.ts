import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheService {
  private client;
  constructor(@InjectRedis() private readonly redis: Redis) {}
  async get(key: string): Promise<string> {
    return await this.redis.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    await this.redis.set(key, value, 'EX', ttl ?? 100000);
  }

  async lastVisitedTimeGet(key: string): Promise<string> {
    const savedTime = await this.redis.get(key);
    if (savedTime) {
      return `saved time: ${savedTime}`;
    }
    const currentTime = new Date().getTime();
    await this.redis.set(key, currentTime);
    return `current time: ${currentTime}`;
  }

  async expire(key: string, ttl: number): Promise<number> {
    return await this.redis.expire(key, ttl);
  }
  async del(key: string): Promise<number> {
    return await this.redis.del(key);
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    return await this.redis.zadd(key, score, member);
  }

  async zrevrange(
    groupKey: string,
    start: number,
    stop: number,
  ): Promise<string[]> {
    return await this.redis.zrevrange(groupKey, start, stop, 'WITHSCORES');
  }
}
export default RedisCacheService;
