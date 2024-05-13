import {
  Body,
  Controller,
  Get,
  HttpStatus,
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
// import { UsersEntity } from 'src/users/users.entity';
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
    console.log(data);
    const result = await this.authService.authNumcheck(
      data.email,
      data.authNum,
    );
    console.log(result);
    if (result) {
      res.status(HttpStatus.OK).send('인증 성공');
    } else {
      res.status(HttpStatus.BAD_REQUEST).send('인증 실패');
    }
  }

  @Post('login')
  async login(@Body() user: UserDto) {
    // 로그인 시 예외처리 더 자세하게 구현 필요 ( DB에 값을 제대로 저장을 못했을 때, 서버 쪽 에러가 있을 때 등 )
    const authUser = await this.userService.findUser(user.email);
    const validatePassword = await argon2.verify(
      authUser.password,
      user.password,
    );
    if (!authUser || !validatePassword) {
      throw new UnauthorizedException();
    }
    const accessToken = await this.authService.validateUser(authUser);
    const refreshToken = await this.authService.generateRefreshToken(
      authUser._id,
    );
    await this.userService.setCurrentRefreshToken(refreshToken, authUser); //db에 저장
    if (accessToken && refreshToken) {
      console.log('로그인 성공');
      return {
        accessToken: accessToken,
        refreshToken: refreshToken,
        userId: authUser._id,
      };
    } else {
      throw new UnauthorizedException('로그인 실패');
    }
    // res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 900000, secure: true });
    // res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 900000, secure: true });
    // res.send({
    //     accessToken: accessToken,
    //     refreshToken: refreshToken
    // });
  }

  @Get('authenticate')
  @UseGuards(AuthenticateGuard)
  async isAuthenticated(@Request() req) {
    console.log(req.user);
    if (req.user) {
      console.log('인증 성공');
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
      console.log(result);
      if (result) {
        console.log('AccessToken 재성성 성공');
        return {
          status: 'success',
          message: 'AccessToken 생성 성공',
          data: {
            accessToken: result.accessToken,
            userId: result.userId,
          },
        };
      } else {
        throw new UnauthorizedException('Access Token create fail');
      }
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh-token');
    }
  }

  @Get('logout')
  @UseGuards(AuthenticateGuard)
  async logout(@Req() req) {
    const token = await this.userService.removeRefreshToken(req.user._id);
    console.log(token.affected);
    if (token.affected > 0) {
      return {
        status: 'success',
        message: '로그아웃 성공',
      };
    } else {
      throw new UnauthorizedException('Login Fail');
    }
  }
}
