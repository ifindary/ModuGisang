import {
  Body,
  Controller,
  Post,
  UseGuards,
  Param,
  Get,
  ParseIntPipe,
  Res,
  Req,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthenticateGuard } from 'src/auth/auth.guard';

@Controller('/api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('sign-up')
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.createUser(
      createUserDto.email,
      createUserDto.password,
      createUserDto.userName,
    );
    return user;
  }

  @UseGuards(AuthenticateGuard)
  @Get('me')
  async myData(@Req() req) {
    const userId = req.user._id;
    const user = await this.userService.findOneByID(userId);
    const streaks = await this.userService.getCurrentStreak(userId);
    const invitations = await this.userService.getInviationsCount(userId);

    return {
      userId: user._id,
      userName: user.userName,
      streakDays: 0, // streak 구현 후 처리 예정
      medals: {
        gold: user.medals.gold,
        silver: user.medals.silver,
        bronze: user.medals.bronze,
      },
      invitationCounts: invitations.count,
      affirmation: user.affirmation,
      challengeId: user.challengeId,
      profile: user.profile,
      openviduToken: user.openviduToken,
    };
  }

  @UseGuards(AuthenticateGuard)
  @Get('/:userId')
  async searchUser(@Req() req, @Param('userId', ParseIntPipe) userId: number) {
    const redisCheckUserInfo = await this.userService.redisCheckUser(userId);
    if (redisCheckUserInfo) {
      return redisCheckUserInfo;
    } else {
      const user = await this.userService.findOneByID(userId);
      const streaks = await this.userService.getCurrentStreak(userId);
      const invitations = await this.userService.getInviationsCount(userId);
      const lastActiveDate = streaks.lastActiveDate;
      const isCountinue = this.userService.isContinuous(lastActiveDate);

      const userInformation = {
        userId: user._id,
        userName: user.userName,
        streakDays: isCountinue ? streaks.currentStreak : 0,
        medals: {
          gold: user.medals.gold,
          silver: user.medals.silver,
          bronze: user.medals.bronze,
        },
        invitationCounts: invitations.count,
        affirmation: user.affirmation,
        challengeId: user.challengeId,
        profile: user.profile,
        openviduToken: user.openviduToken,
      };

      await this.userService.redisSetUser(userId, userInformation);
      return userInformation;
    }
  }

  @UseGuards(AuthenticateGuard)
  @Post('/:userId/update-affirm')
  async updateAffirm(
    @Param('userId') userId: number,
    @Body('affirmation') affirmation: string,
    @Res() res,
  ) {
    this.userService.checkAffirmation(affirmation);
    const user = await this.userService.findOneByID(userId);
    await this.userService.updateAffirm(user, affirmation);
    return res.status(HttpStatus.OK).json({ suceess: true });
  }

  // 계정 삭제 API
  @UseGuards(AuthenticateGuard)
  @Post('delete-user')
  async deleteUser(@Body('password') password: string, @Req() req, @Res() res) {
    const user = await this.userService.findOneByID(req.user._id);

    await this.userService.verifyUserPassword(user, password);

    // 삭제 진행
    const deletedUserCount = await this.userService.deleteUser(user);
    return res.status(HttpStatus.OK).json({ suceess: deletedUserCount });
  }

  // 계정 복구 API
  @Get('restore/:id')
  async restoreUser(@Param('id') id: number): Promise<void> {
    return this.userService.restoreUser(id);
  }

  // 비밀번호 변경 API
  @UseGuards(AuthenticateGuard)
  @Post('reset-password')
  async resetPassword(
    @Body() body: { newPassword: string; oldPassword: string },
    @Req() req,
    @Res() res,
  ) {
    const { newPassword, oldPassword } = body;

    // 유저 이메일과 비밀번호로 유저 2차 검증 후 유저 정보 가져오기
    const user = await this.userService.findUser(req.user.email);

    await this.userService.verifyUserPassword(user, oldPassword);

    this.userService.checkPWformat(newPassword);

    await this.userService.changePassword(user._id, newPassword);

    return res.status(HttpStatus.OK).json({ suceess: true });
  }
}
