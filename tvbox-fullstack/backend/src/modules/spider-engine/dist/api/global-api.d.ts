/**
 * 全局API
 * 提供与TVBox兼容的全局函数和对象
 */
export declare class GlobalAPI {
    private htmlParser;
    constructor();
    /**
     * HTTP请求模块
     */
    http: {
        /**
         * GET请求
         */
        get: (url: string, headers?: Record<string, string>) => Promise<{
            code: any;
            content: any;
            headers: any;
        }>;
        /**
         * POST请求
         */
        post: (url: string, data: any, headers?: Record<string, string>) => Promise<{
            code: any;
            content: any;
            headers: any;
        }>;
    };
    /**
     * HTML解析 - pdfh
     * 解析HTML元素
     */
    pdfh: (html: string, rule: string) => string;
    /**
     * HTML解析 - pdfa
     * 解析HTML数组
     */
    pdfa: (html: string, rule: string) => string[];
    /**
     * HTML解析 - pd
     * 解析并拼接URL
     */
    pd: (html: string, rule: string, addUrl: string) => string;
    /**
     * HTML解析 - pdfla
     * 解析列表
     */
    pdfla: (html: string, p1: string, listText: string, listUrl: string, addUrl: string) => string[];
    /**
     * 加密模块
     */
    crypto: {
        /**
         * MD5加密
         */
        MD5: (text: string) => string;
        /**
         * SHA256加密
         */
        SHA256: (text: string) => string;
        /**
         * SHA1加密
         */
        SHA1: (text: string) => string;
        /**
         * Base64编码
         */
        Base64: {
            encode: (text: string) => string;
            decode: (text: string) => string;
        };
        /**
         * AES加密
         */
        AES: {
            encrypt: (data: string, key: string) => string;
            decrypt: (encrypted: string, key: string) => string;
        };
    };
    /**
     * URL拼接
     */
    joinUrl: (parent: string, child: string) => string;
    /**
     * 简体转繁体
     */
    s2t: (text: string) => string;
    /**
     * 繁体转简体
     */
    t2s: (text: string) => string;
}
//# sourceMappingURL=global-api.d.ts.map