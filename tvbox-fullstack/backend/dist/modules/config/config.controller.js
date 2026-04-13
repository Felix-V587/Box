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
exports.ConfigController = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("./config.service");
let ConfigController = class ConfigController {
    constructor(configService) {
        this.configService = configService;
    }
    async loadConfig(url) {
        try {
            const config = await this.configService.loadConfig(url);
            return {
                success: true,
                data: config,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
    getCurrentConfig() {
        const config = this.configService.getConfig();
        return {
            success: true,
            data: config,
        };
    }
    getSites() {
        const config = this.configService.getConfig();
        return {
            success: true,
            data: config?.sites || [],
        };
    }
    getSearchableSites() {
        const sites = this.configService.getSearchableSites();
        return {
            success: true,
            data: sites,
        };
    }
};
exports.ConfigController = ConfigController;
__decorate([
    (0, common_1.Post)('load'),
    __param(0, (0, common_1.Body)('url')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "loadConfig", null);
__decorate([
    (0, common_1.Get)('current'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "getCurrentConfig", null);
__decorate([
    (0, common_1.Get)('sites'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "getSites", null);
__decorate([
    (0, common_1.Get)('searchable-sites'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "getSearchableSites", null);
exports.ConfigController = ConfigController = __decorate([
    (0, common_1.Controller)('config'),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], ConfigController);
//# sourceMappingURL=config.controller.js.map