import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OpenviduModule } from './openvidu/openvidu.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

import { ChallengesModule } from './challenges/challenges.module';
import { InvitationsModule } from './invitations/invitations.module';
import { AttendanceModule } from './attendance/attendance.module';
import { RedisAppModule } from './redis-cache/redis-cache.module';
import { DatabaseModule } from './database/database.module';
import { EmailModule } from './email/email.module';
import { InGameModule } from './in-game/in-game.module';
import { GameStatusModule } from './game-status/game-status.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './common/Interceptors/logging.interceptor';
import { HealthCheckModule } from './health-check/health-check.module';
import { HealthCheckAuthMiddleware } from './health-check/health-check.middleware';
import { UsersScheduler } from './users/users-scheduler';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    OpenviduModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'development'
          ? '.env.development'
          : '.env.production',
      //ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    ScheduleModule.forRoot(),
    EmailModule,
    RedisAppModule,
    DatabaseModule,
    UserModule,
    AuthModule,
    ChallengesModule,
    InvitationsModule,
    AttendanceModule,
    DatabaseModule,
    EmailModule,
    InGameModule,
    GameStatusModule,
    HealthCheckModule,
  ],
  controllers: [AppController],
  providers: [
    UsersScheduler,
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HealthCheckAuthMiddleware).forRoutes('health-check');
  }
}
