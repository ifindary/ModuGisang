import { Module } from '@nestjs/common';
import { HealthCheckController } from './health-check.controller';
import { TerminusModule } from '@nestjs/terminus';
import { RedisHealthIndicator } from './indicator/redis-health-indicator';
import { TimeHealthIndicator } from './indicator/time-health-indicator';
import { TerminusLogger } from './terminus-logger.service';

@Module({
  imports: [
    TerminusModule.forRoot({
      logger: TerminusLogger,
      errorLogStyle: 'pretty',
    }),
  ],
  controllers: [HealthCheckController],
  providers: [RedisHealthIndicator, TimeHealthIndicator],
})
export class HealthCheckModule {}
