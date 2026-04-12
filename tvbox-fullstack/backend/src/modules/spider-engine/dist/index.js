"use strict";
/**
 * TVBox Spider Engine for Node.js
 *
 * 这是一个将TVBox的Spider引擎移植到Node.js的实现
 * 支持执行TVBox的JavaScript Spider代码
 *
 * @module @tvbox/spider-engine
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.ModuleLoader = exports.HtmlParser = exports.GlobalAPI = exports.SpiderManager = exports.SpiderWrapper = exports.JSEngine = void 0;
// 导出类型
__exportStar(require("./types/spider.interface"), exports);
__exportStar(require("./types/errors"), exports);
// 导出核心类
var js_engine_1 = require("./core/js-engine");
Object.defineProperty(exports, "JSEngine", { enumerable: true, get: function () { return js_engine_1.JSEngine; } });
var spider_wrapper_1 = require("./core/spider-wrapper");
Object.defineProperty(exports, "SpiderWrapper", { enumerable: true, get: function () { return spider_wrapper_1.SpiderWrapper; } });
var spider_manager_1 = require("./core/spider-manager");
Object.defineProperty(exports, "SpiderManager", { enumerable: true, get: function () { return spider_manager_1.SpiderManager; } });
// 导出API
var global_api_1 = require("./api/global-api");
Object.defineProperty(exports, "GlobalAPI", { enumerable: true, get: function () { return global_api_1.GlobalAPI; } });
// 导出工具类
var html_parser_1 = require("./utils/html-parser");
Object.defineProperty(exports, "HtmlParser", { enumerable: true, get: function () { return html_parser_1.HtmlParser; } });
var module_loader_1 = require("./utils/module-loader");
Object.defineProperty(exports, "ModuleLoader", { enumerable: true, get: function () { return module_loader_1.ModuleLoader; } });
// 默认导出SpiderManager
var spider_manager_2 = require("./core/spider-manager");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return spider_manager_2.SpiderManager; } });
//# sourceMappingURL=index.js.map