// src/logger.ts
import { createLogger, format, transports } from 'winston';
import 'dotenv/config';

const { LOG_LEVEL = 'info', LOG_FILE } = process.env;

// Map numeric LOG_LEVEL to winston levels
const logLevelMapping: { [key: string]: string } = {
  '0': 'error',
  '1': 'warn',
  '2': 'info',
  '3': 'verbose',
  '4': 'debug',
  '5': 'silly',
};

const level = logLevelMapping[LOG_LEVEL] || 'info';

const logger = createLogger({
  level: level,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.printf(({ timestamp, level, message, ...meta }) => {
      const metaString = meta[Symbol.for('splat')] ? JSON.stringify(meta[Symbol.for('splat')]) : '';
      return `${timestamp} ${level.toUpperCase()}: ${message} ${metaString}`;
    })
  ),
  transports: [
    new transports.File({ filename: LOG_FILE || 'app.log' }),
  ],
});

// No console transport to prevent logs from going to stdout

export default logger;
