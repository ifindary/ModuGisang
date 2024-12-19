import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { OpenVidu, OpenViduRole } from 'openvidu-node-client';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/users/users.service';

@Injectable()
export class OpenviduService {
  private openvidu: OpenVidu;
  private OPENVIDU_URL = this.configService.get<string>('OPENVIDU_URL');
  private OPENVIDU_SECRET = this.configService.get<string>('OPENVIDU_SECRET');

  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    this.openvidu = new OpenVidu(this.OPENVIDU_URL, this.OPENVIDU_SECRET);
  }

  async openviduTotalService(body: any) {
    try {
      const session = await this.findSession(body.userData.challengeId);
      return session
        ? await this.createToken(session.sessionId, body)
        : await this.handleNoSessionFound(body);
    } catch (error) {
      return await this.handleNoSessionFound(body);
    }
  }

  async createToken(sessionId: string, body: any) {
    const session = await this.findSession(sessionId);

    if (!session) {
      throw new HttpException(
        '해당 세션을 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }

    // 동일한 유저의 기존 연결을 찾는 로직
    const existingConnection = session.connections.find((conn) => {
      const data = JSON.parse(conn.serverData);
      return data.userId === body.userData.userId;
    });

    if (existingConnection) {
      // 기존 연결이 존재하는 경우 해당 연결의 토큰을 반환
      return existingConnection.token;
    }
    const tokenOptions = {
      data: `{"userId": "${body.userData.userId}", "userName": "${body.userData.userName}"}`,
      role: OpenViduRole.PUBLISHER,
    };

    try {
      const response = await session.generateToken(tokenOptions);
      await this.userService.saveOpenviduToken(body.userData.userId, response);
      return response;
    } catch (error) {
      throw new HttpException(
        '서버 에러로 인해 해당 방에 참여할 수 없습니다.: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findSession(challengeId: string) {
    await this.updateActiveSessions();
    return this.openvidu.activeSessions.find(
      (s) => s.sessionId === challengeId,
    );
  }

  async handleNoSessionFound(body: any) {
    try {
      const session = await this.openvidu.createSession({
        customSessionId: body.userData.challengeId,
      });
      return this.createToken(session.sessionId, body);
    } catch (error) {
      throw new HttpException(
        '세션 생성에 실패하였습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateActiveSessions() {
    try {
      await this.openvidu.fetch(); // 세션 목록을 업데이트
      this.openvidu.activeSessions.forEach((s) =>
        console.log('sessionlist : ' + s.sessionId),
      );
    } catch (error) {
      console.error('Error fetching active sessions:', error);
    }
  }
}
