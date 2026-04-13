"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalAPI = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const html_parser_1 = require("../utils/html-parser");
/**
 * 全局API
 * 提供与TVBox兼容的全局函数和对象
 */
class GlobalAPI {
    constructor() {
        /**
         * HTTP请求模块
         */
        this.http = {
            /**
             * GET请求
             */
            get: async (url, headers) => {
                try {
                    const config = {
                        headers: headers || {},
                        timeout: 30000,
                    };
                    const response = await axios_1.default.get(url, config);
                    return {
                        code: response.status,
                        content: response.data,
                        headers: response.headers,
                    };
                }
                catch (error) {
                    if (error.response) {
                        return {
                            code: error.response.status,
                            content: error.response.data,
                            headers: error.response.headers,
                        };
                    }
                    throw error;
                }
            },
            /**
             * POST请求
             */
            post: async (url, data, headers) => {
                try {
                    const config = {
                        headers: {
                            'Content-Type': 'application/json',
                            ...(headers || {}),
                        },
                        timeout: 30000,
                    };
                    const response = await axios_1.default.post(url, data, config);
                    return {
                        code: response.status,
                        content: response.data,
                        headers: response.headers,
                    };
                }
                catch (error) {
                    if (error.response) {
                        return {
                            code: error.response.status,
                            content: error.response.data,
                            headers: error.response.headers,
                        };
                    }
                    throw error;
                }
            },
        };
        /**
         * HTML解析 - pdfh
         * 解析HTML元素
         */
        this.pdfh = (html, rule) => {
            return this.htmlParser.parseDomForUrl(html, rule, '');
        };
        /**
         * HTML解析 - pdfa
         * 解析HTML数组
         */
        this.pdfa = (html, rule) => {
            return this.htmlParser.parseDomForArray(html, rule);
        };
        /**
         * HTML解析 - pd
         * 解析并拼接URL
         */
        this.pd = (html, rule, addUrl) => {
            return this.htmlParser.parseDomForUrl(html, rule, addUrl);
        };
        /**
         * HTML解析 - pdfla
         * 解析列表
         */
        this.pdfla = (html, p1, listText, listUrl, addUrl) => {
            return this.htmlParser.parseDomForList(html, p1, listText, listUrl, addUrl);
        };
        /**
         * 加密模块
         */
        this.crypto = {
            /**
             * MD5加密
             */
            MD5: (text) => {
                return crypto_js_1.default.MD5(text).toString();
            },
            /**
             * SHA256加密
             */
            SHA256: (text) => {
                return crypto_js_1.default.SHA256(text).toString();
            },
            /**
             * SHA1加密
             */
            SHA1: (text) => {
                return crypto_js_1.default.SHA1(text).toString();
            },
            /**
             * Base64编码
             */
            Base64: {
                encode: (text) => {
                    return crypto_js_1.default.enc.Base64.stringify(crypto_js_1.default.enc.Utf8.parse(text));
                },
                decode: (text) => {
                    return crypto_js_1.default.enc.Base64.parse(text).toString(crypto_js_1.default.enc.Utf8);
                },
            },
            /**
             * AES加密
             */
            AES: {
                encrypt: (data, key) => {
                    return crypto_js_1.default.AES.encrypt(data, key).toString();
                },
                decrypt: (encrypted, key) => {
                    return crypto_js_1.default.AES.decrypt(encrypted, key).toString(crypto_js_1.default.enc.Utf8);
                },
            },
        };
        /**
         * URL拼接
         */
        this.joinUrl = (parent, child) => {
            try {
                return new URL(child, parent).href;
            }
            catch (error) {
                // 如果URL解析失败，简单拼接
                if (parent.endsWith('/')) {
                    return parent + child;
                }
                return parent + '/' + child;
            }
        };
        /**
         * 简体转繁体
         */
        this.s2t = (text) => {
            // 简化实现，实际应该使用完整的转换表
            // 这里返回原文本，实际应用中需要实现转换逻辑
            return text;
        };
        /**
         * 繁体转简体
         */
        this.t2s = (text) => {
            // 简化实现，实际应该使用完整的转换表
            // 这里返回原文本，实际应用中需要实现转换逻辑
            return text;
        };
        this.htmlParser = new html_parser_1.HtmlParser();
    }
}
exports.GlobalAPI = GlobalAPI;
//# sourceMappingURL=global-api.js.map