// health-check.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HealthCheckAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 요청 헤더에서 API 키를 가져옵니다.
    const apiKey = req.headers['x-api-key'];

    // API 키를 검증합니다.
    if (apiKey === process.env.HEALTH_CHECK_API_KEY) {
      next(); // 인증이 성공하면 다음 미들웨어로 이동
    } else {
      res.status(403).json({ message: 'Forbidden' }); // 인증 실패
    }
  }
}
