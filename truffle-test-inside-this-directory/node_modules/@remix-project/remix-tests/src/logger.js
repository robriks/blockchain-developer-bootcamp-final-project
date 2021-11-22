"use strict";
const tslib_1 = require("tslib");
const colors_1 = (0, tslib_1.__importDefault)(require("colors"));
const winston_1 = (0, tslib_1.__importDefault)(require("winston"));
const time_stamp_1 = (0, tslib_1.__importDefault)(require("time-stamp"));
const color_support_1 = (0, tslib_1.__importDefault)(require("color-support"));
function hasFlag(flag) {
    return ((typeof (process) !== 'undefined') && (process.argv.indexOf('--' + flag) !== -1));
}
function addColor(str) {
    if (hasFlag('no-color')) {
        return str;
    }
    if (hasFlag('color')) {
        return colors_1.default.gray(str);
    }
    if ((0, color_support_1.default)()) {
        return colors_1.default.gray(str);
    }
    return str;
}
function getTimestamp() {
    return '[' + addColor((0, time_stamp_1.default)('HH:mm:ss')) + ']';
}
// create winston logger format
const logFmt = winston_1.default.format.printf((info) => {
    return `${getTimestamp()} ${info.level}: ${info.message}`;
});
class Log {
    constructor() {
        this.logger = winston_1.default.createLogger({
            level: 'info',
            transports: [new winston_1.default.transports.Console()],
            format: winston_1.default.format.combine(winston_1.default.format.colorize({ all: true }), logFmt)
        });
    }
    setVerbosity(v) {
        this.logger.configure({
            level: v,
            transports: [new winston_1.default.transports.Console()],
            format: winston_1.default.format.combine(winston_1.default.format.colorize({ all: true }), logFmt)
        });
    }
}
module.exports = Log;
//# sourceMappingURL=logger.js.map