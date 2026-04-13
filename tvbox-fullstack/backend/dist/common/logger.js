"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor(context) {
        this.context = context;
    }
    log(level, message, data) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level}] [${this.context}]`;
        if (data) {
            console.log(`${prefix} ${message}`, data);
        }
        else {
            console.log(`${prefix} ${message}`);
        }
    }
    debug(message, data) {
        this.log(LogLevel.DEBUG, message, data);
    }
    info(message, data) {
        this.log(LogLevel.INFO, message, data);
    }
    warn(message, data) {
        this.log(LogLevel.WARN, message, data);
    }
    error(message, data) {
        this.log(LogLevel.ERROR, message, data);
    }
    success(message, data) {
        console.log(`✓ [${this.context}] ${message}`, data || '');
    }
    fail(message, data) {
        console.log(`✗ [${this.context}] ${message}`, data || '');
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map