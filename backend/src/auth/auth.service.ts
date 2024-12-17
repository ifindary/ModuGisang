import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/users/users.service';
import { UserDto } from './dto/user.dto';
import * as argon2 from 'argon2';
import { Payload } from './payload.interface';
// import { refreshJwtConstants } from './constants';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ConfigService } from '@nestjs/config';
import RedisCacheService from 'src/redis-cache/redis-cache.service';
import { Users } from 'src/users/entities/users.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisCacheService,
  ) {}

  // accessToken 생성
  async validateUser(user: Users): Promise<string> {
    const payload = { sub: user._id, _id: user._id, username: user.userName };
    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXP'), // Add expiresIn
    });
  }
  // 토큰 Payload에 해당하는 아아디의 유저 가져오기
  async tokenValidateUser(payload: Payload): Promise<UserDto | undefined> {
    const user = await this.userService.findOneByID(payload._id);
    if (!user) {
      throw new UnauthorizedException('해당 유저를 찾을 수 없습니다.');
    }
    return user;
  }

  // refreshToken 생성
  async generateRefreshToken(_id: number): Promise<string> {
    const result = await this.jwtService.signAsync(
      { _id: _id }, // id 값 변경?
      {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET_KEY'),
        expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXP'),
      },
    );
    return result;
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<any> {
    const refreshToken = refreshTokenDto.refreshToken;
    try {
      const decodedRefreshToken = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET_KEY'),
      });
      const userId = decodedRefreshToken._id;

      const user = await this.userService.getUserIfRefreshTokenMatches(
        refreshToken,
        userId,
      );

      if (!user) {
        throw new UnauthorizedException('리프레쉬 토큰이 유효하지 않습니다.');
      }

      const accessToken = await this.generateAccessToken(user); // userdto로 변환

      return {
        accessToken: accessToken,
        userId: userId,
      };
    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        // JWT 형식 오류
        throw new UnauthorizedException('잘못된 토큰 형식입니다.');
      } else if (err.name === 'TokenExpiredError') {
        // JWT 만료 오류
        throw new UnauthorizedException('토큰이 만료되었습니다.');
      } else {
        // 기타 오류
        throw new UnauthorizedException(
          '리프레쉬 토큰을 사용하는 도중 오류가 발생하였습니다.',
        );
      }
    }
  }

  async generateAccessToken(userDto: UserDto): Promise<string> {
    const userFind = await this.userService.findUser(userDto.email);
    if (!userFind || userFind.password != userDto.password) {
      throw new UnauthorizedException('액세스 토큰 생성 실패하였습니다.');
    }
    const payload = {
      sub: userFind._id,
      _id: userFind._id,
      username: userFind.userName,
    };
    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXP'), // Add expiresIn
    });
  }
  async authNumcheck(email: string, data: string) {
    const serverNum = await this.redisService.get(email);
    if (serverNum === data) {
      return true;
    } else {
      return false;
    }
  }
}
