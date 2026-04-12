import { ConfigParser } from './parser';
import { SearchAggregator } from './search-aggregator';
import { AggregatedResult } from './search-types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 格式化输出搜索结果
 */
function printSearchResult(result: AggregatedResult): void {
  console.log('\n' + '='.repeat(80));
  console.log('搜索结果汇总');
  console.log('='.repeat(80));
  console.log(`关键词: ${result.keyword}`);
  console.log(`总站点数: ${result.totalSites}`);
  console.log(`成功站点: ${result.successSites}`);
  console.log(`失败站点: ${result.failedSites}`);
  console.log(`总结果数: ${result.totalVideos}`);
  console.log(`耗时: ${(result.duration / 1000).toFixed(2)}秒`);

  // 按结果数量排序
  const sortedResults = result.results
    .filter(r => r.videos.length > 0)
    .sort((a, b) => b.videos.length - a.videos.length);

  if (sortedResults.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('搜索结果详情');
    console.log('='.repeat(80));

    sortedResults.forEach((siteResult, index) => {
      console.log(`\n【${index + 1}】${siteResult.siteName} (${siteResult.videos.length}个结果)`);
      console.log('-'.repeat(80));

      siteResult.videos.slice(0, 5).forEach((video, vIndex) => {
        console.log(`  ${vIndex + 1}. ${video.vod_name}`);
        if (video.vod_remarks) console.log(`     备注: ${video.vod_remarks}`);
        if (video.vod_year) console.log(`     年份: ${video.vod_year}`);
        if (video.vod_type) console.log(`     类型: ${video.vod_type}`);
        if (video.vod_area) console.log(`     地区: ${video.vod_area}`);
        if (video.vod_director) console.log(`     导演: ${video.vod_director}`);
        if (video.vod_actor) console.log(`     演员: ${video.vod_actor}`);
      });

      if (siteResult.videos.length > 5) {
        console.log(`  ... 还有 ${siteResult.videos.length - 5} 个结果`);
      }
    });
  }

  // 显示失败的站点
  const failedResults = result.results.filter(r => r.error);
  if (failedResults.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('失败的站点');
    console.log('='.repeat(80));
    failedResults.forEach((siteResult, index) => {
      console.log(`${index + 1}. ${siteResult.siteName}: ${siteResult.error}`);
    });
  }

  console.log('\n' + '='.repeat(80));
}

/**
 * 保存搜索结果到文件
 */
function saveSearchResult(result: AggregatedResult): void {
  const outputDir = path.join(__dirname, '..', 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 保存完整结果
  const resultPath = path.join(outputDir, 'search-result.json');
  fs.writeFileSync(resultPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`\n搜索结果已保存到: ${resultPath}`);

  // 保存简化的结果列表
  const simplifiedResults: any[] = [];
  result.results.forEach(siteResult => {
    siteResult.videos.forEach(video => {
      simplifiedResults.push({
        site: siteResult.siteName,
        siteKey: siteResult.siteKey,
        ...video
      });
    });
  });

  const listPath = path.join(outputDir, 'search-list.json');
  fs.writeFileSync(listPath, JSON.stringify(simplifiedResults, null, 2), 'utf8');
  console.log(`简化列表已保存到: ${listPath}`);
}

/**
 * 主函数
 */
async function main() {
  try {
    // 加载配置
    const configPath = path.join(__dirname, '..', 'output', 'config.json');
    if (!fs.existsSync(configPath)) {
      console.error('配置文件不存在，请先运行配置解析器');
      return;
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log(`已加载配置，共 ${config.sites.length} 个站点`);

    // 创建搜索聚合器
    const aggregator = new SearchAggregator(config.sites);
    const searchableSites = aggregator.getSearchableSites();
    console.log(`支持搜索的站点: ${searchableSites.length} 个\n`);

    // 执行搜索
    const keyword = '仙逆';
    const result = await aggregator.search({
      keyword,
      quickSearch: false,
      timeout: 15000,
      concurrency: 5
    });

    // 输出结果
    printSearchResult(result);

    // 保存结果
    saveSearchResult(result);

  } catch (error: any) {
    console.error('搜索失败:', error.message);
    console.error(error.stack);
  }
}

// 执行主函数
main();
