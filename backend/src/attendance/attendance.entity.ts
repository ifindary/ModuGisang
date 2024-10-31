import { Challenges } from 'src/challenges/challenges.entity';
import { Users } from 'src/users/entities/users.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Attendance {
  // @PrimaryGeneratedColumn()
  // _id: number;

  @ManyToOne(() => Users, (user) => user.attendances, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' }) // 추가
  user: Users;

  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => Challenges, (challenge) => challenge.attendances)
  @JoinColumn({ name: 'challenge_id' }) // 추가
  challenge: Challenges;

  @PrimaryColumn({ name: 'challenge_id' })
  challengeId: number;

  @PrimaryColumn({ type: 'date' })
  date: Date;

  @Column({ type: 'float', default: 0 })
  score: number;
}
