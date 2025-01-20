import { IsNotEmpty, IsNumber, IsEmail } from 'class-validator';

export class SendInvitationDto {
  @IsNotEmpty()
  @IsNumber()
  challengeId: number; // challengeId

  @IsNotEmpty()
  @IsEmail()
  mateEmail: string;
}
