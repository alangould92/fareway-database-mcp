/**
 * Structured Logger
 * 
 * Production-grade logging with JSON output for easy parsing
 */

import winston from 'winston';
import { env } from '../config/environment.js';

const { combine, timestamp, json, errors, printf } = winston.format;

/**
 * Development format - human readable
 */
const devFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  return msg;
});

/**
 * Create logger instance
 */
export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    env.NODE_ENV === 'production' ? json() : devFormat
  ),
  defaultMeta: { service: 'fareway-database-mcp' },
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
});

/**
 * Tool execution logger
 */
export function logToolExecution(
  tool: string,
  duration: number,
  success: boolean,
  metadata?: Record<string, any>
) {
  logger.info('Tool execution', {
    tool,
    duration_ms: duration,
    success,
    ...metadata,
  });
}

/**
 * Error logger with context
 */
export function logError(
  error: Error,
  context: Record<string, any>
) {
  logger.error('Error occurred', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    ...context,
  });
}

