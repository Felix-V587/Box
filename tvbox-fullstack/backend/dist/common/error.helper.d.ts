export declare enum ErrorCode {
    CONFIG_LOAD_FAILED = "CONFIG_LOAD_FAILED",
    CONFIG_PARSE_FAILED = "CONFIG_PARSE_FAILED",
    CONFIG_DECRYPT_FAILED = "CONFIG_DECRYPT_FAILED",
    SPIDER_NOT_SUPPORTED = "SPIDER_NOT_SUPPORTED",
    SPIDER_EXECUTION_FAILED = "SPIDER_EXECUTION_FAILED",
    SPIDER_API_ERROR = "SPIDER_API_ERROR",
    SPIDER_TIMEOUT = "SPIDER_TIMEOUT",
    NETWORK_ERROR = "NETWORK_ERROR",
    NETWORK_TIMEOUT = "NETWORK_TIMEOUT",
    TVBOX_SERVER_UNAVAILABLE = "TVBOX_SERVER_UNAVAILABLE",
    DATA_PARSE_ERROR = "DATA_PARSE_ERROR",
    DATA_EMPTY = "DATA_EMPTY",
    DATA_INVALID = "DATA_INVALID",
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
}
export declare class SpiderError extends Error {
    code: ErrorCode;
    details?: any;
    constructor(code: ErrorCode, message: string, details?: any);
    toString(): string;
}
export declare class ErrorHelper {
    static createError(code: ErrorCode, message: string, details?: any): SpiderError;
    static getErrorMessage(error: any): string;
    static isNetworkError(error: any): boolean;
}
