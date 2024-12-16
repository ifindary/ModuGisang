import { Challenges } from 'src/challenges/challenges.entity';
import { Users } from 'src/users/entities/users.entity';
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Invitations {
  @PrimaryColumn({ name: 'challenge_id' })
  challengeId: number;

  @PrimaryColumn({ name: 'guest_id' })
  guestId: number;

  @ManyToOne(() => Challenges, (challenge) => challenge.invitations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'challenge_id' })
  challenge: Challenges;

  @ManyToOne(() => Users, (user) => user.invitations)
  @JoinColumn({ name: 'guest_id' })
  guest: Users;

  @Column({ name: 'is_expired' })
  isExpired: boolean;

  @Column({ name: 'send_date' })
  sendDate: Date;

  @Column({ name: 'response_date', nullable: true })
  responseDate: Date;
}
