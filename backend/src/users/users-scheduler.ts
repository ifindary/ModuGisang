import { Injectable, Logger } from '@nestjs/common';
import { UserService } from './users.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UsersScheduler {
  constructor(private readonly UserService: UserService) {}
  private readonly logger = new Logger(UsersScheduler.name);

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkDeletedUser() {
    this.logger.log('30일 지난 삭제된 계정을 정리하는 작업 시작');
  }
}
