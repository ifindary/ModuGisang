import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Challenges } from './challenges.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  DeleteResult,
  IsNull,
  MoreThanOrEqual,
  Repository,
  createQueryBuilder,
} from 'typeorm';
import { CreateChallengeDto } from './dto/createChallenge.dto';
import { InvitationsService } from 'src/invitations/invitations.service';
import { Users } from 'src/users/entities/users.entity';
import { AcceptInvitationDto } from './dto/acceptInvitaion.dto';
import {
  ChallengeResponseDto,
  ParticipantDto,
} from './dto/challengeResponse.dto';
import { Attendance } from 'src/attendance/attendance.entity';
import { Invitations } from 'src/invitations/invitations.entity';
import { ChallengeResultDto } from './dto/challengeResult.dto';
import RedisCacheService from 'src/redis-cache/redis-cache.service';
import { UserService } from 'src/users/users.service';
import { EditChallengeDto, Duration } from './dto/editChallenge.dto';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectRepository(Challenges)
    private challengeRepository: Repository<Challenges>,
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    private invitationService: InvitationsService,
    @InjectRepository(Invitations)
    private invitaionRepository: Repository<Invitations>,

    private readonly redisCacheService: RedisCacheService,
    private readonly userService: UserService,
  ) {
    this.challengeRepository = challengeRepository;
  }

  async createChallenge(challenge: CreateChallengeDto): Promise<Challenges> {
    this.validateStartAndWakeTime(challenge.startDate, challenge.wakeTime);
    this.validateDuration(challenge.duration);

    const newChallenge = new Challenges();
    const endDate = new Date(challenge.startDate);
    endDate.setDate(endDate.getDate() + challenge.duration - 1); // durationDays가 10일이라면 10일째 되는 날로 설정

    newChallenge.hostId = challenge.hostId;
    newChallenge.startDate = challenge.startDate;
    newChallenge.wakeTime = challenge.wakeTime;
    newChallenge.duration = challenge.duration;
    newChallenge.endDate = endDate;
    newChallenge.completed = false;
    newChallenge.deleted = false;

    return await this.challengeRepository.save(newChallenge);
  }

  async editChallenge(challenge: EditChallengeDto): Promise<Challenges> {
    this.validateStartAndWakeTime(challenge.startDate, challenge.wakeTime);
    this.validateDuration(challenge.duration);

    const editChall = await this.challengeRepository.findOne({
      where: { _id: challenge.challengeId },
    });

    if (!editChall) {
      throw new NotFoundException(
        `Challenge with ID ${challenge.challengeId} not found`,
      );
    }
    if (editChall.hostId !== challenge.hostId) {
      throw new BadRequestException(
        `User with ID ${challenge.hostId} is not the host of this challenge`,
      );
    }

    const endDate = new Date(challenge.startDate);
    endDate.setDate(endDate.getDate() + challenge.duration - 1); // durationDays가 10일이라면 10일째 되는 날로 설정

    editChall.startDate = challenge.startDate;
    editChall.wakeTime = challenge.wakeTime;
    editChall.duration = challenge.duration;
    editChall.endDate = endDate;
    editChall.completed = false;
    editChall.deleted = false;

    // 수정 후 캐시 삭제
    this.redisCacheService.del(`challenge_${editChall._id}`);
    return await this.challengeRepository.save(editChall);
  }

  // 챌린지 삭제 시 30일 정도 생성 못한다면 다시 복구 기능이 필요할 수 있음 -> hard가 아닌 soft delete??
  async deleteChallenge(
    challengeId: number,
    hostId: number,
  ): Promise<DeleteResult> {
    const challenge = await this.challengeRepository.findOne({
      where: { _id: challengeId },
    });
    if (!challenge) {
      throw new NotFoundException(`Challenge with ID ${challengeId} not found`);
    }
    if (challenge.hostId !== hostId) {
      throw new BadRequestException(
        `User with ID ${hostId} is not the host of this challenge`,
      );
    }
    if (challenge.startDate < new Date()) {
      throw new BadRequestException(
        `Challenge with ID ${challengeId} has already started so it cannot be deleted.`,
      );
    }
    return await this.challengeRepository.delete(challengeId);
  }

  async challengeGiveUp(challengeId: number, userId: number): Promise<void> {
    let challenge = await this.redisCheckChallenge(challengeId);
    if (challenge == null) {
      challenge = await this.challengeRepository.findOne({
        where: { _id: challengeId },
      });
    }
    if (!challenge) {
      throw new NotFoundException(
        `Challenge with ID ${challengeId} not found.`,
      );
    }
    const currentDate = new Date();
    if (!this.validateChallengeDate(currentDate, challenge)) {
      throw new BadRequestException(
        `Challenge with ID ${challengeId} is not currently in progress.`,
      );
    }

    const users = await this.userRepository.findBy({
      challengeId: challengeId,
    });
    if (users.length === 0) {
      throw new NotFoundException(
        `No users found for challenge ID ${challengeId}.`,
      );
    }

    if (users.length === 1) {
      // 혼자인경우 당연히 호스트인데 예외처리 해줘야하나?
      console.log(`Only one user in challenge. Marking challenge as deleted.`);
      challenge.deleted = true;
    } else if (users.length > 1 && challenge.hostId === userId) {
      // host가 포기하고 다른 유저가 남아있을 때 host가 아닌 다른 유저에게 챌린지를 넘기는 경우
      const newHost = users.find((user) => user._id !== challenge.hostId);
      if (!newHost) {
        throw new BadRequestException(
          `No suitable new host found for challenge ID ${challengeId}.`,
        );
      }
      console.log(
        `Transferring host from user ${userId} to user ${newHost._id}`,
      );
      challenge.hostId = newHost._id;
    }

    // 챌린지 캐시 삭제
    this.redisCacheService.del(`challenge_${challengeId}`);

    await this.challengeRepository.save(challenge);
    await this.userService.resetChallenge(userId);
    console.log(`User ${userId} has given up challenge ${challengeId}`);
  }

  async searchAvailableMate(email: string, userId: number): Promise<boolean> {
    const availUser = await this.userRepository.findOne({
      where: { email: email },
    });
    if (!availUser) {
      throw new NotFoundException('존재하지 않은 유저입니다.');
    }
    if (availUser._id !== userId) {
      if (availUser.challengeId > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      throw new BadRequestException('본인은 초대할 수 없습니다.');
    }
  }

  async hostChallengeStatus(hostId: number): Promise<number> {
    const challengeId = await this.challengeRepository
      .createQueryBuilder('challenges')
      .innerJoin('challenges.host', 'users')
      .where('challenges.hostId = :hostId', { hostId })
      .andWhere('users.deletedAt IS NULL') // 소프트 삭제된 유저 제외
      .getOne();

    const user = await this.userRepository.findOneBy({
      _id: hostId,
    });
    if (user && challengeId) {
      user.challengeId = challengeId._id;
      await this.userRepository.save(user);
      await this.redisCacheService.del(`userInfo:${hostId}`);
      return challengeId._id;
    }
    return null;
  }
  async sendInvitation(challengeId: number, email: string): Promise<void> {
    console.log('sendInvitation', email);
    const user = await this.userRepository.findOne({
      where: { email: email },
    });
    await this.invitationService.createInvitation(challengeId, user._id);
  }

  async acceptInvitation(invitation: AcceptInvitationDto) {
    const challengeId = invitation.challengeId;
    const guestId = invitation.guestId;
    // const { challengeId, guestId } = invitation;
    const responseDatedate = new Date();
    try {
      await Promise.all([
        this.invitaionRepository.update(
          { guestId },
          {
            responseDate: responseDatedate,
            isExpired: true,
          },
        ),
        this.userRepository.update(
          { _id: guestId },
          {
            challengeId: challengeId,
          },
        ),
        this.redisCacheService.del(`userInfo:${guestId}`),
        this.redisCacheService.del(`challenge_${challengeId}`),
      ]); // 여러개의 비동기 함수를 동시에 실행
      return { success: true, message: '승낙 성공' };
    } catch (e) {
      console.error('Failed to accept invitation or update user:', e);
      throw new Error('Error processing your invitation acceptance.');
    }
  }

  async getChallengeInfo(
    challengeId: number,
  ): Promise<ChallengeResponseDto | null> {
    const cacheKey = `challenge_${challengeId}`;

    if (challengeId > 0) {
      // 캐시에서 데이터 가져오기 시도
      const cachedChallenge = await this.redisCacheService.get(cacheKey);
      console.log(cachedChallenge);
      if (cachedChallenge) {
        return JSON.parse(cachedChallenge) as ChallengeResponseDto;
      }
    }

    // 캐시 미스 시 데이터베이스에서 가져오기
    const challenge = await this.challengeRepository.findOne({
      where: { _id: challengeId },
    });

    if (!challenge) {
      return null; // 챌린지가 없으면 null 반환
    }

    // 해당 챌린지 ID를 가진 모든 사용자 검색
    const participants = await this.userRepository.find({
      where: { challengeId: challenge._id },
    });
    console.log('PARTICIPANTS LIST IS ', participants);
    // 참가자 정보를 DTO 형식으로 변환
    const participantDtos: ParticipantDto[] = participants.map((user) => ({
      userId: user._id,
      userName: user.userName,
    }));

    const challengeResponse: ChallengeResponseDto = {
      challengeId: challenge._id,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
      hostId: challenge.hostId,
      wakeTime: challenge.wakeTime,
      duration: challenge.duration,
      mates: participantDtos,
    };

    if (challengeId > 0) {
      // 결과를 캐시에 저장
      await this.redisCacheService.set(
        cacheKey,
        JSON.stringify(challengeResponse),
        parseInt(process.env.REDIS_CHALLENGE_EXP),
      ); // 10분 TTL
    }

    return challengeResponse;
  }

  // async getChallengeInfo(
  //   challengeId: number,
  // ): Promise<ChallengeResponseDto | null> {
  //   // 먼저 챌린지 정보를 가져옵니다.
  //   const challenge = await this.challengeRepository.findOne({
  //     where: { _id: challengeId },
  //   });
  //   if (!challenge) {
  //     return null; // 챌린지가 없으면 null 반환
  //   }

  //   // 해당 챌린지 ID를 가진 모든 사용자 검색
  //   const participants = await this.userRepository.find({
  //     where: { challengeId: challenge._id },
  //   });

  //   // 참가자 정보를 DTO 형식으로 변환
  //   const participantDtos: ParticipantDto[] = participants.map((user) => ({
  //     userId: user._id,
  //     userName: user.userName,
  //   }));
  //   return {
  //     challengeId: challenge._id,
  //     startDate: challenge.startDate,
  //     wakeTime: challenge.wakeTime,
  //     duration: challenge.duration,
  //     mates: participantDtos,
  //   };
  // }
  async getChallengeCalendar(userId: number, month: number): Promise<string[]> {
    const currentYear = new Date().getFullYear(); // 현재 연도를 가져옴
    const startDate = new Date(currentYear, month - 1, 1); // 월은 0부터 시작하므로 month - 1
    const endDate = new Date(currentYear, month, 0); // 해당 월의 마지막 날짜를 구함
    const attendances = await this.attendanceRepository.find({
      where: {
        user: { _id: userId },
        date: Between(startDate, endDate),
      },
    });
    console.log(attendances);
    return attendances.map((attendance) => {
      // attendance.date가 Date 객체인지 확인하고, 그렇지 않다면 변환
      const date = new Date(attendance.date);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }
      return date.toISOString().split('T')[0];
    }); // 날짜만 반환
  }

  async getInvitations(guestId: number) {
    const invitations = await this.invitaionRepository.find({
      where: {
        guestId: guestId,
        isExpired: false,
        responseDate: IsNull(),
        guest: { deletedAt: null },
      },
      relations: ['challenge', 'challenge.host', 'guest'],
    });
    console.log('invi', invitations);
    return invitations.map((inv) => ({
      challengeId: inv.challengeId,
      startDate: inv.challenge.startDate,
      wakeTime: inv.challenge.wakeTime,
      duration: inv.challenge.duration,
      isExpired: inv.isExpired,
      userName: inv.challenge.host.userName,
      sendDate: inv.sendDate,
      responseDate: inv.responseDate,
    }));
  }

  async getResultsByDateAndUser(
    userId: number,
    date: Date,
  ): Promise<ChallengeResultDto[]> {
    const nowAttendance = await this.attendanceRepository.findOne({
      where: {
        userId: userId,
        date: date,
        user: { deletedAt: null },
      },
      relations: ['user'],
    });

    if (!nowAttendance) {
      throw new HttpException(
        'Attendance does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    const challengeId = nowAttendance.challengeId;

    const attendances = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.user', 'user')
      .leftJoinAndSelect('attendance.challenge', 'challenge')
      .withDeleted()
      .select([
        'attendance.score',
        'user.userName',
        'user._id',
        'user.deletedAt',
        'challenge.wakeTime',
      ])
      .where(
        'attendance.challengeId = :challengeId AND attendance.date = :date',
        { challengeId, date },
      )
      .orderBy('attendance.score', 'DESC')
      .getMany();

    console.log(attendances);

    return attendances.map((attendance) => ({
      userName: attendance.user ? attendance.user.userName : null,
      score: attendance.score,
      wakeTime: attendance.challenge.wakeTime,
      deleted: attendance.user
        ? attendance.user.deletedAt
          ? true
          : false
        : true,
    }));
  }

  async setWakeTime(setChallengeWakeTimeDto): Promise<void> {
    const challengeValue = await this.challengeRepository.findOne({
      where: { _id: setChallengeWakeTimeDto.challengeId },
    });
    if (!challengeValue) {
      throw new NotFoundException(
        `Challenge with ID ${setChallengeWakeTimeDto.challengeId} not found`,
      );
    }
    console.log('@@@@@@@@@@@@@@@@@@@@', setChallengeWakeTimeDto);
    challengeValue.wakeTime = new Date(
      `1970-01-01T${setChallengeWakeTimeDto.wakeTime}`,
    );
    await this.challengeRepository.save(challengeValue);

    const cacheKey = `challenge_${setChallengeWakeTimeDto.challengeId}`;
    await this.redisCacheService.del(cacheKey);
  }

  // 날짜 비교해서 챌린지 끝난경우 호출되는 메소드
  async completeChallenge(
    challengeId: number,
    userId: number,
  ): Promise<boolean> {
    const challenge = await this.challengeRepository.findOne({
      where: { _id: challengeId },
    });
    if (!challenge) {
      throw new NotFoundException(`Challenge with ID ${challengeId} not found`);
    }
    if (!this.checkChallengeExpiration(challenge)) {
      // -> error를 발생시켜야 하나?
      return false;
    }

    //// 1. 호스트인지 체크 후 호스트 인경우 챌린지 completed로 변경 -> 챌린지 정보를 가져와야 알 수 있음 userID 랑 비교
    // 1. 먼저 들어온사람이 먼저 challenge update
    if (challenge.completed !== true) {
      challenge.completed = true;
      await this.redisCacheService.del(`challenge_${challengeId}`);
      await this.challengeRepository.save(challenge);
    } else {
      throw new BadRequestException(
        `Challenge with ID ${challengeId} is already completed.`,
      );
    }
    await this.userService.resetChallenge(userId); // 2.user 챌린지 정보를 -1로 변경

    // 3. 메달처리
    // 기간별로 90%이상 80점 이상 달성시 메달 획득 금 100 은 30 동 7
    const qualifiedDaysCount = await this.attendanceRepository.count({
      where: {
        challengeId: challengeId,
        userId: userId,
        score: MoreThanOrEqual(80),
      },
    });
    const threshold = challenge.duration;

    if (qualifiedDaysCount >= threshold * 0.9) {
      // cutLine/total >= 0.9
      await this.userService.updateUserMedals(
        userId,
        this.userService.decideMedalType(threshold),
      );
    }
    return true;
  }

  checkChallengeExpiration(challenge: Challenges): boolean {
    // 현재 시간을 가져옴
    const currentDate = new Date();

    // 챌린지 종료 날짜와 기상시간을 결합하여 종료 시간 생성
    const challengeEndDateTime = new Date(challenge.endDate);
    // wakeTime을 문자열로 처리하여 시간, 분, 초를 추출
    const [hours, minutes, seconds] = challenge.wakeTime
      .toString()
      .split(':')
      .map(Number);

    // 종료 시간에 wakeTime의 시간, 분, 초 설정
    challengeEndDateTime.setHours(hours, minutes, seconds || 0);

    // 캐시 삭제할 필요는 없는것 같음 -> 다른 팀원들도 남아있을 수 있음

    return currentDate >= challengeEndDateTime;
  }

  // 현재 시간보다 이후인지 확인하는 함수
  validateStartAndWakeTime(startDate: Date, wakeTime: Date): void {
    const currentDate = new Date();

    // startDate에 wakeTime을 적용한 실제 시작 시간을 계산
    const startDateTime = new Date(startDate);
    startDateTime.setHours(wakeTime.getHours());
    startDateTime.setMinutes(wakeTime.getMinutes());
    startDateTime.setSeconds(wakeTime.getSeconds());

    if (startDateTime <= currentDate) {
      throw new BadRequestException(
        'The start date and wake time must be in the future.',
      );
    }
  }

  // duration이 7, 30, 100 중 하나인지 확인하는 함수
  validateDuration(duration: number): void {
    if (
      ![Duration.ONE_WEEK, Duration.ONE_MONTH, Duration.THREE_MONTHS].includes(
        duration,
      )
    ) {
      throw new BadRequestException(
        'Duration must be one of 7, 30, or 100 days.',
      );
    }
  }

  async redisCheckChallenge(challengeId: number) {
    const challenge = await this.redisCacheService.get(
      `challenge_${challengeId}`,
    );
    if (!challenge) {
      console.log('redis에 challenge 정보가 없습니다.');
      return null;
    }
    console.log('redis에 challenge 정보가 있습니다.');
    return JSON.parse(challenge);
  }

  validateChallengeDate(currentDate, challenge) {
    if (currentDate < challenge.startDate || currentDate > challenge.endDate) {
      return false;
    }
    return true;
  }
}
