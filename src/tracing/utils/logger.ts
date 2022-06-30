import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  defaultMeta: { service: 'evolution-watcher' },
  transports: [
    //
    // - Write to all logs with level `info` and below to `evolution-watcher-combined.log`.
    // - Write all logs error (and below) to `evolution-watcher-error.log`.
    //
    new transports.File({
      filename: 'evolution-watcher-error.log',
      level: 'error',
    }),
    new transports.File({ filename: 'evolution-watcher-combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  );
}
