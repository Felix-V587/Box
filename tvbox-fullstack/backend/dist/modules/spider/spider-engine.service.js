"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpiderEngine = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let SpiderEngine = class SpiderEngine {
    async search(site, keyword) {
        try {
            const api = site.api || '';
            if (api.includes('csp_AppSx') || api.includes('csp_AppTT')) {
                return await this.searchAppSx(site, keyword);
            }
            else if (api.includes('csp_T4')) {
                return await this.searchT4(site, keyword);
            }
            else if (api.includes('csp_XPath')) {
                return await this.searchXPath(site, keyword);
            }
            else if (api.includes('http')) {
                return await this.searchHttp(site, keyword);
            }
            else {
                return { list: [] };
            }
        }
        catch (error) {
            console.error(`Spider search error for ${site.name}:`, error.message);
            return { list: [] };
        }
    }
    async detail(site, videoId) {
        try {
            const api = site.api || '';
            if (api.includes('csp_AppSx') || api.includes('csp_AppTT')) {
                return await this.detailAppSx(site, videoId);
            }
            else if (api.includes('csp_T4')) {
                return await this.detailT4(site, videoId);
            }
            else {
                return null;
            }
        }
        catch (error) {
            console.error(`Spider detail error for ${site.name}:`, error.message);
            return null;
        }
    }
    async searchAppSx(site, keyword) {
        try {
            const ext = site.ext;
            let apiUrl = '';
            if (typeof ext === 'string' && ext.startsWith('http')) {
                apiUrl = 'https://api.example.com';
            }
            else if (typeof ext === 'object' && ext.siteUrl) {
                apiUrl = ext.siteUrl;
            }
            if (!apiUrl) {
                return { list: [] };
            }
            const response = await axios_1.default.get(`${apiUrl}/api.php/provide/vod/`, {
                params: {
                    ac: 'list',
                    wd: keyword
                },
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            if (response.data && response.data.list) {
                return { list: response.data.list };
            }
            return { list: [] };
        }
        catch (error) {
            return { list: [] };
        }
    }
    async searchT4(site, keyword) {
        try {
            const ext = site.ext;
            if (!ext) {
                return { list: [] };
            }
            return { list: [] };
        }
        catch (error) {
            return { list: [] };
        }
    }
    async searchXPath(site, keyword) {
        try {
            return { list: [] };
        }
        catch (error) {
            return { list: [] };
        }
    }
    async searchHttp(site, keyword) {
        try {
            const apiUrl = site.api;
            if (!apiUrl || !apiUrl.startsWith('http')) {
                return { list: [] };
            }
            const response = await axios_1.default.get(apiUrl, {
                params: {
                    ac: 'list',
                    wd: keyword
                },
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            if (response.data && response.data.list) {
                return { list: response.data.list };
            }
            return { list: [] };
        }
        catch (error) {
            return { list: [] };
        }
    }
    async detailAppSx(site, videoId) {
        try {
            const ext = site.ext;
            let apiUrl = '';
            if (typeof ext === 'object' && ext.siteUrl) {
                apiUrl = ext.siteUrl;
            }
            if (!apiUrl) {
                return null;
            }
            const response = await axios_1.default.get(`${apiUrl}/api.php/provide/vod/`, {
                params: {
                    ac: 'detail',
                    ids: videoId
                },
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            if (response.data && response.data.list && response.data.list.length > 0) {
                return response.data.list[0];
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    async detailT4(site, videoId) {
        try {
            return null;
        }
        catch (error) {
            return null;
        }
    }
};
exports.SpiderEngine = SpiderEngine;
exports.SpiderEngine = SpiderEngine = __decorate([
    (0, common_1.Injectable)()
], SpiderEngine);
//# sourceMappingURL=spider-engine.service.js.map