import { ConfigParser } from './parser';
import { SearchAggregator } from './search-aggregator';
import { AggregatedResult, SearchResult, VideoItem } from './search-types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 模拟搜索结果（用于演示）
 */
function generateMockSearchResults(keyword: string, sites: any[]): AggregatedResult {
  const results: SearchResult[] = [];
  const mockVideos: { [key: string]: VideoItem[] } = {
    '玩偶': [
      {
        vod_id: '1',
        vod_name: '仙逆',
        vod_pic: 'https://example.com/xianni.jpg',
        vod_remarks: '更新至第24集',
        vod_year: '2024',
        vod_type: '动漫',
        vod_area: '中国',
        vod_director: '未知',
        vod_actor: '未知'
      },
      {
        vod_id: '2',
        vod_name: '仙逆之逆仙',
        vod_pic: 'https://example.com/xianni2.jpg',
        vod_remarks: '全24集',
        vod_year: '2024',
        vod_type: '动漫',
        vod_area: '中国'
      }
    ],
    '厂长': [
      {
        vod_id: '3',
        vod_name: '仙逆',
        vod_pic: 'https://example.com/xianni3.jpg',
        vod_remarks: 'HD',
        vod_year: '2024',
        vod_type: '动漫',
        vod_area: '中国大陆'
      }
    ],
    '文采': [
      {
        vod_id: '4',
        vod_name: '仙逆',
        vod_pic: 'https://example.com/xianni4.jpg',
        vod_remarks: '更新至24集',
        vod_year: '2024',
        vod_type: '国产动漫',
        vod_area: '中国'
      }
    ],
    '立播': [
      {
        vod_id: '5',
        vod_name: '仙逆',
        vod_pic: 'https://example.com/xianni5.jpg',
        vod_remarks: '第24集',
        vod_year: '2024',
        vod_type: '动漫'
      }
    ],
    '奶酪': [
      {
        vod_id: '6',
        vod_name: '仙逆',
        vod_pic: 'https://example.com/xianni6.jpg',
        vod_remarks: '24集全',
        vod_year: '2024',
        vod_type: '动漫',
        vod_area: '中国'
      }
    ]
  };

  sites.forEach(site => {
    // 提取站点名称中的关键词
    const siteKeywords = ['玩偶', '厂长', '文采', '立播', '奶酪', '原创', '比特', '热播'];
    const matchedKeyword = siteKeywords.find(k => site.name.includes(k));

    if (matchedKeyword && mockVideos[matchedKeyword]) {
      // 匹配到模拟数据的站点
      results.push({
        siteKey: site.key,
        siteName: site.name,
        videos: mockVideos[matchedKeyword],
        duration: Math.floor(Math.random() * 1000) + 500
      });
    } else if (Math.random() > 0.6) {
      // 40%的站点返回空结果
      results.push({
        siteKey: site.key,
        siteName: site.name,
        videos: [],
        duration: Math.floor(Math.random() * 1000) + 500
      });
    } else {
      // 其他站点失败
      results.push({
        siteKey: site.key,
        siteName: site.name,
        videos: [],
        error: '连接超时',
        duration: 15000
      });
    }
  });

  const successSites = results.filter(r => !r.error && r.videos.length > 0).length;
  const failedSites = results.filter(r => r.error).length;
  const totalVideos = results.reduce((sum, r) => sum + r.videos.length, 0);

  return {
    keyword,
    totalSites: sites.length,
    successSites,
    failedSites,
    totalVideos,
    results,
    duration: 12345
  };
}

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

      siteResult.videos.forEach((video, vIndex) => {
        console.log(`  ${vIndex + 1}. ${video.vod_name}`);
        if (video.vod_remarks) console.log(`     备注: ${video.vod_remarks}`);
        if (video.vod_year) console.log(`     年份: ${video.vod_year}`);
        if (video.vod_type) console.log(`     类型: ${video.vod_type}`);
        if (video.vod_area) console.log(`     地区: ${video.vod_area}`);
        if (video.vod_director) console.log(`     导演: ${video.vod_director}`);
        if (video.vod_actor) console.log(`     演员: ${video.vod_actor}`);
      });
    });
  }

  // 显示失败的站点
  const failedResults = result.results.filter(r => r.error);
  if (failedResults.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('失败的站点');
    console.log('='.repeat(80));
    failedResults.slice(0, 5).forEach((siteResult, index) => {
      console.log(`${index + 1}. ${siteResult.siteName}: ${siteResult.error}`);
    });
    if (failedResults.length > 5) {
      console.log(`... 还有 ${failedResults.length - 5} 个失败站点`);
    }
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
  const resultPath = path.join(outputDir, 'search-result-demo.json');
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

  const listPath = path.join(outputDir, 'search-list-demo.json');
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

    // 筛选支持搜索的站点
    const searchableSites = config.sites.filter((s: any) => s.searchable === 1);
    console.log(`支持搜索的站点: ${searchableSites.length} 个\n`);

    // 生成模拟搜索结果
    console.log('生成模拟搜索结果...\n');
    const keyword = '仙逆';
    const result = generateMockSearchResults(keyword, searchableSites);

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
