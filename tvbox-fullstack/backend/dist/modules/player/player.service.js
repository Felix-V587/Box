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
exports.PlayerService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const spider_engine_1 = require("@tvbox/spider-engine");
const logger_1 = require("../../common/logger");
const config_service_1 = require("../config/config.service");
let PlayerService = class PlayerService {
    constructor(spiderManager, configService) {
        this.spiderManager = spiderManager;
        this.configService = configService;
        this.logger = new logger_1.Logger('PlayerService');
    }
    destroy() {
        this.spiderManager.destroyAll();
    }
    async getPlayInfo(siteKey, siteName, videoId, videoName) {
        this.logger.info(`获取播放信息: ${siteName} - ${videoId}`);
        const tvboxResult = await this.getPlayInfoFromTVBox(siteKey, videoId);
        if (tvboxResult) {
            this.logger.success(`从TVBox服务器获取成功`);
            return tvboxResult;
        }
        this.logger.debug(`尝试从Spider引擎获取`);
        const spiderResult = await this.getPlayInfoFromSpider(siteKey, siteName, videoId);
        if (spiderResult) {
            this.logger.success(`从Spider引擎获取成功`);
            return spiderResult;
        }
        this.logger.warn(`无法获取真实数据，返回模拟数据`);
        return this.getMockPlayInfo(siteKey, siteName, videoId, videoName);
    }
    async getPlayInfoFromTVBox(siteKey, videoId) {
        const tvboxServer = 'http://127.0.0.1:9978';
        try {
            const response = await axios_1.default.get(`${tvboxServer}/api`, {
                params: {
                    do: 'detail',
                    id: siteKey,
                    ids: videoId
                },
                timeout: 10000
            });
            if (response.data && response.data.list && response.data.list.length > 0) {
                const detail = response.data.list[0];
                const sources = this.parsePlayUrl(detail.vod_play_from || '', detail.vod_play_url || '');
                if (sources.length > 0) {
                    return {
                        siteKey,
                        siteName: detail.vod_name || '',
                        videoId,
                        videoName: detail.vod_name || '',
                        sources,
                        currentSource: sources[0],
                        currentEpisode: sources[0].episodes[0],
                    };
                }
            }
        }
        catch (e) {
            this.logger.debug('TVBox服务器不可用');
        }
        return null;
    }
    async getPlayInfoFromSpider(siteKey, siteName, videoId) {
        try {
            const spider = this.spiderManager.getSpider(siteKey);
            if (!spider) {
                this.logger.debug(`Spider ${siteKey} 未加载`);
                const config = this.configService.getConfig();
                if (config && config.sites) {
                    const site = config.sites.find(s => s.key === siteKey);
                    if (site && site.api && site.api.startsWith('http')) {
                        this.logger.debug(`尝试加载Spider: ${site.name}`);
                        try {
                            const loadedSpider = await this.spiderManager.loadSpider({
                                key: site.key,
                                api: site.api,
                                ext: site.ext ? JSON.stringify(site.ext) : '',
                            });
                            if (loadedSpider) {
                                const result = await loadedSpider.detail([videoId]);
                                if (result) {
                                    const data = JSON.parse(result);
                                    if (data.list && data.list.length > 0) {
                                        const detail = data.list[0];
                                        const sources = this.parsePlayUrl(detail.vod_play_from || '', detail.vod_play_url || '');
                                        if (sources.length > 0) {
                                            this.logger.success(`Spider引擎获取播放信息成功: ${site.name}`);
                                            return {
                                                siteKey,
                                                siteName,
                                                videoId,
                                                videoName: detail.vod_name || '',
                                                sources,
                                                currentSource: sources[0],
                                                currentEpisode: sources[0].episodes[0],
                                            };
                                        }
                                    }
                                }
                            }
                        }
                        catch (error) {
                            this.logger.debug(`Spider加载失败: ${error.message}`);
                        }
                    }
                }
                return null;
            }
            const result = await spider.detail([videoId]);
            if (!result) {
                return null;
            }
            const data = JSON.parse(result);
            if (data.list && data.list.length > 0) {
                const detail = data.list[0];
                const sources = this.parsePlayUrl(detail.vod_play_from || '', detail.vod_play_url || '');
                if (sources.length > 0) {
                    this.logger.success(`Spider引擎获取播放信息成功`);
                    return {
                        siteKey,
                        siteName,
                        videoId,
                        videoName: detail.vod_name || '',
                        sources,
                        currentSource: sources[0],
                        currentEpisode: sources[0].episodes[0],
                    };
                }
            }
        }
        catch (error) {
            this.logger.debug(`Spider引擎获取失败: ${error.message}`);
        }
        return null;
    }
    getMockPlayInfo(siteKey, siteName, videoId, videoName) {
        const sources = [
            {
                name: '线路1-极速',
                episodes: Array.from({ length: 24 }, (_, i) => ({
                    name: `第${i + 1}集`,
                    url: `https://vod.pipi.cn/e7959f10vodtransbj125124/2c7e8f2e2436915904403105715/${videoId}_${i + 1}.m3u8`,
                    isM3U8: true,
                    isMP4: false,
                })),
            },
            {
                name: '线路2-高清',
                episodes: Array.from({ length: 24 }, (_, i) => ({
                    name: `第${i + 1}集`,
                    url: `https://hd.youku.com/playlist/m3u8?vid=${videoId}&num=${i + 1}`,
                    isM3U8: true,
                    isMP4: false,
                })),
            },
            {
                name: '线路3-备用',
                episodes: Array.from({ length: 12 }, (_, i) => ({
                    name: `第${i + 1}集`,
                    url: `https://backup.cdn.com/video/${videoName}/ep${String(i + 1).padStart(2, '0')}.mp4`,
                    isM3U8: false,
                    isMP4: true,
                })),
            },
        ];
        return Promise.resolve({
            siteKey,
            siteName,
            videoId,
            videoName,
            sources,
            currentSource: sources[0],
            currentEpisode: sources[0].episodes[0],
        });
    }
};
exports.PlayerService = PlayerService;
exports.PlayerService = PlayerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SPIDER_MANAGER')),
    __param(1, (0, common_1.Inject)(config_service_1.ConfigService)),
    __metadata("design:paramtypes", [spider_engine_1.SpiderManager,
        config_service_1.ConfigService])
], PlayerService);
{
    length: 12;
}
(_, i) => ({
    name: `第${i + 1}集`,
    url: `https://backup.cdn.com/video/${videoName}/ep${String(i + 1).padStart(2, '0')}.mp4`,
    isM3U8: false,
    isMP4: true,
});
;
return {
    siteKey,
    siteName,
    videoId,
    videoName,
    sources,
    currentSource: sources[0],
    currentEpisode: sources[0].episodes[0],
};
parsePlayUrl(vodPlayFrom, string, vodPlayUrl, string);
PlaySource[];
{
    if (!vodPlayFrom || !vodPlayUrl) {
        return [];
    }
    const sources = [];
    const playFroms = vodPlayFrom.split('$, extractM3U8Urls(playInfo, PlayInfo), Episode[], {
        const: m3u8Episodes, Episode, []:  = [],
        for(, source, of, playInfo) { }, : .sources
    }), { for:  };
    (, episode, of, source, episodes) => {
        if (episode.isM3U8) {
            m3u8Episodes.push(episode);
        }
    };
}
return m3u8Episodes;
extractAllUrls(playInfo, PlayInfo);
Episode[];
{
    const allEpisodes = [];
    for (const source of playInfo.sources) {
        allEpisodes.push(...source.episodes);
    }
    return allEpisodes;
}
;
const playUrls = vodPlayUrl.split('$, extractM3U8Urls(playInfo, PlayInfo), Episode[], {
    const: m3u8Episodes, Episode, []:  = [],
    for(, source, of, playInfo) { }, : .sources
}), { for:  };
(, episode, of, source, episodes) => {
    if (episode.isM3U8) {
        m3u8Episodes.push(episode);
    }
};
return m3u8Episodes;
extractAllUrls(playInfo, PlayInfo);
Episode[];
{
    const allEpisodes = [];
    for (const source of playInfo.sources) {
        allEpisodes.push(...source.episodes);
    }
    return allEpisodes;
}
;
for (let i = 0; i < playFroms.length; i++) {
    const sourceName = playFroms[i] || `线路${i + 1}`;
    const urlStr = playUrls[i] || '';
    const episodes = this.parseEpisodes(urlStr);
    sources.push({
        name: sourceName,
        episodes
    });
}
return sources;
parseEpisodes(urlStr, string);
Episode[];
{
    const episodes = [];
    const items = urlStr.split('#');
    for (const item of items) {
        if (!item)
            continue;
        const parts = item.split(', extractM3U8Urls(playInfo, PlayInfo), Episode[], {
            const: m3u8Episodes, Episode, []:  = [],
            for(, source, of, playInfo) { }, : .sources
        }), { for:  };
        (, episode, of, source, episodes) => {
            if (episode.isM3U8) {
                m3u8Episodes.push(episode);
            }
        };
    }
    return m3u8Episodes;
}
extractAllUrls(playInfo, PlayInfo);
Episode[];
{
    const allEpisodes = [];
    for (const source of playInfo.sources) {
        allEpisodes.push(...source.episodes);
    }
    return allEpisodes;
}
;
if (parts.length >= 2) {
    const name = parts[0];
    const url = parts[1];
    episodes.push({
        name,
        url,
        isM3U8: url.includes('.m3u8'),
        isMP4: url.includes('.mp4')
    });
}
return episodes;
extractM3U8Urls(playInfo, PlayInfo);
Episode[];
{
    const m3u8Episodes = [];
    for (const source of playInfo.sources) {
        for (const episode of source.episodes) {
            if (episode.isM3U8) {
                m3u8Episodes.push(episode);
            }
        }
    }
    return m3u8Episodes;
}
extractAllUrls(playInfo, PlayInfo);
Episode[];
{
    const allEpisodes = [];
    for (const source of playInfo.sources) {
        allEpisodes.push(...source.episodes);
    }
    return allEpisodes;
}
//# sourceMappingURL=player.service.js.map