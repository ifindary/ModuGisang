import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import Redis from 'ioredis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  private client: Redis;

  constructor() {
    super();
    // AWS ElasticCache의 엔드포인트 및 포트 설정
    this.client = new Redis({
      host: process.env.REDIS_HOST, // ElasticCache 엔드포인트
      port: 6379, // 기본 Redis 포트
    });
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const result = await this.client.ping();
      if (result === 'PONG') {
        return this.getStatus(key, true); // 정상 상태
      }
      return this.getStatus(key, false); // 비정상 상태
    } catch (error) {
      return this.getStatus(key, false, { error: error.message }); // 에러 발생 시
    }
  }
}
