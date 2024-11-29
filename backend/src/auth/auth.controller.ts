import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { AuthService } from './auth.service';
import { AuthenticateGuard } from './auth.guard';
import { Response } from 'express';
import { UserService } from 'src/users/users.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtRefreshGuard } from './jwt-refresh.guard';
import * as argon2 from 'argon2';

@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post()
  async authNumCheck(@Res() res: Response, @Body() data: any) {
    const result = await this.authService.authNumcheck(
      data.email,
      data.authNum,
    );
    if (result) {
      res.status(HttpStatus.OK).send('인증 성공');
    } else {
      res.status(HttpStatus.BAD_REQUEST).send('인증 실패');
    }
  }

  @Post('login')
  async login(@Req() req, @Res() res, @Body() user: UserDto) {
    // 로그인 시 예외처리 더 자세하게 구현 필요 ( DB에 값을 제대로 저장을 못했을 때, 서버 쪽 에러가 있을 때 등 )
    if (!user.email || !user.password) {
      throw new HttpException(
        '이메일 또는 비밀번호가 입력되지 않았습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      //사용자 조회
      const authUser = await this.userService.findUser(user.email);
      // 비밀번호 검증
      await this.userService.verifyUserPassword(authUser, user.password);
      // 토큰 생성
      const accessToken = await this.authService.validateUser(authUser);
      const refreshToken = await this.authService.generateRefreshToken(
        authUser._id,
      );

      // 토큰 저장
      await this.userService.setCurrentRefreshToken(refreshToken, authUser); //db에 저장

      if (accessToken && refreshToken) {
        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          maxAge: process.env.REFRESH_TOKEN_EXP,
          secure: process.env.IS_Production === 'true' ? true : false,
          // sameSite: 'None', // Cross-site 쿠키를 허용
          domain:
            process.env.IS_Production === 'true'
              ? process.env.DOMAIN
              : undefined,
        });
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          maxAge: process.env.REFRESH_TOKEN_EXP,
          secure: process.env.IS_Production === 'true' ? true : false,
          // sameSite: 'None', // Cross-site 쿠키를 허용
          domain:
            process.env.IS_Production === 'true'
              ? process.env.DOMAIN
              : undefined,
        });
        res.send({
          accessToken: accessToken,
          refreshToken: refreshToken,
          userId: authUser._id,
        });
        // return {
        //   accessToken: accessToken,
        //   refreshToken: refreshToken,
        //   userId: authUser._id,
        // };
      } else {
        throw new UnauthorizedException('로그인 실패');
      }
    } catch (error) {
      if (
        error instanceof HttpException ||
        error instanceof UnauthorizedException
      ) {
        throw error; // 이미 처리된 예외는 재던짐
      } else {
        throw new HttpException(
          '로그인 시 서버에서 오류가 발생했습니다.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Get('authenticate')
  @UseGuards(AuthenticateGuard)
  async isAuthenticated(@Request() req) {
    if (req.user) {
      return {
        status: 'sucess',
        message: 'Access Token 인증 성공',
      };
    } else {
      throw new UnauthorizedException('Access Token 인증 실패');
    }
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      const result = await this.authService.refresh(refreshTokenDto);
      if (result) {
        return {
          accessToken: result.accessToken,
          userId: result.userId,
        };
      } else {
        throw new UnauthorizedException('Access Token 생성 실패하였습니다.');
      }
    } catch (err) {
      throw new UnauthorizedException('refresh-token이 유효하지 않습니다.');
    }
  }

  @Get('logout/:userId')
  @UseGuards(AuthenticateGuard)
  async logout(@Param('userId') userId: string, @Req() req, @Res() res) {
    // const token = await this.userService.removeRefreshToken(req.user._id);
    const token = await this.userService.removeRefreshToken(Number(userId));
    if (token == 1) {
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.IS_Production === 'true' ? true : false,
        // sameSite: 'None',
        domain:
          process.env.IS_Production === 'true' ? process.env.DOMAIN : undefined,
      });
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.IS_Production === 'true' ? true : false,
        // sameSite: 'None',
        domain:
          process.env.IS_Production === 'true' ? process.env.DOMAIN : undefined,
      });
      res.send({ status: 'success', message: '로그아웃 성공' });
    } else {
      throw new UnauthorizedException('로그아웃에 실패하였습니다.');
    }
  }
}
