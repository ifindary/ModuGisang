import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  HttpStatus,
  UseGuards,
  Param,
} from '@nestjs/common';
import { InGameService } from './in-game.service';
import { AuthenticateGuard } from 'src/auth/auth.guard';
import { ScoreDto } from './dto/score.dto';

@UseGuards(AuthenticateGuard)
@Controller('/api/in-game')
export class InGameController {
  constructor(private readonly inGameService: InGameService) {}

  @Get('enter/:userId')
  @UseGuards(AuthenticateGuard)
  async recordEntryTime(
    @Param('userId') userId: number,
    @Req() req,
    @Res() res,
  ): Promise<any> {
    // const userId = req.user._id; // 사용자 ID 추출 방법은 인증 방식에 따라 다를 수 있습니다.
    const result = await this.inGameService.recordEntryTime(userId);
    res.status(HttpStatus.OK).json({ suceess: result });
  }

  @Post('score')
  async submitScore(@Body() scoreDto: ScoreDto, @Res() res) {
    console.log('@@@@@@@@@@@@@@@@@@@@@@점수 입력 컨트롤러 ', scoreDto);
    const result = await this.inGameService.submitScore(scoreDto);

    res.cookie('complete', 'true', {
      maxAge: 86400,
      secure: process.env.IS_Production === 'true' ? true : false,
      domain:
        process.env.IS_Production === 'true' ? process.env.DOMAIN : undefined,
    });

    res.status(HttpStatus.CREATED).json({ success: result });
  }

  @Get('result/:challengeId')
  @UseGuards(AuthenticateGuard)
  async getGameResults(
    @Param('challengeId') challengeId: string,
    @Req() req,
    @Res() res,
  ) {
    console.log(
      '@@@@AuthenticateGuard/req.user.challengeId@@@@',
      req.user.challengeId,
    );
    console.log('@@@AuthenticateGuard/challengeId', challengeId);
    // const challengeId = req.user.challengeId;
    const results = await this.inGameService.getGameResults(
      Number(challengeId),
    );
    return res.status(HttpStatus.OK).json(results);
  }
}
