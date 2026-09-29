import winston from 'winston';
import { env } from '@/config/env';

const { combine, timestamp, json, errors, align, printf, colorize } =
  winston.format;

const consoleFormat =
  env.NODE_ENV !== 'production'
    ? combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD hh:mm:ss A' }),
        align(),
        printf(({ timestamp, level, message, ...meta }) => {
          const rest = Object.keys(meta).length
            ? `\n${JSON.stringify(meta)}`
            : '';
          return `${timestamp} [${level}] : ${message}${rest}`;
        }),
      )
    : combine(timestamp(), errors({ stack: true }), json());

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
  silent: env.NODE_ENV === 'test',
});

/** Pipe Morgan HTTP access logs into Winston */
const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export { logger, morganStream };
