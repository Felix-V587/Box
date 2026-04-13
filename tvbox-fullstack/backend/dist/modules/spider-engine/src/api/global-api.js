"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalAPI = void 0;
const axios_1 = require("axios");
const crypto_js_1 = require("crypto-js");
const html_parser_1 = require("../utils/html-parser");
class GlobalAPI {
    constructor() {
        this.http = {
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
        this.pdfh = (html, rule) => {
            return this.htmlParser.parseDomForUrl(html, rule, '');
        };
        this.pdfa = (html, rule) => {
            return this.htmlParser.parseDomForArray(html, rule);
        };
        this.pd = (html, rule, addUrl) => {
            return this.htmlParser.parseDomForUrl(html, rule, addUrl);
        };
        this.pdfla = (html, p1, listText, listUrl, addUrl) => {
            return this.htmlParser.parseDomForList(html, p1, listText, listUrl, addUrl);
        };
        this.crypto = {
            MD5: (text) => {
                return crypto_js_1.default.MD5(text).toString();
            },
            SHA256: (text) => {
                return crypto_js_1.default.SHA256(text).toString();
            },
            SHA1: (text) => {
                return crypto_js_1.default.SHA1(text).toString();
            },
            Base64: {
                encode: (text) => {
                    return crypto_js_1.default.enc.Base64.stringify(crypto_js_1.default.enc.Utf8.parse(text));
                },
                decode: (text) => {
                    return crypto_js_1.default.enc.Base64.parse(text).toString(crypto_js_1.default.enc.Utf8);
                },
            },
            AES: {
                encrypt: (data, key) => {
                    return crypto_js_1.default.AES.encrypt(data, key).toString();
                },
                decrypt: (encrypted, key) => {
                    return crypto_js_1.default.AES.decrypt(encrypted, key).toString(crypto_js_1.default.enc.Utf8);
                },
            },
        };
        this.joinUrl = (parent, child) => {
            try {
                return new URL(child, parent).href;
            }
            catch (error) {
                if (parent.endsWith('/')) {
                    return parent + child;
                }
                return parent + '/' + child;
            }
        };
        this.s2t = (text) => {
            return text;
        };
        this.t2s = (text) => {
            return text;
        };
        this.htmlParser = new html_parser_1.HtmlParser();
    }
}
exports.GlobalAPI = GlobalAPI;
//# sourceMappingURL=global-api.js.map