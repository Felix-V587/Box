import axios, { AxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';
import CryptoJS from 'crypto-js';
import { HtmlParser } from '../utils/html-parser';

/**
 * 全局API
 * 提供与TVBox兼容的全局函数和对象
 */
export class GlobalAPI {
    private htmlParser: HtmlParser;

    constructor() {
        this.htmlParser = new HtmlParser();
    }

    /**
     * HTTP请求模块
     */
    http = {
        /**
         * GET请求
         */
        get: async (url: string, headers?: Record<string, string>) => {
            try {
                const config: AxiosRequestConfig = {
                    headers: headers || {},
                    timeout: 30000,
                };

                const response = await axios.get(url, config);
                return {
                    code: response.status,
                    content: response.data,
                    headers: response.headers,
                };
            } catch (error: any) {
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
        post: async (
            url: string,
            data: any,
            headers?: Record<string, string>
        ) => {
            try {
                const config: AxiosRequestConfig = {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(headers || {}),
                    },
                    timeout: 30000,
                };

                const response = await axios.post(url, data, config);
                return {
                    code: response.status,
                    content: response.data,
                    headers: response.headers,
                };
            } catch (error: any) {
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
    pdfh = (html: string, rule: string): string => {
        return this.htmlParser.parseDomForUrl(html, rule, '');
    };

    /**
     * HTML解析 - pdfa
     * 解析HTML数组
     */
    pdfa = (html: string, rule: string): string[] => {
        return this.htmlParser.parseDomForArray(html, rule);
    };

    /**
     * HTML解析 - pd
     * 解析并拼接URL
     */
    pd = (html: string, rule: string, addUrl: string): string => {
        return this.htmlParser.parseDomForUrl(html, rule, addUrl);
    };

    /**
     * HTML解析 - pdfla
     * 解析列表
     */
    pdfla = (
        html: string,
        p1: string,
        listText: string,
        listUrl: string,
        addUrl: string
    ): string[] => {
        return this.htmlParser.parseDomForList(
            html,
            p1,
            listText,
            listUrl,
            addUrl
        );
    };

    /**
     * 加密模块
     */
    crypto = {
        /**
         * MD5加密
         */
        MD5: (text: string): string => {
            return CryptoJS.MD5(text).toString();
        },

        /**
         * SHA256加密
         */
        SHA256: (text: string): string => {
            return CryptoJS.SHA256(text).toString();
        },

        /**
         * SHA1加密
         */
        SHA1: (text: string): string => {
            return CryptoJS.SHA1(text).toString();
        },

        /**
         * Base64编码
         */
        Base64: {
            encode: (text: string): string => {
                return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text));
            },
            decode: (text: string): string => {
                return CryptoJS.enc.Base64.parse(text).toString(CryptoJS.enc.Utf8);
            },
        },

        /**
         * AES加密
         */
        AES: {
            encrypt: (data: string, key: string): string => {
                return CryptoJS.AES.encrypt(data, key).toString();
            },
            decrypt: (encrypted: string, key: string): string => {
                return CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8);
            },
        },
    };

    /**
     * URL拼接
     */
    joinUrl = (parent: string, child: string): string => {
        try {
            return new URL(child, parent).href;
        } catch (error) {
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
    s2t = (text: string): string => {
        // 简化实现，实际应该使用完整的转换表
        // 这里返回原文本，实际应用中需要实现转换逻辑
        return text;
    };

    /**
     * 繁体转简体
     */
    t2s = (text: string): string => {
        // 简化实现，实际应该使用完整的转换表
        // 这里返回原文本，实际应用中需要实现转换逻辑
        return text;
    };
}
