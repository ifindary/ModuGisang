import { IsNotEmpty, IsNumber, IsEmail } from 'class-validator';

export class SendInvitationDto {
  @IsNotEmpty()
  @IsNumber()
  challengeId: number; // challengeId

  @IsNotEmpty()
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  mateEmail: string;
}
