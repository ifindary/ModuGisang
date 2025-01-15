import { Module } from '@nestjs/common';
import { InGameService } from './in-game.service';
import { InGameController } from './in-game.controller';
import { RedisAppModule } from 'src/redis-cache/redis-cache.module';
import { AttendanceModule } from 'src/attendance/attendance.module';
import { UserModule } from 'src/users/users.module';
import { ChallengesModule } from 'src/challenges/challenges.module';

@Module({
  imports: [RedisAppModule, AttendanceModule, UserModule, ChallengesModule],
  controllers: [InGameController],
  providers: [InGameService],
})
export class InGameModule {}
