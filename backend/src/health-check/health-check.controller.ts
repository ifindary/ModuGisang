import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  DiskHealthIndicator,
  MemoryHealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from '../redis-cache/redis-health-indicator';

@Controller('health-check')
export class HealthCheckController {
  constructor(
    private healthcheck: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: RedisHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.healthcheck.check([
      //() => this.healthcheck.pingCheck('ping', 'https://google.com'),
      //() => this.healthcheck.tcpCheck('tcp', 'localhost',
      async () => this.db.pingCheck('database', { timeout: 300 }), // 300ms 안 성공
      async () => this.redis.isHealthy('redis'),
      async (): Promise<HealthIndicatorResult> =>
        process.platform !== 'win32'
          ? this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.5 })
          : Promise.resolve({ disk: { status: 'up' } }),
      // 50% 이상 사용 시 경고
      // 고정된 양의 공간도 확인 가능 threshold: 250 * 1024 * 1024 * 1024 -> 250GB를 초과하는 경우
      async () => this.memory.checkHeap('memory_heap', 1 * 1024 * 1024 * 1024), // 1.0GB(1,024MB) 이상 사용 시 경고 50% 이하로 유지
      async () => this.memory.checkRSS('memory_rss', 1.6 * 1024 * 1024 * 1024), // 1.6GB(1,638MB) 이상 사용 시 경고 80% 이하로 유지
    ]);
  }
}
