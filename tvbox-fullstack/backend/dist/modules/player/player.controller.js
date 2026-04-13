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
exports.PlayerController = void 0;
const common_1 = require("@nestjs/common");
const player_service_1 = require("./player.service");
let PlayerController = class PlayerController {
    constructor(playerService) {
        this.playerService = playerService;
    }
    async getPlayInfo(siteKey, siteName, videoId, videoName) {
        try {
            const playInfo = await this.playerService.getPlayInfo(siteKey, siteName, videoId, videoName);
            return {
                success: true,
                data: playInfo,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getM3U8Urls(playInfo) {
        try {
            const m3u8Urls = this.playerService.extractM3U8Urls(playInfo);
            return {
                success: true,
                data: m3u8Urls,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
};
exports.PlayerController = PlayerController;
__decorate([
    (0, common_1.Post)('info'),
    __param(0, (0, common_1.Body)('siteKey')),
    __param(1, (0, common_1.Body)('siteName')),
    __param(2, (0, common_1.Body)('videoId')),
    __param(3, (0, common_1.Body)('videoName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "getPlayInfo", null);
__decorate([
    (0, common_1.Post)('m3u8'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "getM3U8Urls", null);
exports.PlayerController = PlayerController = __decorate([
    (0, common_1.Controller)('player'),
    __metadata("design:paramtypes", [player_service_1.PlayerService])
], PlayerController);
//# sourceMappingURL=player.controller.js.map