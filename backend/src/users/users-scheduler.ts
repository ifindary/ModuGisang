import { Injectable, Logger } from '@nestjs/common';
import { UserService } from './users.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment-timezone';

@Injectable()
export class UsersScheduler {
  constructor(private readonly userService: UserService) {}

  private readonly logger = new Logger(UsersScheduler.name);

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkDeletedUser() {
    this.logger.log('30일 지난 삭제된 계정을 정리하는 작업 시작');

    // 현재 날짜 기준으로 30일 이전 날짜 계산
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.userService.deleteUsers(thirtyDaysAgo);

    this.logger.log(`삭제된 계정 수: ${result.affected}`);
  }
}
