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
    const challenge = await this.challengeService.getChallengeInfo(challengeId);
    if (!challenge) {
      throw new NotFoundException(`Challenge with ID ${challengeId} not found`);
    }
    return challenge;
  }

  @Post('create')
  async createChallenge(@Body() createChallengeDto: CreateChallengeDto) {
    console.log('create');
    console.log(createChallengeDto);
    if (createChallengeDto.mates.length > 4) {
      throw new BadRequestException('챌린지 참여 인원이 초과되었습니다.');
    }
    try {
      const challenge =
        await this.challengeService.createChallenge(createChallengeDto);

      // 챌린지 생성 후, host의 challengeId 정보 업데이트
      await this.challengeService.updateUserChallenge(
        createChallengeDto.hostId,
        challenge._id,
      );

      for (const mate of createChallengeDto.mates) {
        await this.challengeService.sendInvitation(challenge._id, mate);
      }

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
        } else if (error.message.includes('UQ_invitation')) {
          throw new ConflictException('이미 초대된 사용자입니다.');
        } else {
          throw new InternalServerErrorException(
            '챌린지 생성 중 DB 오류가 발생했습니다.',
          );
        }
      }

      // 예상치 못한 에러
      console.error('Unexpected error:', error);
      throw new InternalServerErrorException(
        '챌린지 생성 중 오류가 발생했습니다.',
      );
    }
  }

  @Post('edit')
  async editChallenge(@Body() editChallengeDto: EditChallengeDto) {
    console.log('edit');
    const challenge =
      await this.challengeService.editChallenge(editChallengeDto);
    return challenge;
  }

  @Post('delete/:challengeId/:hostId') // 챌린지 생성하고 시작하지 않고 삭제하는 경우
  async deleteChallenge(
    @Param('challengeId') challengeId: number,
    @Param('hostId') hostId: number,
  ) {
    console.log(challengeId);
    const deleteChallengeResult = await this.challengeService.deleteChallenge(
      challengeId,
      hostId,
    );
    if (deleteChallengeResult.affected === 0) {
      return {
        message: '챌린지 삭제 실패',
        status: 500,
      };
    } else {
      return {
        message: '챌린지 삭제 성공',
        status: 200,
      };
    }
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
        message:
          'This challenge has completed and user data has been successfully updated.',
      };
    } else {
      return {
        completed: false,
        message: 'This challenge is not completed yet.',
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
    console.log(guestId);
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
      throw new BadRequestException('승낙 실패');
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
          'No attendance records found for the given user and date',
        );
      }
      if (error.message === 'No challenge found for the user.') {
        throw new NotFoundException('No challenge found for the given user');
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Post('/changeWakeTime')
  async setChallengeWakeTime(@Body() setChallengeWakeTimeDto): Promise<void> {
    console.log('기상시간 변경완료');
    console.log(setChallengeWakeTimeDto);
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
      console.log(
        `Starting challengeGiveUp for challengeId: ${challengeId}, userId: ${userId}`,
      );
      // 챌린지 포기 로직 실행
      await this.challengeService.challengeGiveUp(challengeId, userId);
      console.log(
        `Successfully gave up challenge with ID ${challengeId} for user ${userId}`,
      );
      return { status: 200, message: ' 성공' };
    } catch (error) {
      console.error(`Error in challengeGiveUp: ${error.message}`);
      return {
        status: error.status || 500,
        message: error.message || 'An unexpected error occurred.',
      };
    }
  }
}
