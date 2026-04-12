/**
 * 沙箱配置接口
 */
export interface SandboxConfig {
  /** 内存限制（MB） */
  memoryLimit: number;

  /** 执行超时（毫秒） */
  executionTimeout: number;

  /** 是否允许文件系统访问 */
  allowFileSystem: boolean;

  /** 是否允许网络访问 */
  allowNetwork: boolean;

  /** 网络白名单域名 */
  networkWhitelist: string[];

  /** 是否允许执行系统命令 */
  allowSystemCommand: boolean;
}

/**
 * 默认沙箱配置
 */
export const defaultSandboxConfig: SandboxConfig = {
  memoryLimit: 128,
  executionTimeout: 10000,
  allowFileSystem: false,
  allowNetwork: true,
  networkWhitelist: [],
  allowSystemCommand: false,
};

/**
 * 创建沙箱配置
 */
export function createSandboxConfig(
  overrides?: Partial<SandboxConfig>,
): SandboxConfig {
  return {
    ...defaultSandboxConfig,
    ...overrides,
  };
}
