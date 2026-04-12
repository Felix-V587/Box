/**
 * TVBox Spider Engine for Node.js
 *
 * 这是一个将TVBox的Spider引擎移植到Node.js的实现
 * 支持执行TVBox的JavaScript Spider代码
 *
 * @module @tvbox/spider-engine
 */
export * from './types/spider.interface';
export * from './types/errors';
export { JSEngine } from './core/js-engine';
export { SpiderWrapper } from './core/spider-wrapper';
export { SpiderManager } from './core/spider-manager';
export { GlobalAPI } from './api/global-api';
export { HtmlParser } from './utils/html-parser';
export { ModuleLoader } from './utils/module-loader';
export { SpiderManager as default } from './core/spider-manager';
//# sourceMappingURL=index.d.ts.map