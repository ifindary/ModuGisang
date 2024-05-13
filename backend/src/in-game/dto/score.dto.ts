import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ScoreDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  challengeId: number;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsNumber()
  @IsNotEmpty()
  score: number;
}
