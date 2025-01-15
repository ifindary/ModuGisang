import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { winstonLogger } from '../../config/logger.config';
import { filterSensitiveInfo } from 'src/utils/filter.util';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, headers, body } = request;

    const clientIp = headers['x-forwarded-for'] || request.ip;
    const userAgent = headers['user-agent'];

    // 헬스체크 요청 무시
    if (userAgent?.includes('ELB-HealthChecker')) {
      return next.handle();
    }

    // 요청 정보 로깅
    winstonLogger.log('Request Info', {
      method,
      url,
      clientIp,
      userAgent,
      headers: filterSensitiveInfo(headers),
      body: filterSensitiveInfo(body),
    });

    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        // 응답 시간 로깅
        const responseTime = Date.now() - now;
        winstonLogger.log(`Response Time: ${responseTime}ms`);
      }),
    );
  }
}
