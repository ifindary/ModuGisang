import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { OpenviduService } from './openvidu.service';
import { AuthenticateGuard } from 'src/auth/auth.guard';

@UseGuards(AuthenticateGuard)
@Controller('api')
export class OpenviduController {
  constructor(private readonly openviduService: OpenviduService) {}

  @Post('start-session')
  async startSession(@Body() body: any) {
    console.log('openvidu api start');
    if (!body.userData) {
      throw new HttpException('userData is required', HttpStatus.BAD_REQUEST);
    }

    const { challengeId, userId, userName } = body.userData;
    if (
      challengeId === undefined ||
      userId === undefined ||
      userName === undefined
    ) {
      throw new HttpException('Fields cannot be empty', HttpStatus.BAD_REQUEST);
    }
    if (!challengeId || !userId || !userName) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }

    body.userData.challengeId = challengeId.toString();
    body.userData.userId = userId.toString();
    const token = await this.openviduService.openviduTotalService(body); // 사용자 데이터에 대한 정보로 세션과 커넥션 생성 후 토큰 반환

    return { token: token };
  }
}
