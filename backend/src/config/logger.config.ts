import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { transports } from 'winston';
import 'winston-daily-rotate-file';

const isProduction = process.env['IS_Production'] === 'false';
const logDir = __dirname + '/../../logs'; // 이 위치 폴더에 로그 파일 생성 -> 폴더 없어도 자동생성

export const winstonLogger = WinstonModule.createLogger({
  transports: [
    // 콘솔에 로그를 출력하는 설정
    new transports.Console({
      format: winston.format.combine(
        // 시간 추가
        winston.format.timestamp(),
        winston.format.simple(),
      ),
    }),
    // 파일에 로그를 기록하는 설정
    new transports.File({
      filename: 'application.log',
      dirname: logDir,
      level: isProduction ? 'info' : 'debug',
      format: winston.format.combine(
        // 시간 추가 -> 이 내용이 있어야 파일 로그에도 시간이 기록가능
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    // 일별로 로그 파일을 생성하는 설정
    new winston.transports.DailyRotateFile({
      filename: 'application-%DATE%.log',
      dirname: logDir,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: isProduction ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});
