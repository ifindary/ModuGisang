import { Attendance } from 'src/attendance/attendance.entity';
import { Invitations } from 'src/invitations/invitations.entity';
import { Users } from 'src/users/entities/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['hostId']) // hostId에 대해 고유 제약 조건 설정.
export class Challenges {
  @PrimaryGeneratedColumn()
  _id: number;

  @ManyToOne(() => Users, (user) => user.hostedChallenges)
  @JoinColumn({ name: 'host_id' })
  host: Users;

  @Column({ name: 'host_id' })
  hostId: number;

  @Column({ type: 'timestamp', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'time', name: 'wake_time' })
  wakeTime: Date; // "HH:mm:ss" format

  @Column({ name: 'duration_days' })
  duration: number;

  @Column({ name: 'end_date' })
  endDate: Date;

  @Column({ name: 'completed' })
  completed: boolean;

  @Column({ name: 'deleted' })
  deleted: boolean;

  @OneToMany(() => Attendance, (attendance) => attendance.challenge, {
    cascade: true,
  })
  attendances: Attendance[];

  @OneToMany(() => Invitations, (invitation) => invitation.challenge, {
    cascade: true,
  })
  invitations: Invitations[];
}
