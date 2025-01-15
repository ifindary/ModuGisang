import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Res,
  Post,
  Body,
} from '@nestjs/common';
import { Response } from 'express';
import { EmailService } from './email.service';

@Controller('/api/email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}
  @Get('check')
  async emailCheck(@Res() res: Response, @Query('email') email: string) {
    const result = await this.emailService.checkAndSendEmail(email);

    // reuslt 상태의 따른 response 값
    if (result.status === 'AVAILABLE') {
      res.status(HttpStatus.OK).send(result.message);
    } else if (result.status === 'RECENTLY_DELETED') {
      res.status(HttpStatus.GONE).send(result.message);
    } else if (result.status === 'IN_USE') {
      res.status(HttpStatus.BAD_REQUEST).send(result.message);
    }
  }

  // 이메일 유효성 체크 API (성공 시 이메일에 비밀번호 전송 실패 시 실패 문구 반환)
  @Post('change-tmp-password')
  async checkEmail(@Res() res: Response, @Body('email') email: string) {
    const result = await this.emailService.changeTmpPassword(email);
    if (result.success) {
      res.status(HttpStatus.OK).send(result.message);
    } else {
      res.status(HttpStatus.NOT_FOUND).send(result.message);
    }
  }
}
