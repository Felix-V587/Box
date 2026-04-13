/**
 * Spider错误类
 */
export declare class SpiderError extends Error {
    code: string;
    details?: any | undefined;
    constructor(message: string, code: string, details?: any | undefined);
    toString(): string;
}
/**
 * 错误代码枚举
 */
export declare enum SpiderErrorCode {
    INIT_FAILED = "INIT_FAILED",
    INIT_TIMEOUT = "INIT_TIMEOUT",
    EXEC_FAILED = "EXEC_FAILED",
    EXEC_TIMEOUT = "EXEC_TIMEOUT",
    METHOD_NOT_FOUND = "METHOD_NOT_FOUND",
    NETWORK_ERROR = "NETWORK_ERROR",
    NETWORK_TIMEOUT = "NETWORK_TIMEOUT",
    PARSE_ERROR = "PARSE_ERROR",
    JSON_PARSE_ERROR = "JSON_PARSE_ERROR",
    RUNTIME_ERROR = "RUNTIME_ERROR",
    SYNTAX_ERROR = "SYNTAX_ERROR",
    RESOURCE_LIMIT = "RESOURCE_LIMIT",
    MEMORY_LIMIT = "MEMORY_LIMIT",
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
}
/**
 * 创建Spider错误
 */
export declare function createSpiderError(code: SpiderErrorCode, message: string, details?: any): SpiderError;
/**
 * 判断是否是Spider错误
 */
export declare function isSpiderError(error: any): error is SpiderError;
/**
 * 获取错误信息
 */
export declare function getErrorMessage(error: any): string;
//# sourceMappingURL=errors.d.ts.map