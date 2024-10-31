import { Injectable } from '@nestjs/common';
import RedisCacheService from 'src/redis-cache/redis-cache.service';
import { ScoreDto } from './dto/score.dto';
import { AttendanceService } from 'src/attendance/attendance.service';
import { UserService } from 'src/users/users.service';
import { ChallengesService } from 'src/challenges/challenges.service';
const EXPIRE_TIME = 900; // redis key 만료 시간
@Injectable()
export class InGameService {
  constructor(
    private redisService: RedisCacheService,
    private attendanceService: AttendanceService,
    private userService: UserService,
    private challengeService: ChallengesService,
  ) {}
  async recordEntryTime(userId: number): Promise<boolean> {
    const timestamp = Date.now().toString();
    const result = await this.redisService.set(
      `entryTime:${userId}`,
      timestamp,
      EXPIRE_TIME,
    );
    console.log('@@recordEntryTime/userId', userId);
    console.log('result:', result);
    if (result === 'OK') {
      return true;
    }
    return false;
  }

  async submitScore(scoreDto: ScoreDto): Promise<boolean> {
    const { userId, userName, score, challengeId } = scoreDto;
    console.log(
      '@@submitScore/userId,userName,score,challengeId',
      userId,
      userName,
      score,
      challengeId,
    );
    try {
      const entryTime = await this.redisService.get(`entryTime:${userId}`);
      console.log('@@@@entryTime:', entryTime);
      if (!entryTime) {
        console.error(`Entry time:${userId} not found`);
        return false;
      }
      const currentTime = Date.now();
      const timeScore = currentTime - parseInt(entryTime, 10);
      const redisScore = parseFloat(`${score}.${timeScore}`);

      // 점수와 입장 시간을 기반으로 추가 로직 처리
      await this.redisService.zadd(
        `challengeId:${challengeId}`,
        redisScore,
        `${userId}:${userName}`,
      );
      // DB 저장을 비동기적으로 수행
      this.redisService.del(`userInfo:${userId}`); // 캐시 내 정보 수정시 캐시 삭제
      this.retryOperation(() => this.userService.setStreak(userId))
        .then(() => console.log('Streak Save Success'))
        .catch((e) => {
          console.error('Failed to save to Streak:', e);
        });
      this.retryOperation(() =>
        this.attendanceService.attend(scoreDto, redisScore),
      )
        .then(() => console.log('Database Save Success'))
        .catch((e) => {
          console.error('Failed to save to database:', e);
        });
      this.redisService
        .expire(`challengeId:${challengeId}`, 120)
        .then(() => console.log('expire set Success'))
        .catch((e) => {
          console.error('Failed to set expire:', e);
        });
      // if (this.challengeService.endChallenge(challengeId)) {
      // completeChallenge 자체에 시간 비교 로직 존재
      this.challengeService.completeChallenge(challengeId, userId);
      //}
      return true;
    } catch (redisError) {
      console.error('Redis save error:', redisError);
      return false; // Redis 에러 시 false 반환
    }
  }

  async getGameResults(challengeId): Promise<any> {
    // 랭킹 데이터 조회
    const datalist = await this.redisService.zrevrange(
      `challengeId:${challengeId}`,
      0,
      -1,
    );
    return this.arrayToObject(datalist);
  }

  arrayToObject(array) {
    let results = [];
    for (let i = 0; i < array.length; i += 2) {
      const [userId, userName] = array[i].split(':');
      results.push({
        userId: parseInt(userId, 10),
        userName: userName,
        score: parseInt(array[i + 1], 10),
      });
    }
    return results;
  }

  async retryOperation(operation, retries = 3) {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying operation, attempts left: ${retries}`);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 대기
        return this.retryOperation(operation, retries - 1);
      }
      throw error; // 모든 재시도 실패 후 에러를 throw
    }
  }
}
