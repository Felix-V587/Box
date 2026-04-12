import { Logger } from '@nestjs/common';
import { SandboxConfig, createSandboxConfig } from './sandbox.config';

/**
 * QuickJS 沙箱
 * 提供隔离的 JavaScript 执行环境
 */
export class QuickJSSandbox {
  private readonly logger = new Logger(QuickJSSandbox.name);
  private readonly config: SandboxConfig;
  private vm: any = null;
  private context: any = null;
  private initialized = false;

  constructor(config?: Partial<SandboxConfig>) {
    this.config = createSandboxConfig(config);
  }

  /**
   * 初始化沙箱
   */
  async init(): Promise<void> {
    try {
      // 注意：quickjs-emscripten 需要单独安装
      // 这里提供简化的实现框架
      this.logger.log('Initializing QuickJS sandbox...');
      this.logger.warn(
        'QuickJS sandbox is a placeholder. Install quickjs-emscripten for full functionality.',
      );

      // TODO: 实际实现需要安装 quickjs-emscripten
      // const { newQuickJSWASMModule } = await import('quickjs-emscripten');
      // this.vm = await newQuickJSWASMModule();
      // this.context = this.vm.newContext();

      this.initialized = true;
      this.logger.log('QuickJS sandbox initialized');
    } catch (error) {
      this.logger.error('Failed to initialize QuickJS sandbox', error);
      throw error;
    }
  }

  /**
   * 执行代码
   * @param code JavaScript 代码
   * @param timeout 超时时间
   */
  async execute(code: string, timeout?: number): Promise<string> {
    if (!this.initialized) {
      throw new Error('Sandbox not initialized');
    }

    const actualTimeout = timeout || this.config.executionTimeout;

    try {
      // TODO: 实际实现
      // const result = this.context.evalCode(code, 'script.js', { type: 'string' });
      // return result.dump();

      // 简化实现：使用 Node.js vm 模块作为替代
      const vm = await import('vm');
      const script = new vm.Script(code);

      const result = script.runInNewContext({
        console: {
          log: (...args: any[]) => this.logger.log(args.join(' ')),
          error: (...args: any[]) => this.logger.error(args.join(' ')),
          warn: (...args: any[]) => this.logger.warn(args.join(' ')),
        },
      });

      return typeof result === 'string' ? result : JSON.stringify(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Code execution failed: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * 调用函数
   * @param funcName 函数名
   * @param args 参数
   */
  async callFunction(funcName: string, args: any[]): Promise<any> {
    const argsJson = args.map((arg) => JSON.stringify(arg)).join(', ');
    const code = `${funcName}(${argsJson})`;
    const result = await this.execute(code);
    return JSON.parse(result);
  }

  /**
   * 销毁沙箱
   */
  async destroy(): Promise<void> {
    try {
      if (this.context) {
        // this.context.dispose();
        this.context = null;
      }

      if (this.vm) {
        // this.vm.dispose();
        this.vm = null;
      }

      this.initialized = false;
      this.logger.log('QuickJS sandbox destroyed');
    } catch (error) {
      this.logger.error('Failed to destroy QuickJS sandbox', error);
    }
  }

  /**
   * 检查是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}
