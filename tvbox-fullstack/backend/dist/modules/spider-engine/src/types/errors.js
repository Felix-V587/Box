"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpiderErrorCode = exports.SpiderError = void 0;
exports.createSpiderError = createSpiderError;
exports.isSpiderError = isSpiderError;
exports.getErrorMessage = getErrorMessage;
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
var SpiderErrorCode;
(function (SpiderErrorCode) {
    SpiderErrorCode["INIT_FAILED"] = "INIT_FAILED";
    SpiderErrorCode["INIT_TIMEOUT"] = "INIT_TIMEOUT";
    SpiderErrorCode["EXEC_FAILED"] = "EXEC_FAILED";
    SpiderErrorCode["EXEC_TIMEOUT"] = "EXEC_TIMEOUT";
    SpiderErrorCode["METHOD_NOT_FOUND"] = "METHOD_NOT_FOUND";
    SpiderErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    SpiderErrorCode["NETWORK_TIMEOUT"] = "NETWORK_TIMEOUT";
    SpiderErrorCode["PARSE_ERROR"] = "PARSE_ERROR";
    SpiderErrorCode["JSON_PARSE_ERROR"] = "JSON_PARSE_ERROR";
    SpiderErrorCode["RUNTIME_ERROR"] = "RUNTIME_ERROR";
    SpiderErrorCode["SYNTAX_ERROR"] = "SYNTAX_ERROR";
    SpiderErrorCode["RESOURCE_LIMIT"] = "RESOURCE_LIMIT";
    SpiderErrorCode["MEMORY_LIMIT"] = "MEMORY_LIMIT";
    SpiderErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
})(SpiderErrorCode || (exports.SpiderErrorCode = SpiderErrorCode = {}));
function createSpiderError(code, message, details) {
    return new SpiderError(message, code, details);
}
function isSpiderError(error) {
    return error instanceof SpiderError;
}
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