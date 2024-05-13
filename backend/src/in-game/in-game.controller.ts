import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { InGameService } from './in-game.service';
import { AuthenticateGuard } from 'src/auth/auth.guard';
import { ScoreDto } from './dto/score.dto';

@Controller('/api/in-game')
export class InGameController {
  constructor(private readonly inGameService: InGameService) {}

  @Get('enter')
  @UseGuards(AuthenticateGuard)
  async recordEntryTime(@Req() req, @Res() res): Promise<any> {
    const userId = req.user._id; // 사용자 ID 추출 방법은 인증 방식에 따라 다를 수 있습니다.
    const result = await this.inGameService.recordEntryTime(userId);
    res.status(HttpStatus.OK).json({ suceess: result });
  }

  @Post('score')
  async submitScore(@Body() scoreDto: ScoreDto, @Res() res) {
    console.log(scoreDto);
    const result = await this.inGameService.submitScore(scoreDto);
    res.status(HttpStatus.CREATED).json({ success: result });
  }

  @Get('result')
  @UseGuards(AuthenticateGuard)
  async getGameResults(@Req() req, @Res() res) {
    const challengeId = req.user.challengeId;
    const results = await this.inGameService.getGameResults(challengeId);
    return res.status(HttpStatus.OK).json(results);
  }
}
