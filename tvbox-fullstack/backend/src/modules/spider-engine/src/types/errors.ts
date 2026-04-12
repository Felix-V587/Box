/**
 * Spider错误类
 */
export class SpiderError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: any
    ) {
        super(message);
        this.name = 'SpiderError';
    }

    toString(): string {
        return `[${this.code}] ${this.message}${this.details ? ` | ${JSON.stringify(this.details)}` : ''}`;
    }
}

/**
 * 错误代码枚举
 */
export enum SpiderErrorCode {
    // 初始化错误
    INIT_FAILED = 'INIT_FAILED',
    INIT_TIMEOUT = 'INIT_TIMEOUT',

    // 执行错误
    EXEC_FAILED = 'EXEC_FAILED',
    EXEC_TIMEOUT = 'EXEC_TIMEOUT',
    METHOD_NOT_FOUND = 'METHOD_NOT_FOUND',

    // 网络错误
    NETWORK_ERROR = 'NETWORK_ERROR',
    NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',

    // 解析错误
    PARSE_ERROR = 'PARSE_ERROR',
    JSON_PARSE_ERROR = 'JSON_PARSE_ERROR',

    // 代码错误
    RUNTIME_ERROR = 'RUNTIME_ERROR',
    SYNTAX_ERROR = 'SYNTAX_ERROR',

    // 资源错误
    RESOURCE_LIMIT = 'RESOURCE_LIMIT',
    MEMORY_LIMIT = 'MEMORY_LIMIT',

    // 其他错误
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * 创建Spider错误
 */
export function createSpiderError(
    code: SpiderErrorCode,
    message: string,
    details?: any
): SpiderError {
    return new SpiderError(message, code, details);
}

/**
 * 判断是否是Spider错误
 */
export function isSpiderError(error: any): error is SpiderError {
    return error instanceof SpiderError;
}

/**
 * 获取错误信息
 */
export function getErrorMessage(error: any): string {
    if (isSpiderError(error)) {
        return error.toString();
    }
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}
