import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { filterSensitiveInfo } from '../../utils/filter.util';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const message =
      exception instanceof HttpException ? exception.getResponse() : exception;

    // 민감 정보 필터링 적용
    const filteredBody = filterSensitiveInfo(request.body);
    const filteredHeaders = filterSensitiveInfo(request.headers);

    // 클라이언트 IP 추출
    const clientIp = request.headers['x-forwarded-for'] || request.ip;

    // 로그 메시지 구조화
    const logDetails = {
      status,
      message: typeof message === 'object' ? message : { message },
      request: {
        method: request.method,
        url: request.url,
        ip: clientIp,
        userAgent: request.headers['user-agent'],
        headers: filteredHeaders,
        body: filteredBody,
      },
      stack: exception instanceof Error ? exception.stack : undefined,
    };

    // 로그 출력
    this.logger.error('Exception Caught', logDetails);

    // 예외 응답 전송
    response.status(status).json({
      statusCode: status,
      message: typeof message === 'object' ? message.message : message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
