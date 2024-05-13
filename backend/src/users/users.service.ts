import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Users } from './entities/users.entity';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { UserDto } from 'src/auth/dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Streak } from './entities/streak.entity';
// import { refreshJwtConstants } from 'src/auth/constants';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    @InjectRepository(Streak)
    private streakRepository: Repository<Streak>,
    private configService: ConfigService,
  ) {
    this.userRepository = userRepository;
    this.streakRepository = streakRepository;
  }

  async createUser(
    email: string,
    password: string,
    username: string,
  ): Promise<Users> {
    const newUser = new Users();
    newUser.userName = username;
    newUser.email = email;
    newUser.password = password;
    newUser.affirmation = '오늘 하루도 화이팅!';
    newUser.challengeId = -1;
    newUser.profile = `https://api.dicebear.com/8.x/open-peeps/svg?seed=${username}`;
    newUser.medals = {
      gold: 0,
      silver: 0,
      bronze: 0,
    };
    return this.userRepository.save(newUser);
  }

  async findUser(email: string): Promise<Users> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user;
  }

  async findOneByID(_id: number): Promise<Users> {
    return await this.userRepository.findOne({ where: { _id } });
  }

  // refreshToken db에 저장
  async setCurrentRefreshToken(refreshToken: string, user: Users) {
    const currentRefreshToken =
      await this.getCurrentHashedRefreshToken(refreshToken);
    const currentRefreshTokenExp = await this.getCurrentRefreshTokenExp();
    await this.userRepository.update(user._id, {
      currentRefreshToken: currentRefreshToken,
      currentRefreshTokenExp: currentRefreshTokenExp,
    });
  }

  async getCurrentHashedRefreshToken(refreshToken: string): Promise<string> {
    return argon2.hash(refreshToken);
  }

  async getCurrentRefreshTokenExp() {
    const currentDate = new Date();
    const currentRefreshTokenExp = new Date(
      currentDate.getTime() +
        parseInt(this.configService.get<string>('REFRESH_TOKEN_EXP')),
    );
    return currentRefreshTokenExp;
  }

  async getUserRefreshToken(userId: number): Promise<UserDto> {
    const user = await this.userRepository.findOne({ where: { _id: userId } });
    if (!user) {
      return null;
    }

    return user;
  }

  async getUserIfRefreshTokenMatches(
    refreshToken: string,
    userId: number,
  ): Promise<UserDto> {
    const user = await this.userRepository.findOne({ where: { _id: userId } });

    if (!user.currentRefreshToken) {
      return null;
    }

    try {
      const isRefreshTokenMatching = await argon2.verify(
        user.currentRefreshToken,
        refreshToken,
      );

      if (isRefreshTokenMatching) {
        const userDto = new UserDto();
        userDto.email = user.email;
        userDto.password = user.password;
        return userDto;
      }
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async removeRefreshToken(userId: number): Promise<any> {
    return await this.userRepository.update(
      { _id: userId },
      {
        currentRefreshToken: null,
        currentRefreshTokenExp: null,
      },
    );
  }

  async updateAffirm(user: Users, affirmation: string) {
    console.log(user);
    const result = await this.userRepository.update(
      { _id: user._id },
      {
        affirmation: affirmation,
      },
    );
    console.log(result);
    return result;
  }

  async getInvis(userId: number) {
    const invitations = await this.userRepository.findOne({
      where: { _id: userId },
      relations: ['invitations'],
    });
    const count = invitations?.invitations.filter(
      (invitation) => !invitation.isExpired,
    ).length; // 초대받은 챌린지의 수
    return {
      invitations: invitations,
      count: count,
    };
  }

  async setStreak(userId: number) {
    const today = new Date();
    const streak = await this.getStreak(userId);
    const oneDayInMs = 1000 * 60 * 60 * 24;

    if (streak) {
      // streak가 있을 때
      const diffDays = Math.floor(
        (today.getTime() - streak.lastActiveDate.getTime()) / oneDayInMs,
      );
      if (diffDays == 1) {
        streak.currentStreak = streak.currentStreak + 1;
      } else {
        streak.currentStreak = 1;
      }
      streak.lastActiveDate = today;
    } else {
      // streak가 없을 때
      const newStreak = new Streak();
      newStreak.userId = userId;
      newStreak.lastActiveDate = today;
      newStreak.currentStreak = 1;
      return await this.streakRepository.save(newStreak);
    }
    return await this.streakRepository.save(streak);
  }

  async getStreak(userId: number) {
    try {
      const getStreak = await this.streakRepository.findOne({
        where: { userId: userId },
      });

      return getStreak;
    } catch (e) {
      console.log('getStreak error', e);
    }
  }
}
