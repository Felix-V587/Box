"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let ConfigService = class ConfigService {
    constructor() {
        this.config = null;
    }
    async loadConfig(apiUrl) {
        try {
            console.log(`Loading config from: ${apiUrl}`);
            const response = await axios_1.default.get(apiUrl, {
                responseType: 'text',
                timeout: 60000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            });
            let content = response.data;
            console.log(`原始内容长度: ${content.length}`);
            const decryptedContent = this.findResult(content, null);
            console.log(`解密后内容长度: ${decryptedContent.length}`);
            const cleanContent = this.removeJsonComments(decryptedContent);
            console.log(`清理后内容长度: ${cleanContent.length}`);
            this.config = JSON.parse(cleanContent);
            console.log(`解析成功，站点数: ${this.config.sites?.length || 0}`);
            return this.config;
        }
        catch (error) {
            console.error('Config load failed:', error.message);
            console.error('Error details:', error);
            throw new Error(`Failed to load config: ${error.message}`);
        }
    }
    getConfig() {
        return this.config;
    }
    getSearchableSites() {
        if (!this.config || !this.config.sites) {
            return [];
        }
        return this.config.sites.filter(site => site.searchable === 1);
    }
    findResult(json, configKey) {
        let content = json;
        try {
            console.log('开始解密...');
            if (this.isJson(content)) {
                console.log('内容已是JSON格式');
                return content;
            }
            const base64Pattern = /[A-Za-z]{8}\*\*/;
            if (base64Pattern.test(content)) {
                console.log('检测到Base64编码');
                const match = content.match(base64Pattern);
                if (match) {
                    console.log(`找到Base64标记: ${match[0]}`);
                    const startIndex = content.indexOf(match[0]) + 10;
                    const base64Content = content.substring(startIndex);
                    console.log(`Base64内容长度: ${base64Content.length}`);
                    try {
                        content = Buffer.from(base64Content, 'base64').toString('utf8');
                        console.log('Base64解码成功');
                        console.log(`解码后内容长度: ${content.length}`);
                        console.log(`解码后前100字符: ${content.substring(0, 100)}`);
                    }
                    catch (e) {
                        console.error('Base64解码失败:', e);
                    }
                }
            }
            if (content.startsWith('2423')) {
                console.log('检测到AES-CBC加密');
                console.log('警告: AES-CBC解密暂未实现');
            }
            else if (configKey && !this.isJson(content)) {
                console.log('检测到需要AES-ECB解密');
                console.log('警告: AES-ECB解密暂未实现');
            }
            if (!this.isJson(content)) {
                console.log('警告: 解密后仍然不是有效的JSON格式');
            }
            return content;
        }
        catch (e) {
            console.error('解密错误:', e);
            return json;
        }
    }
    removeJsonComments(content) {
        let result = content;
        const lines = result.split('\n');
        const cleanedLines = [];
        for (const line of lines) {
            let cleanedLine = line;
            const slashIndex = line.indexOf('//');
            if (slashIndex !== -1) {
                const beforeSlash = line.substring(0, slashIndex);
                const quoteCount = (beforeSlash.match(/"/g) || []).length;
                if (quoteCount % 2 === 0) {
                    cleanedLine = beforeSlash;
                }
            }
            cleanedLines.push(cleanedLine);
        }
        result = cleanedLines.join('\n');
        result = result.replace(/\/\*[\s\S]*?\*\//g, '');
        result = result.replace(/,(\s*[}\]])/g, '$1');
        return result;
    }
    isJson(str) {
        try {
            JSON.parse(str);
            return true;
        }
        catch (e) {
            return false;
        }
    }
};
exports.ConfigService = ConfigService;
exports.ConfigService = ConfigService = __decorate([
    (0, common_1.Injectable)()
], ConfigService);
//# sourceMappingURL=config.service.js.map