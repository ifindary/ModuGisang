import { IsNotEmpty, IsDate, IsNumber, IsEmail } from 'class-validator';

// 적절한 enum 타입 정의, 예시로 몇 가지 값을 추가함
export enum Duration {
  ONE_WEEK = 7,
  ONE_MONTH = 30,
  THREE_MONTHS = 100,
}

export class SendInvitationDto {
  @IsNotEmpty()
  @IsNumber()
  challengeId: number; // challengeId

  @IsNotEmpty()
  @IsEmail()
  mateEmail: string;
}
