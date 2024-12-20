import {
  BadRequestException,
  ConflictException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dto/createChallenge.dto';
import { AuthenticateGuard } from 'src/auth/auth.guard';
import { AcceptInvitationDto } from './dto/acceptInvitaion.dto';
import { ChallengeResponseDto } from './dto/challengeResponse.dto';
import { ChallengeResultDto } from './dto/challengeResult.dto';
import RedisCacheService from 'src/redis-cache/redis-cache.service';
import { EditChallengeDto } from './dto/editChallenge.dto';
import { SendInvitationDto } from './dto/sendInvitationDto';

@UseGuards(AuthenticateGuard)
@Controller('api/challenge')
export class ChallengesController {
  constructor(
    private readonly challengeService: ChallengesService,
    private readonly redisService: RedisCacheService,
  ) {}

  @Get()
  async getChallengeInfo(
    @Query('challengeId') challengeId: number,
  ): Promise<ChallengeResponseDto> {
    return await this.challengeService.getChallengeInfo(challengeId);
  }

  @Post('send-invitation')
  async sendInvitation(@Body() sendInvitationDto: SendInvitationDto) {
    const result =
      await this.challengeService.sendInvitation(sendInvitationDto);
    return result;
  }
  @Post('create')
  async createChallenge(@Body() createChallengeDto: CreateChallengeDto) {
    try {
      const challenge =
        await this.challengeService.createChallenge(createChallengeDto);

      // 챌린지 생성 후, host의 challengeId 정보 업데이트
      await this.challengeService.updateUserChallenge(
        createChallengeDto.hostId,
        challenge._id,
      );

      return challenge;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // 데이터베이스 관련 에러 처리
      if (error instanceof QueryFailedError) {
        if (error.message.includes('UQ_host_active_challenge')) {
          throw new BadRequestException('이미 진행 중인 챌린지가 있습니다.');
        } else {
          throw new InternalServerErrorException(
            '챌린지 생성 중 DB 오류가 발생했습니다.',
          );
        }
      }

      // 예상치 못한 에러
      throw new InternalServerErrorException(
        '챌린지 생성 중 오류가 발생했습니다.',
      );
    }
  }

  @Post('edit')
  async editChallenge(@Body() editChallengeDto: EditChallengeDto) {
    const challengeResult =
      await this.challengeService.editChallenge(editChallengeDto);
    if (challengeResult.affected !== 0) {
      return { message: '챌린지 수정 성공', status: 200 };
    }
  }

  @Post('delete/:challengeId/:userId') // 챌린지 생성하고 시작하지 않고 삭제하는 경우
  async deleteChallenge(
    @Param('challengeId') challengeId: number,
    @Param('userId') userId: number,
  ) {
    const deleteChallengeResult = await this.challengeService.deleteChallenge(
      challengeId,
      userId,
    );
    // 일반 유저의 리셋만 수행한 경우
    if (
      'resetOnly' in deleteChallengeResult &&
      deleteChallengeResult.resetOnly
    ) {
      return {
        message: '챌린지 탈퇴 성공',
        status: 200,
      };
    }

    // 호스트가 챌린지를 삭제한 경우
    if (
      'affected' in deleteChallengeResult &&
      deleteChallengeResult.affected &&
      deleteChallengeResult.affected > 0
    ) {
      return {
        message: '챌린지 삭제 성공',
        status: 200,
      };
    }

    // 삭제 실패한 경우
    return {
      message: '챌린지 삭제 실패',
      status: 500,
    };
  }

  // 로컬에 저장한 챌린지 값으로 현재 날짜랑 챌린지 날짜 비교해서 넘은 경우만 호출
  @Post('complete/:challengeId/:userId') // 챌린지가 끝났는지 확인하는 경우
  async completeChallenge(
    @Param('challengeId') challengeId: number,
    @Param('userId') userId: number,
  ) {
    const result = await this.challengeService.completeChallenge(
      challengeId,
      userId,
    );

    if (result === true) {
      return {
        completed: true,
        message: '챌린지가 완료되어 유저 정보가 수정되었습니다.',
      };
    } else {
      return {
        completed: false,
        message: '챌린지가 완료되지 않았습니다.',
      };
    }
  }

  @Get('search-mate')
  async searchMate(@Query('email') email: string, @Req() req) {
    const userId = req.user._id;
    const result = await this.challengeService.searchAvailableMate(
      email,
      userId,
    );
    return {
      isEngaged: result,
    };
  }

  @Get('invitations')
  getInvitations(@Query('guestId') guestId: number) {
    const invitations = this.challengeService.getInvitations(guestId);
    return invitations; // 데이터 반환 값 수정 예정
  }

  @Post('accept-invitation')
  async acceptInvitation(@Body() acceptInvitationDto: AcceptInvitationDto) {
    const result =
      await this.challengeService.acceptInvitation(acceptInvitationDto);
    if (result.success === true) {
      return 'accept';
    } else {
      throw new BadRequestException('챌린지 초대 승낙 실패');
    }
  }

  @Get('calendar/:userId/:month')
  async getChallengeCalendar(
    @Param('userId') userId: number,
    @Param('month') month: number,
  ): Promise<string[]> {
    return this.challengeService.getChallengeCalendar(userId, month);
  }

  @Get('/:userId/results/:date')
  async getChallengeResults(
    @Param('userId') userId: number,
    @Param('date') date: Date,
  ): Promise<ChallengeResultDto[]> {
    try {
      const result = await this.challengeService.getResultsByDateAndUser(
        userId,
        date,
      );
      return result;
    } catch (error) {
      if (error.message === 'Attendance does not exist') {
        throw new NotFoundException(
          '해당 사용자 및 날짜에 대한 출석 기록이 없습니다.',
        );
      }
      if (error.message === 'No challenge found for the user.') {
        throw new NotFoundException(
          '해당 사용자에 대한 챌린지를 찾을 수 없습니다.',
        );
      }
      throw new InternalServerErrorException(
        '서버에서 예상치 못한 오류가 발생했습니다.',
      );
    }
  }

  @Post('/changeWakeTime')
  async setChallengeWakeTime(@Body() setChallengeWakeTimeDto): Promise<void> {
    try {
      await this.challengeService.setWakeTime(setChallengeWakeTimeDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('/give-up/:challengeId/:userId')
  async challengeGiveUp(
    @Param('challengeId') challengeId: number,
    @Param('userId') userId: number,
  ) {
    try {
      // 챌린지 포기 로직 실행
      await this.challengeService.challengeGiveUp(challengeId, userId);
      return { status: 200, message: ' 성공' };
    } catch (error) {
      return {
        status: error.status || 500,
        message: error.message || '서버에서 예상치 못한 오류가 발생했습니다.',
      };
    }
  }
}
