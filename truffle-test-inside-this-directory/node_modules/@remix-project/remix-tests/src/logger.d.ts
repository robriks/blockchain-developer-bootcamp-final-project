import { Logger, LoggerOptions } from 'winston';
declare class Log {
    logger: Logger;
    constructor();
    setVerbosity(v: LoggerOptions['level']): void;
}
export = Log;
