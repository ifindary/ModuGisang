import { IsEnum, IsNotEmpty, IsDate, IsNumber, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

// 적절한 enum 타입 정의, 예시로 몇 가지 값을 추가함
export enum Duration {
  ONE_WEEK = 7,
  ONE_MONTH = 30,
  THREE_MONTHS = 100,
}

export class CreateChallengeDto {
  @IsNotEmpty()
  @IsNumber()
  hostId: number; // userId, 사용자가 제공하는 ID로 가정

  @IsNotEmpty()
  @IsEnum(Duration)
  duration: Duration; // enum 타입 사용

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startDate: Date; // 시작 날짜

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  wakeTime: Date; // 기상 시간, 'time' 타입은 JavaScript에서 Date 타입으로 처리

  @IsArray()
  mates: string; // JSON 타입 데이터, 구체적인 구조는 클라이언트와 서버 간에 정의 필요
}
