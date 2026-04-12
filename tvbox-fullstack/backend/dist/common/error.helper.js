"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHelper = exports.SpiderError = exports.ErrorCode = void 0;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["CONFIG_LOAD_FAILED"] = "CONFIG_LOAD_FAILED";
    ErrorCode["CONFIG_PARSE_FAILED"] = "CONFIG_PARSE_FAILED";
    ErrorCode["CONFIG_DECRYPT_FAILED"] = "CONFIG_DECRYPT_FAILED";
    ErrorCode["SPIDER_NOT_SUPPORTED"] = "SPIDER_NOT_SUPPORTED";
    ErrorCode["SPIDER_EXECUTION_FAILED"] = "SPIDER_EXECUTION_FAILED";
    ErrorCode["SPIDER_API_ERROR"] = "SPIDER_API_ERROR";
    ErrorCode["SPIDER_TIMEOUT"] = "SPIDER_TIMEOUT";
    ErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    ErrorCode["NETWORK_TIMEOUT"] = "NETWORK_TIMEOUT";
    ErrorCode["TVBOX_SERVER_UNAVAILABLE"] = "TVBOX_SERVER_UNAVAILABLE";
    ErrorCode["DATA_PARSE_ERROR"] = "DATA_PARSE_ERROR";
    ErrorCode["DATA_EMPTY"] = "DATA_EMPTY";
    ErrorCode["DATA_INVALID"] = "DATA_INVALID";
    ErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
class SpiderError extends Error {
    constructor(code, message, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'SpiderError';
    }
    toString() {
        return `[${this.code}] ${this.message}${this.details ? ` | Details: ${JSON.stringify(this.details)}` : ''}`;
    }
}
exports.SpiderError = SpiderError;
class ErrorHelper {
    static createError(code, message, details) {
        return new SpiderError(code, message, details);
    }
    static getErrorMessage(error) {
        if (error instanceof SpiderError) {
            return error.toString();
        }
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            return `HTTP ${status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`;
        }
        if (error.code === 'ECONNABORTED') {
            return '请求超时';
        }
        if (error.code === 'ENOTFOUND') {
            return 'DNS解析失败';
        }
        if (error.code === 'ECONNREFUSED') {
            return '连接被拒绝';
        }
        return error.message || '未知错误';
    }
    static isNetworkError(error) {
        return error.code === 'ECONNABORTED' ||
            error.code === 'ENOTFOUND' ||
            error.code === 'ECONNREFUSED' ||
            error.code === 'ETIMEDOUT';
    }
}
exports.ErrorHelper = ErrorHelper;
//# sourceMappingURL=error.helper.js.map