// email.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import RedisCacheService from 'src/redis-cache/redis-cache.service';
import { UserService } from 'src/users/users.service';

@Injectable()
export class EmailService {
  private transporter;

  constructor(
    private configService: ConfigService,
    private redisService: RedisCacheService,
    private userService: UserService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('VAL_EMAIL'), // Gmail 계정
        pass: this.configService.get<string>('API_KEY'), // Gmail 비밀번호
      },
    });
  }

  async sendMail(to: string): Promise<string> {
    const randomNumber = this.generateRandomNumber(6);
    const mailOptions = {
      from: '"MM Team" <info@yourdomain.com>',
      to: to, //수신자
      subject: this.configService.get<string>('EMAIL_WELCOME_SUBJECT'), //제목
      text: '<b>Welcome to our service!</b>', //내용
      html: `<b>Welcome to our service!</b> <br> 인증 번호는 ${randomNumber} 입니다.`, //html 내용
    };

    await this.transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(`error: ${error}`);
      }
      console.log(`Message Sent: ${info.response}`);
    });
    return `${randomNumber}`;
  }

  generateRandomNumber(length: number): string {
    const minValue = 0;
    const maxValue = 999999; // 6자리 숫자의 최대값
    const randomInt =
      Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
    return randomInt.toString().padStart(length, '0'); // 6자리 문자열로 변환하여 앞에 0 채우기
  }

  async setRandom(email: string, random: string) {
    await this.redisService.set(email, random, 180);
    return random;
  }

  async checkAndSendEmail(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    const userExists = await this.userService.findUser(email);
    if (userExists) {
      return { success: false, message: '이미 존재하는 이메일입니다.' };
    } else {
      const random = await this.sendMail(email);
      await this.setRandom(email, random);
      return { success: true, message: '인증번호 전송완료' };
    }
  }
}
