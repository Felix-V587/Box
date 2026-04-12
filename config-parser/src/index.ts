import { ConfigParser } from './parser';
import { ConfigJson } from './types';

/**
 * 格式化输出配置信息
 */
function printConfig(config: ConfigJson): void {
  console.log('\n' + '='.repeat(60));
  console.log('配置解析结果');
  console.log('='.repeat(60));

  // Spider信息
  if (config.spider) {
    console.log('\n【Spider】');
    console.log(`  地址: ${config.spider}`);
  }

  // 站点源信息
  if (config.sites && config.sites.length > 0) {
    console.log('\n【站点源】');
    console.log(`  总数: ${config.sites.length}`);
    config.sites.forEach((site, index) => {
      console.log(`  ${index + 1}. ${site.name} (${site.key})`);
      console.log(`     API: ${site.api}`);
      if (site.type !== undefined) console.log(`     类型: ${site.type}`);
      if (site.searchable !== undefined) console.log(`     可搜索: ${site.searchable}`);
      if (site.jar) console.log(`     JAR: ${site.jar}`);
    });
  }

  // 解析器信息
  if (config.parses && config.parses.length > 0) {
    console.log('\n【解析器】');
    console.log(`  总数: ${config.parses.length}`);
    config.parses.forEach((parse, index) => {
      console.log(`  ${index + 1}. ${parse.name}`);
      console.log(`     URL: ${parse.url}`);
      if (parse.type !== undefined) console.log(`     类型: ${parse.type}`);
    });
  }

  // 直播源信息
  if (config.lives && config.lives.length > 0) {
    console.log('\n【直播源】');
    console.log(`  总数: ${config.lives.length}`);
    config.lives.forEach((live, index) => {
      if (typeof live === 'string') {
        console.log(`  ${index + 1}. ${live}`);
      } else {
        console.log(`  ${index + 1}. ${live.group} (${live.channels?.length || 0}个频道)`);
      }
    });
  }

  // 标志信息
  if (config.flags && config.flags.length > 0) {
    console.log('\n【标志】');
    console.log(`  ${config.flags.join(', ')}`);
  }

  // DOH信息
  if (config.doh && config.doh.length > 0) {
    console.log('\n【DOH】');
    config.doh.forEach((d, index) => {
      console.log(`  ${index + 1}. ${d}`);
    });
  }

  // 规则信息
  if (config.rules && config.rules.length > 0) {
    console.log('\n【规则】');
    console.log(`  总数: ${config.rules.length}`);
  }

  // Logo信息
  if (config.logo) {
    console.log('\n【Logo】');
    console.log(`  ${config.logo}`);
  }

  console.log('\n' + '='.repeat(60));
}

/**
 * 主函数
 */
async function main() {
  const parser = new ConfigParser();

  // 解析地址
  const apiUrl = 'http://www.饭太硬.com/tv';

  console.log('开始解析配置...');
  console.log(`配置地址: ${apiUrl}\n`);

  const result = await parser.loadConfig(apiUrl);

  if (result.success && result.config) {
    console.log('✓ 配置解析成功！');
    printConfig(result.config);

    // 保存解析结果到文件
    const fs = require('fs');
    const path = require('path');

    const outputDir = path.join(__dirname, '..', 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 保存完整配置
    const configPath = path.join(outputDir, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(result.config, null, 2), 'utf8');
    console.log(`\n配置已保存到: ${configPath}`);

    // 保存解密后的内容
    if (result.decryptedContent) {
      const contentPath = path.join(outputDir, 'decrypted-content.json');
      fs.writeFileSync(contentPath, result.decryptedContent, 'utf8');
      console.log(`解密内容已保存到: ${contentPath}`);
    }
  } else {
    console.log('✗ 配置解析失败！');
    console.log(`错误信息: ${result.error}`);
  }
}

// 执行主函数
main().catch(console.error);
