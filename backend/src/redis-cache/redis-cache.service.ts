import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheService {
  private readonly logger = new Logger(RedisCacheService.name);

  private client;
  constructor(@InjectRedis() private readonly redis: Redis) {}
  async get(key: string): Promise<string> {
    const value = await this.redis.get(key);
    if (value) {
      this.logger.log(`Cache hit for key: ${key}`);
    } else {
      this.logger.log(`Cache miss for key: ${key}`);
    }
    return value;
  }

  async set(key: string, value: string, ttl?: number): Promise<string> {
    const result = await this.redis.set(key, value, 'EX', ttl ?? 100000);
    this.logger.log(`Cache set for key: ${key} with TTL: ${ttl ?? 100000}`);
    return result; // 'OK'가 반환됩니다.
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

  async zincrby(key, weightedScore, userId) {
    return await this.redis.zincrby(key, weightedScore, userId);
  }
}
export default RedisCacheService;
