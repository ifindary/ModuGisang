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
    return this.jwtService.signAsync(payload);
  }
  // 토큰 Payload에 해당하는 아아디의 유저 가져오기
  async tokenValidateUser(payload: Payload): Promise<UserDto | undefined> {
    const user = await this.userService.findOneByID(payload._id);
    if (!user) {
      console.log('No user found with ID:', payload._id);
      throw new UnauthorizedException('User does not exist');
    }
    return user;
  }

  // refreshToken 생성
  async generateRefreshToken(_id: number): Promise<string> {
    return this.jwtService.signAsync(
      { id: _id },
      {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET_KEY'),
        expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXP'),
      },
    );
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<any> {
    const refreshToken = refreshTokenDto.refreshToken;
    try {
      const decodedRefreshToken = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET_KEY'),
      });
      const userId = decodedRefreshToken.id;
      const user = await this.userService.getUserIfRefreshTokenMatches(
        refreshToken,
        userId,
      );
      if (!user) {
        throw new UnauthorizedException('Invalid user!');
      }

      const accessToken = await this.generateAccessToken(user); // userdto로 변환

      return {
        accessToken: accessToken,
        userId: userId,
      };
    } catch (err) {
      throw new UnauthorizedException(err);
    }
  }

  async generateAccessToken(userDto: UserDto): Promise<string> {
    const userFind = await this.userService.findUser(userDto.email);
    if (!userFind || userFind.password != userDto.password) {
      throw new UnauthorizedException();
    }
    const payload = {
      sub: userFind._id,
      id: userFind._id,
      username: userFind.userName,
    };
    return this.jwtService.signAsync(payload);
  }
  async authNumcheck(email: string, data: string) {
    console.log('Inservice data :' + data);
    const serverNum = await this.redisService.get(email);
    if (serverNum === data) {
      return true;
    } else {
      return false;
    }
  }
}
