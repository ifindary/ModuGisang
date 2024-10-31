import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Users } from './entities/users.entity';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { UserDto } from '../auth/dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Streak } from './entities/streak.entity';
import RedisCacheService from '../redis-cache/redis-cache.service';
import { UserInformationDto } from './dto/user-info.dto';
import { Challenges } from 'src/challenges/challenges.entity';
import { Invitations } from 'src/invitations/invitations.entity';
// import { refreshJwtConstants } from 'src/auth/constants';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    @InjectRepository(Streak)
    private streakRepository: Repository<Streak>,
    @InjectRepository(Challenges)
    private challengeRepository: Repository<Challenges>,
    @InjectRepository(Invitations)
    private invitationRepository: Repository<Invitations>,
    private configService: ConfigService,
    private readonly redisService: RedisCacheService,
  ) {
    this.userRepository = userRepository;
    this.streakRepository = streakRepository;
    this.challengeRepository = challengeRepository;
    this.invitationRepository = invitationRepository;
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
    newUser.affirmation = '오늘 하루도 화이팅';
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
    const user = await this.userRepository.findOne({
      where: { email },
    });
    return user;
  }

  // 회원 조회 함수(탈퇴한 회원도 함께 조회)
  async checkdeletedUser(email: string): Promise<Users> {
    const user = await this.userRepository.findOne({
      where: { email },
      withDeleted: true,
    });
    return user;
  }

  async findOneByID(_id: number): Promise<Users> {
    return await this.userRepository.findOne({
      where: { _id },
    });
  }

  // refreshToken db에 저장
  // redis 로 변경
  async setCurrentRefreshToken(refreshToken: string, user: Users) {
    const currentRefreshToken =
      await this.getCurrentHashedRefreshToken(refreshToken);
    const currentRefreshTokenExp = await this.getCurrentRefreshTokenExp();
    // await this.userRepository.update(user._id, {
    //   currentRefreshToken: currentRefreshToken,
    //   currentRefreshTokenExp: currentRefreshTokenExp,
    // });

    await this.redisService.set(
      `refreshToken:${user._id}`,
      currentRefreshToken,
      parseInt(this.configService.get<string>('REFRESH_TOKEN_EXP')) / 1000,
    );
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

  // redis로 변경
  async getUserRefreshToken(userId: number): Promise<string> {
    // const user = await this.userRepository.findOne({ where: { _id: userId } });
    const user = await this.redisService.get(`refreshToken:${userId}`);
    if (!user) {
      return null;
    }

    return user;
  }

  // redis로 변경
  async getUserIfRefreshTokenMatches(
    refreshToken: string,
    userId: number,
  ): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { _id: userId },
    });
    const refresh = await this.redisService.get(`refreshToken:${userId}`);

    if (!refresh) {
      return null;
    }

    try {
      const isRefreshTokenMatching = await argon2.verify(refresh, refreshToken);

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

  // redis로 변경
  async removeRefreshToken(userId: number): Promise<any> {
    // return await this.userRepository.update(
    //   { _id: userId },
    //   {
    //     currentRefreshToken: null,
    //     currentRefreshTokenExp: null,
    //   },
    // );
    return await this.redisService.del(`refreshToken:${userId}`);
  }

  async updateAffirm(user: Users, affirmation: string) {
    console.log(user);
    this.redisService.del(`userInfo:${user._id}`);
    const result = await this.userRepository.update(
      { _id: user._id },
      {
        affirmation: affirmation,
      },
    );
    console.log(result);
    return result;
  }

  // 유저의 스트릭 데이터 처리 함수
  async getCurrentStreak(userId: number) {
    try {
      const streaks = await this.getStreak(userId);

      const currentStreak = streaks?.currentStreak ?? 0;
      const lastActiveDate = streaks?.lastActiveDate ?? null;

      return {
        currentStreak: currentStreak,
        lastActiveDate: lastActiveDate,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        '스트릭 데이터를 가져오는 동안 오류가 발생했습니다.',
      );
    }
  }
  // 유저의 초대장 데이터 처리 함수
  async getInviationsCount(userId: number) {
    try {
      const invitations = await this.getInvitations(userId);

      const count = invitations?.invitations.filter(
        (invitation) => !invitation.isExpired,
      ).length; // 초대받은 챌린지의 수

      return {
        invitations: invitations,
        count: count,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        '초대장 데이터를 가져오는 동안 오류가 발생했습니다.',
      );
    }
  }

  // 유저가 초대받은 초대장 조회 함수
  async getInvitations(userId: number) {
    const invitations = await this.invitationRepository.find({
      where: { guestId: userId },
    });

    // const invitations = await this.userRepository.findOne({
    //   where: { _id: userId },
    //   relations: ['invitations', 'streak'],
    // });
    // const count = invitations?.invitations.filter(
    //   (invitation) => !invitation.isExpired,
    // ).length; // 초대받은 챌린지의 수
    // const currentStreak = invitations?.streak?.currentStreak ?? 0;
    return {
      invitations: invitations,
      // currentStreak: currentStreak,
      // lastActiveDate: invitations?.streak?.lastActiveDate ?? null,
      // count: count,
    };
  }

  async setStreak(userId: number) {
    const today = this.getCurrentTime();
    const streak = await this.getStreak(userId);

    if (streak) {
      const diffDays = this.getDayDifference(today, streak.lastActiveDate);
      // streak가 있을 때
      // const oneDayInMs = 1000 * 60 * 60 * 24;
      // const diffDays = Math.floor(
      //   (today.getTime() - streak.lastActiveDate.getTime()) / oneDayInMs,
      // );
      if (diffDays <= 1) {
        // 당일 또는 어제 한 경우 스트릭 증가 -> 당일에 두번하는 경우는 실제로 없으니 나중에 바꾸기
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
      const streak = await this.streakRepository.findOne({
        where: { userId: userId, user: { deletedAt: null } },
        relations: ['user'],
      });

      return streak;
    } catch (e) {
      console.log('getStreak error', e);
    }
  }

  getCurrentTime() {
    const today = new Date();
    const koreaOffset = 9 * 60; // KST는 UTC+9
    const localOffset = today.getTimezoneOffset(); // 현재 로컬 시간대의 오프셋 (분 단위)

    // UTC 시간에 KST 오프셋을 적용
    return new Date(today.getTime() + (localOffset + koreaOffset) * 60000);
  }

  isContinuous(lastActiveDate: Date | null): boolean {
    if (!lastActiveDate || lastActiveDate === null) {
      return false;
    }
    const today = this.getCurrentTime();
    const diffDays = this.getDayDifference(today, lastActiveDate);
    return !(diffDays > 1);
  }

  getDayDifference(today: Date, lastActiveDate: Date): number {
    const oneDayInMs = 1000 * 60 * 60 * 24;
    return Math.floor(
      (today.getTime() - lastActiveDate.getTime()) / oneDayInMs,
    );
  }

  async saveOpenviduToken(userId: number, token: string) {
    const user = await this.userRepository.findOne({
      where: { _id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.openviduToken = token;
    await this.redisService.del(`userInfo:${userId}`);
    await this.userRepository.save(user);
  }

  async redisCheckUser(userId: number) {
    const user = await this.redisService.get(`userInfo:${userId}`);
    if (!user) {
      console.log('redis에 유저 정보가 없습니다.');
      return null;
    }
    console.log('redis에 유저 정보가 있습니다.');
    return JSON.parse(user);
  }

  async redisSetUser(userId: number, userInformation: any) {
    const state = await this.redisService.set(
      `userInfo:${userId}`,
      JSON.stringify(userInformation),
      parseInt(this.configService.get<string>('REDIS_USER_INFO_EXP')), // 24시간 동안 해당 유저 정보 redis에 저장
    );
    if (state !== 'OK') {
      console.log('redis에 유저 정보 저장 실패');
    } else {
      console.log('redis에 유저 정보 저장 성공');
    }
  }
  async resetChallenge(userId: number) {
    const user = await this.userRepository.findOne({ where: { _id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.challengeId = -1;
    await this.redisService.del(`userInfo:${userId}`);
    await this.userRepository.save(user);
  }

  // 메달 증가 함수
  async updateUserMedals(
    userId: number,
    medalType: 'gold' | 'silver' | 'bronze',
  ): Promise<Users> {
    const user = await this.userRepository.findOne({ where: { _id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    // 해당 메달의 수를 증가시킵니다.
    user.medals[medalType] += 1;

    // 업데이트된 유저 정보를 저장합니다.
    // redis에 저장된 user 정보 삭제
    await this.redisService.del(`userInfo:${userId}`);
    return await this.userRepository.save(user);
  }
  decideMedalType(duration: number): 'gold' | 'silver' | 'bronze' {
    if (duration === 100) {
      return 'gold';
    } else if (duration === 30) {
      return 'silver';
    } else if (duration === 7) {
      return 'bronze';
    }
  }

  async verifyUserPassword(user: Users, password: string) {
    const isPasswordMatching = await argon2.verify(user.password, password);
    return isPasswordMatching;
  }

  async deleteUser(user: Users) {
    const userId = user._id;
    const challengeId = user.challengeId;
    const challenge = await this.challengeRepository.findOne({
      where: { _id: challengeId },
    });

    // 챌린지에 참여중인 경우
    if (challengeId !== -1) {
      // 삭제될 유저가 호스트일 때
      if (userId === challenge.hostId) {
        let inChallengeUsers = await this.userRepository.find({
          where: { challengeId: challengeId },
        });

        inChallengeUsers = inChallengeUsers.filter(
          (challengeUser) => challengeUser._id !== userId,
        );

        // 삭제될 사용자 제외한 챌린지 참여자가 있을 때
        if (inChallengeUsers.length > 0) {
          const randomIndex = Math.floor(
            Math.random() * inChallengeUsers.length,
          );
          challenge.hostId = inChallengeUsers[randomIndex]._id;
          await this.challengeRepository.save(challenge);
        }
      }

      // 삭제될 사용자는 챌린지에서 빠짐
      user.challengeId = -1;
      await this.userRepository.save(user);
    }

    // 챌린지 정보 캐시 삭제
    await this.redisService.del(`userInfo:${userId}`);
    await this.redisService.del(`challenge_${challengeId}`);

    // 유저 소프트 삭제
    const result = await this.userRepository.softDelete({ _id: userId });
    return result.affected;
  }

  // 유저 복구하는 함수 (혹시 몰라서 만듦)
  async restoreUser(userId: number): Promise<void> {
    const result = await this.userRepository.restore(userId);
    const user = await this.userRepository.findOne({ where: { _id: userId } });
    console.log('USER IS', user);
    const cacheKey = `challenge_${user.challengeId}`;

    await this.redisService.del(cacheKey);

    if (result.affected == 0) {
      throw new NotFoundException('해당 이메일을 가진 유저는 없습니다.');
    }
  }

  async searchEmail(name: string) {
    console.log(name);
    const result = await this.userRepository.find({
      where: { userName: name },
      select: ['email'],
    });

    return result;
  }

  async changeTmpPassword(email: string) {
    const user = await this.userRepository.findOne({
      where: { email: email },
    });

    if (!user) {
      return null;
    }

    const tmpPassword = Math.random().toString(36).slice(2);

    user.password = await argon2.hash(tmpPassword);
    await this.userRepository.save(user);

    console.log('tmpPW : ', tmpPassword);
    return tmpPassword;
  }

  async changePassword(userId: number, newPassword: string) {
    const hashedPassword = await argon2.hash(newPassword);
    const updatedPassword = await this.userRepository.update(userId, {
      password: hashedPassword,
    });
    return updatedPassword.affected === 1;
  }

  checkPWformat(pw: string): any {
    // 최소 8자 이상
    if (pw.length < 8) {
      return { success: false, message: '비밀번호는 8자 이상이어야 합니다.' };
    }

    // 영문 포함
    if (!/[a-zA-Z]/.test(pw)) {
      return {
        success: false,
        message: '비밀번호는 영문을 1개 이상 포함해야 합니다.',
      };
    }

    // 숫자 포함
    if (!/\d/.test(pw)) {
      return {
        success: false,
        message: '비밀번호는 숫자를 1개 이상 포함해야 합니다.',
      };
    }

    // 특수문자 포함
    if (!/[!@#~$%^&*()₩`_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) {
      return {
        success: false,
        message: '비밀번호는 특수문자를 1개 이상 포함해야 합니다.',
      };
    }

    // 모든 조건을 만족하면 true 반환
    return { success: true, message: '비밀번호가 유효합니다.' };
  }
}
