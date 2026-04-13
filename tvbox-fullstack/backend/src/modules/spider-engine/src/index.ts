/**
 * TVBox Spider Engine for Node.js
 * 
 * 这是一个将TVBox的Spider引擎移植到Node.js的实现
 * 支持执行TVBox的JavaScript Spider代码
 * 
 * @module @tvbox/spider-engine
 */

// 导出类型
export * from './types/spider.interface';
export * from './types/errors';

// 导出核心类
export { JSEngine } from './core/js-engine';
export { SpiderWrapper } from './core/spider-wrapper';
export { SpiderManager } from './core/spider-manager';

// 导出API
export { GlobalAPI } from './api/global-api';

// 导出工具类
export { HtmlParser } from './utils/html-parser';
export { ModuleLoader } from './utils/module-loader';

// 默认导出SpiderManager
export { SpiderManager as default } from './core/spider-manager';
