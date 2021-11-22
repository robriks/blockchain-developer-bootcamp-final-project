"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEventDescription = exports.isFunctionDescription = void 0;
const isFunctionDescription = (item) => item.stateMutability !== undefined;
exports.isFunctionDescription = isFunctionDescription;
const isEventDescription = (item) => item.type === 'event';
exports.isEventDescription = isEventDescription;
//# sourceMappingURL=types.js.map