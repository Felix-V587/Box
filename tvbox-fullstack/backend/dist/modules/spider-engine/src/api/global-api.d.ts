export declare class GlobalAPI {
    private htmlParser;
    constructor();
    http: {
        get: (url: string, headers?: Record<string, string>) => Promise<{
            code: any;
            content: any;
            headers: any;
        }>;
        post: (url: string, data: any, headers?: Record<string, string>) => Promise<{
            code: any;
            content: any;
            headers: any;
        }>;
    };
    pdfh: (html: string, rule: string) => string;
    pdfa: (html: string, rule: string) => string[];
    pd: (html: string, rule: string, addUrl: string) => string;
    pdfla: (html: string, p1: string, listText: string, listUrl: string, addUrl: string) => string[];
    crypto: {
        MD5: (text: string) => string;
        SHA256: (text: string) => string;
        SHA1: (text: string) => string;
        Base64: {
            encode: (text: string) => string;
            decode: (text: string) => string;
        };
        AES: {
            encrypt: (data: string, key: string) => string;
            decrypt: (encrypted: string, key: string) => string;
        };
    };
    joinUrl: (parent: string, child: string) => string;
    s2t: (text: string) => string;
    t2s: (text: string) => string;
}
