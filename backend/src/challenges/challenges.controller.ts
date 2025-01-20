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
  Res,
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
        const sendInvitationDto: SendInvitationDto = {
          challengeId: challenge._id,
          mateEmail: mate,
        };
        await this.challengeService.sendInvitation(sendInvitationDto);
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
      throw new InternalServerErrorException(
        '챌린지 생성 중 오류가 발생했습니다.',
      );
    }
  }

  @Post('edit')
  async editChallenge(@Body() editChallengeDto: EditChallengeDto, @Res() res) {
    const challengeResult =
      await this.challengeService.editChallenge(editChallengeDto);
    if (challengeResult.affected !== 0) {
      return res
        .status(HttpStatus.NO_CONTENT)
        .send('챌린지 수정에 성공하였습니다.');
    }
  }

  @Post('delete/:challengeId/:userId') // 챌린지 생성하고 시작하지 않고 삭제하는 경우
  async deleteChallenge(
    @Param('challengeId') challengeId: number,
    @Param('userId') userId: number,
    @Res() res,
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
      return res
        .status(HttpStatus.NO_CONTENT)
        .send('챌린지 탈퇴에 성공하였습니다.');
    }

    // 호스트가 챌린지를 삭제한 경우
    if (
      'affected' in deleteChallengeResult &&
      deleteChallengeResult.affected &&
      deleteChallengeResult.affected > 0
    ) {
      return res
        .status(HttpStatus.NO_CONTENT)
        .send('챌린지 삭제에 성공하였습니다.');
    }

    // 삭제 실패한 경우
    return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .send('챌린지 삭제에 실패하였습니다.');
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
    try {
      const result =
        await this.challengeService.acceptInvitation(acceptInvitationDto);
      if (result.success === true) {
        return 'accept';
      } else {
        throw new BadRequestException('챌린지 초대 승낙 실패하였습니다.');
      }
    } catch (error) {
      if (error.message === '해당 챌린지가 진행 중 입니다.') {
        await this.challengeService.deleteInvitation(acceptInvitationDto);
      }
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
    @Res() res,
  ): Promise<ChallengeResultDto[]> {
    try {
      const result = await this.challengeService.getResultsByDateAndUser(
        userId,
        date,
      );
      // if (result === null) {
      //   return res
      //     .status(HttpStatus.OK)
      //     .send('해당 사용자 및 날짜에 대한 출석 기록이 없습니다.');
      // }
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
    @Res() res,
  ) {
    try {
      // 챌린지 포기 로직 실행
      await this.challengeService.challengeGiveUp(challengeId, userId);
      return res
        .status(HttpStatus.NO_CONTENT)
        .send('챌린지 포기에 성공하였습니다.');
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
