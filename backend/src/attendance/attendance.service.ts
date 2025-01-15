import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Attendance } from './attendance.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ScoreDto } from 'src/in-game/dto/score.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attandanceRepository: Repository<Attendance>,
  ) {
    this.attandanceRepository = attandanceRepository;
  }

  async attend(scoreDto: ScoreDto, redisScore: number) {
    try {
      const date = new Date();
      const attendance = new Attendance();
      attendance.userId = scoreDto.userId;
      attendance.challengeId = scoreDto.challengeId;
      attendance.score = redisScore;
      attendance.date = date;
      await this.attandanceRepository.save(attendance);
    } catch (e) {
      throw new InternalServerErrorException(
        '서버 오류로 인해 챌린지 참여에 실패하였습니다.',
      );
    }
  }
}
