import { Injectable } from '@nestjs/common';
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

  async attend(scoreDto: ScoreDto) {
    try {
      const date = new Date();
      const attendance = new Attendance();
      attendance.userId = scoreDto.userId;
      attendance.challengeId = scoreDto.challengeId;
      attendance.score = scoreDto.score;
      attendance.date = date;
      await this.attandanceRepository.save(attendance);
    } catch (e) {
      console.error('Failed to save to Attend database:', e);
    }
  }
}
