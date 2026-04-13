"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("../config/config.service");
const axios_1 = require("axios");
const logger_1 = require("../../common/logger");
const error_helper_1 = require("../../common/error.helper");
const spider_engine_1 = require("@tvbox/spider-engine");
let SearchService = class SearchService {
    constructor(configService, spiderManager) {
        this.configService = configService;
        this.spiderManager = spiderManager;
        this.logger = new logger_1.Logger('SearchService');
    }
    destroy() {
        this.spiderManager.destroyAll();
    }
    async search(keyword, quickSearch = false, timeout = 15000, concurrency = 5) {
        const startTime = Date.now();
        const sites = this.configService.getSearchableSites();
        this.logger.info(`开始搜索: "${keyword}"`);
        this.logger.info(`目标站点数: ${sites.length}`);
        const results = [];
        const batches = this.chunkArray(sites, concurrency);
        for (let i = 0; i < batches.length; i++) {
            this.logger.debug(`执行批次 ${i + 1}/${batches.length}`);
            const batchResults = await Promise.all(batches[i].map(site => this.searchSite(site, keyword, timeout)));
            results.push(...batchResults);
        }
        const successSites = results.filter(r => !r.error && r.videos.length > 0).length;
        const failedSites = results.filter(r => r.error).length;
        const totalVideos = results.reduce((sum, r) => sum + r.videos.length, 0);
        const duration = Date.now() - startTime;
        this.logger.info(`搜索完成: 成功${successSites}个站点, 失败${failedSites}个站点, 共${totalVideos}个结果`);
        return {
            keyword,
            totalSites: sites.length,
            successSites,
            failedSites,
            totalVideos,
            results,
            duration,
        };
    }
    async searchSite(site, keyword, timeout) {
        const result = {
            siteKey: site.key,
            siteName: site.name,
            videos: [],
        };
        try {
            this.logger.debug(`[${site.name}] 尝试Spider引擎执行`);
            const spiderResult = await this.executeSpider(site, keyword);
            if (spiderResult && spiderResult.list && spiderResult.list.length > 0) {
                result.videos = spiderResult.list;
                this.logger.success(`[${site.name}] Spider执行成功: ${result.videos.length}个结果`);
                return result;
            }
            this.logger.debug(`[${site.name}] Spider执行失败，尝试TVBox服务器`);
            const tvboxResult = await this.searchTVBox(site, keyword);
            if (tvboxResult && tvboxResult.list && tvboxResult.list.length > 0) {
                result.videos = tvboxResult.list;
                this.logger.success(`[${site.name}] TVBox服务器成功: ${result.videos.length}个结果`);
                return result;
            }
            result.error = `站点 ${site.name} 暂不支持或无法访问`;
            result.errorCode = error_helper_1.ErrorCode.SPIDER_NOT_SUPPORTED;
            result.errorDetails = {
                siteKey: site.key,
                api: site.api,
                type: this.getSpiderType(site.api)
            };
            this.logger.warn(`[${site.name}] 不支持或无法访问`, result.errorDetails);
        }
        catch (error) {
            result.error = error_helper_1.ErrorHelper.getErrorMessage(error);
            result.errorCode = error_helper_1.ErrorHelper.isNetworkError(error) ? error_helper_1.ErrorCode.NETWORK_ERROR : error_helper_1.ErrorCode.SPIDER_EXECUTION_FAILED;
            result.errorDetails = {
                originalError: error.message,
                stack: error.stack
            };
            this.logger.fail(`[${site.name}] 执行失败: ${result.error}`);
        }
        return result;
    }
    async executeSpider(site, keyword) {
        const api = site.api || '';
        const spiderType = this.getSpiderType(api);
        this.logger.debug(`[${site.name}] Spider类型: ${spiderType}`);
        if (spiderType === 'Unknown' || api.startsWith('http')) {
            try {
                this.logger.debug(`[${site.name}] 使用Spider引擎执行`);
                const spider = await this.spiderManager.loadSpider({
                    key: site.key,
                    api: api,
                    ext: site.ext ? JSON.stringify(site.ext) : '',
                });
                if (spider) {
                    const result = await spider.search(keyword, false);
                    if (result) {
                        return JSON.parse(result);
                    }
                }
            }
            catch (error) {
                this.logger.debug(`[${site.name}] Spider引擎执行失败: ${error.message}`);
            }
        }
        switch (spiderType) {
            case 'AppSx':
                return await this.searchAppSx(site, keyword);
            case 'T4':
                return await this.searchT4(site, keyword);
            case 'XPath':
                return await this.searchXPath(site, keyword);
            case 'ZPan':
                return await this.searchZPan(site, keyword);
            default:
                this.logger.debug(`[${site.name}] 不支持的Spider类型: ${spiderType}`);
                return null;
        }
    }
    getSpiderManager() {
        return this.spiderManager;
    }
    getSpiderManager() {
        return this.spiderManager;
    }
    getSpiderType(api) {
        if (api.includes('csp_AppSx') || api.includes('csp_AppTT'))
            return 'AppSx';
        if (api.includes('csp_T4'))
            return 'T4';
        if (api.includes('csp_XPath'))
            return 'XPath';
        if (api.includes('csp_S_zps'))
            return 'ZPan';
        return 'Unknown';
    }
    async searchAppSx(site, keyword) {
        try {
            const ext = site.ext;
            let apiUrl = '';
            if (typeof ext === 'object' && ext.siteUrl) {
                apiUrl = ext.siteUrl;
            }
            if (!apiUrl) {
                throw error_helper_1.ErrorHelper.createError(error_helper_1.ErrorCode.DATA_INVALID, 'AppSx站点缺少siteUrl配置', { site: site.key, ext });
            }
            this.logger.debug(`[${site.name}] AppSx API: ${apiUrl}`);
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
            if (!response.data) {
                throw error_helper_1.ErrorHelper.createError(error_helper_1.ErrorCode.DATA_EMPTY, 'API返回空数据');
            }
            return response.data;
        }
        catch (error) {
            if (error instanceof error_helper_1.SpiderError) {
                throw error;
            }
            throw error_helper_1.ErrorHelper.createError(error_helper_1.ErrorCode.SPIDER_API_ERROR, `AppSx搜索失败: ${error_helper_1.ErrorHelper.getErrorMessage(error)}`, { originalError: error.message });
        }
    }
    async searchT4(site, keyword) {
        this.logger.debug(`[${site.name}] T4引擎暂未实现`);
        throw error_helper_1.ErrorHelper.createError(error_helper_1.ErrorCode.SPIDER_NOT_SUPPORTED, 'T4引擎暂未实现', { site: site.key });
    }
    async searchXPath(site, keyword) {
        this.logger.debug(`[${site.name}] XPath解析暂未实现`);
        throw error_helper_1.ErrorHelper.createError(error_helper_1.ErrorCode.SPIDER_NOT_SUPPORTED, 'XPath解析暂未实现', { site: site.key });
    }
    async searchZPan(site, keyword) {
        this.logger.debug(`[${site.name}] ZPan搜索暂未实现`);
        throw error_helper_1.ErrorHelper.createError(error_helper_1.ErrorCode.SPIDER_NOT_SUPPORTED, 'ZPan搜索暂未实现', { site: site.key });
    }
    async searchTVBox(site, keyword) {
        const tvboxServer = 'http://127.0.0.1:9978';
        try {
            this.logger.debug(`[${site.name}] 尝试连接TVBox: ${tvboxServer}`);
            const response = await axios_1.default.get(`${tvboxServer}/api`, {
                params: {
                    do: 'search',
                    id: site.key,
                    wd: keyword
                },
                timeout: 5000
            });
            return response.data;
        }
        catch (error) {
            this.logger.debug(`[${site.name}] TVBox服务器不可用: ${error_helper_1.ErrorHelper.getErrorMessage(error)}`);
            return null;
        }
    }
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('SPIDER_MANAGER')),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        spider_engine_1.SpiderManager])
], SearchService);
//# sourceMappingURL=search.service.js.map