"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpiderErrorCode = exports.SpiderError = void 0;
exports.createSpiderError = createSpiderError;
exports.isSpiderError = isSpiderError;
exports.getErrorMessage = getErrorMessage;
/**
 * Spider错误类
 */
class SpiderError extends Error {
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'SpiderError';
    }
    toString() {
        return `[${this.code}] ${this.message}${this.details ? ` | ${JSON.stringify(this.details)}` : ''}`;
    }
}
exports.SpiderError = SpiderError;
/**
 * 错误代码枚举
 */
var SpiderErrorCode;
(function (SpiderErrorCode) {
    // 初始化错误
    SpiderErrorCode["INIT_FAILED"] = "INIT_FAILED";
    SpiderErrorCode["INIT_TIMEOUT"] = "INIT_TIMEOUT";
    // 执行错误
    SpiderErrorCode["EXEC_FAILED"] = "EXEC_FAILED";
    SpiderErrorCode["EXEC_TIMEOUT"] = "EXEC_TIMEOUT";
    SpiderErrorCode["METHOD_NOT_FOUND"] = "METHOD_NOT_FOUND";
    // 网络错误
    SpiderErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    SpiderErrorCode["NETWORK_TIMEOUT"] = "NETWORK_TIMEOUT";
    // 解析错误
    SpiderErrorCode["PARSE_ERROR"] = "PARSE_ERROR";
    SpiderErrorCode["JSON_PARSE_ERROR"] = "JSON_PARSE_ERROR";
    // 代码错误
    SpiderErrorCode["RUNTIME_ERROR"] = "RUNTIME_ERROR";
    SpiderErrorCode["SYNTAX_ERROR"] = "SYNTAX_ERROR";
    // 资源错误
    SpiderErrorCode["RESOURCE_LIMIT"] = "RESOURCE_LIMIT";
    SpiderErrorCode["MEMORY_LIMIT"] = "MEMORY_LIMIT";
    // 其他错误
    SpiderErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
})(SpiderErrorCode || (exports.SpiderErrorCode = SpiderErrorCode = {}));
/**
 * 创建Spider错误
 */
function createSpiderError(code, message, details) {
    return new SpiderError(message, code, details);
}
/**
 * 判断是否是Spider错误
 */
function isSpiderError(error) {
    return error instanceof SpiderError;
}
/**
 * 获取错误信息
 */
function getErrorMessage(error) {
    if (isSpiderError(error)) {
        return error.toString();
    }
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}
//# sourceMappingURL=errors.js.map