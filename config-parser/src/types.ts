// 配置数据类型定义

export interface SourceBean {
  key: string;
  name: string;
  api: string;
  type?: number;
  searchable?: number;
  quickSearch?: number;
  filter?: any;
  ext?: string;
  jar?: string;
}

export interface ParseBean {
  name: string;
  url: string;
  ext?: string;
  type?: number;
}

export interface LiveChannel {
  name: string;
  urls: string[];
}

export interface LiveGroup {
  group: string;
  channels: LiveChannel[];
}

export interface ConfigJson {
  spider?: string;
  sites?: SourceBean[];
  parses?: ParseBean[];
  lives?: (string | LiveGroup)[];
  flags?: string[];
  ijk?: any[];
  doh?: string[];
  rules?: any[];
  logo?: string;
}

export interface ParseResult {
  success: boolean;
  config?: ConfigJson;
  error?: string;
  rawContent?: string;
  decryptedContent?: string;
}
