import { PlayerParser } from './player';
import { PlayInfo, Episode } from './player-types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 生成模拟的播放信息
 */
function generateMockPlayInfo(siteKey: string, siteName: string, videoId: string, videoName: string): PlayInfo {
  // 模拟多个播放线路
  const sources = [
    {
      name: '线路1-极速',
      episodes: [
        { name: '第1集', url: 'https://example.com/xianni/01.m3u8', isM3U8: true, isMP4: false },
        { name: '第2集', url: 'https://example.com/xianni/02.m3u8', isM3U8: true, isMP4: false },
        { name: '第3集', url: 'https://example.com/xianni/03.m3u8', isM3U8: true, isMP4: false },
        { name: '第4集', url: 'https://example.com/xianni/04.m3u8', isM3U8: true, isMP4: false },
        { name: '第5集', url: 'https://example.com/xianni/05.m3u8', isM3U8: true, isMP4: false },
        { name: '第6集', url: 'https://example.com/xianni/06.m3u8', isM3U8: true, isMP4: false },
        { name: '第7集', url: 'https://example.com/xianni/07.m3u8', isM3U8: true, isMP4: false },
        { name: '第8集', url: 'https://example.com/xianni/08.m3u8', isM3U8: true, isMP4: false },
        { name: '第9集', url: 'https://example.com/xianni/09.m3u8', isM3U8: true, isMP4: false },
        { name: '第10集', url: 'https://example.com/xianni/10.m3u8', isM3U8: true, isMP4: false },
        { name: '第11集', url: 'https://example.com/xianni/11.m3u8', isM3U8: true, isMP4: false },
        { name: '第12集', url: 'https://example.com/xianni/12.m3u8', isM3U8: true, isMP4: false },
        { name: '第13集', url: 'https://example.com/xianni/13.m3u8', isM3U8: true, isMP4: false },
        { name: '第14集', url: 'https://example.com/xianni/14.m3u8', isM3U8: true, isMP4: false },
        { name: '第15集', url: 'https://example.com/xianni/15.m3u8', isM3U8: true, isMP4: false },
        { name: '第16集', url: 'https://example.com/xianni/16.m3u8', isM3U8: true, isMP4: false },
        { name: '第17集', url: 'https://example.com/xianni/17.m3u8', isM3U8: true, isMP4: false },
        { name: '第18集', url: 'https://example.com/xianni/18.m3u8', isM3U8: true, isMP4: false },
        { name: '第19集', url: 'https://example.com/xianni/19.m3u8', isM3U8: true, isMP4: false },
        { name: '第20集', url: 'https://example.com/xianni/20.m3u8', isM3U8: true, isMP4: false },
        { name: '第21集', url: 'https://example.com/xianni/21.m3u8', isM3U8: true, isMP4: false },
        { name: '第22集', url: 'https://example.com/xianni/22.m3u8', isM3U8: true, isMP4: false },
        { name: '第23集', url: 'https://example.com/xianni/23.m3u8', isM3U8: true, isMP4: false },
        { name: '第24集', url: 'https://example.com/xianni/24.m3u8', isM3U8: true, isMP4: false }
      ]
    },
    {
      name: '线路2-备用',
      episodes: [
        { name: '第1集', url: 'https://backup.com/xianni/ep01.mp4', isM3U8: false, isMP4: true },
        { name: '第2集', url: 'https://backup.com/xianni/ep02.mp4', isM3U8: false, isMP4: true },
        { name: '第3集', url: 'https://backup.com/xianni/ep03.mp4', isM3U8: false, isMP4: true },
        { name: '第4集', url: 'https://backup.com/xianni/ep04.mp4', isM3U8: false, isMP4: true },
        { name: '第5集', url: 'https://backup.com/xianni/ep05.mp4', isM3U8: false, isMP4: true },
        { name: '第6集', url: 'https://backup.com/xianni/ep06.mp4', isM3U8: false, isMP4: true },
        { name: '第7集', url: 'https://backup.com/xianni/ep07.mp4', isM3U8: false, isMP4: true },
        { name: '第8集', url: 'https://backup.com/xianni/ep08.mp4', isM3U8: false, isMP4: true },
        { name: '第9集', url: 'https://backup.com/xianni/ep09.mp4', isM3U8: false, isMP4: true },
        { name: '第10集', url: 'https://backup.com/xianni/ep10.mp4', isM3U8: false, isMP4: true },
        { name: '第11集', url: 'https://backup.com/xianni/ep11.mp4', isM3U8: false, isMP4: true },
        { name: '第12集', url: 'https://backup.com/xianni/ep12.mp4', isM3U8: false, isMP4: true }
      ]
    },
    {
      name: '线路3-高清',
      episodes: [
        { name: '第1集', url: 'https://hd.com/xianni/01.m3u8', isM3U8: true, isMP4: false },
        { name: '第2集', url: 'https://hd.com/xianni/02.m3u8', isM3U8: true, isMP4: false },
        { name: '第3集', url: 'https://hd.com/xianni/03.m3u8', isM3U8: true, isMP4: false },
        { name: '第4集', url: 'https://hd.com/xianni/04.m3u8', isM3U8: true, isMP4: false },
        { name: '第5集', url: 'https://hd.com/xianni/05.m3u8', isM3U8: true, isMP4: false },
        { name: '第6集', url: 'https://hd.com/xianni/06.m3u8', isM3U8: true, isMP4: false },
        { name: '第7集', url: 'https://hd.com/xianni/07.m3u8', isM3U8: true, isMP4: false },
        { name: '第8集', url: 'https://hd.com/xianni/08.m3u8', isM3U8: true, isMP4: false },
        { name: '第9集', url: 'https://hd.com/xianni/09.m3u8', isM3U8: true, isMP4: false },
        { name: '第10集', url: 'https://hd.com/xianni/10.m3u8', isM3U8: true, isMP4: false }
      ]
    }
  ];

  return {
    siteKey,
    siteName,
    videoId,
    videoName,
    sources,
    currentSource: sources[0],
    currentEpisode: sources[0].episodes[0]
  };
}

/**
 * 格式化输出播放信息
 */
function printPlayInfo(playInfo: PlayInfo): void {
  console.log('\n' + '='.repeat(80));
  console.log('视频播放信息');
  console.log('='.repeat(80));
  console.log(`站点: ${playInfo.siteName}`);
  console.log(`视频ID: ${playInfo.videoId}`);
  console.log(`视频名称: ${playInfo.videoName}`);
  console.log(`播放线路数: ${playInfo.sources.length}`);

  // 统计信息
  let totalEpisodes = 0;
  let m3u8Count = 0;
  let mp4Count = 0;

  playInfo.sources.forEach(source => {
    totalEpisodes += source.episodes.length;
    source.episodes.forEach(ep => {
      if (ep.isM3U8) m3u8Count++;
      if (ep.isMP4) mp4Count++;
    });
  });

  console.log(`总剧集数: ${totalEpisodes}`);
  console.log(`M3U8地址: ${m3u8Count}个`);
  console.log(`MP4地址: ${mp4Count}个`);

  // 显示各线路信息
  console.log('\n' + '='.repeat(80));
  console.log('播放线路详情');
  console.log('='.repeat(80));

  playInfo.sources.forEach((source, index) => {
    console.log(`\n【线路${index + 1}】${source.name}`);
    console.log(`剧集数: ${source.episodes.length}`);
    console.log('-'.repeat(80));

    // 显示前5集和最后1集
    const displayEpisodes = source.episodes.length <= 6
      ? source.episodes
      : [...source.episodes.slice(0, 5), source.episodes[source.episodes.length - 1]];

    displayEpisodes.forEach((ep, epIndex) => {
      if (epIndex === 5 && source.episodes.length > 6) {
        console.log('  ...');
      }
      const type = ep.isM3U8 ? '[M3U8]' : ep.isMP4 ? '[MP4]' : '[其他]';
      console.log(`  ${ep.name} ${type}`);
      console.log(`    ${ep.url}`);
    });
  });
}

/**
 * 选择特定剧集并显示播放地址
 */
function selectEpisode(playInfo: PlayInfo, sourceIndex: number, episodeIndex: number): void {
  if (sourceIndex < 0 || sourceIndex >= playInfo.sources.length) {
    console.error('线路索引超出范围');
    return;
  }

  const source = playInfo.sources[sourceIndex];
  if (episodeIndex < 0 || episodeIndex >= source.episodes.length) {
    console.error('剧集索引超出范围');
    return;
  }

  const episode = source.episodes[episodeIndex];

  console.log('\n' + '='.repeat(80));
  console.log('选中的播放地址');
  console.log('='.repeat(80));
  console.log(`视频: ${playInfo.videoName}`);
  console.log(`线路: ${source.name}`);
  console.log(`剧集: ${episode.name}`);
  console.log(`类型: ${episode.isM3U8 ? 'M3U8' : episode.isMP4 ? 'MP4' : '其他'}`);
  console.log(`\n播放地址:`);
  console.log(episode.url);
  console.log('='.repeat(80));
}

/**
 * 保存播放信息到文件
 */
function savePlayInfo(playInfo: PlayInfo): void {
  const outputDir = path.join(__dirname, '..', 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 保存完整播放信息
  const infoPath = path.join(outputDir, 'play-info.json');
  fs.writeFileSync(infoPath, JSON.stringify(playInfo, null, 2), 'utf8');
  console.log(`\n播放信息已保存到: ${infoPath}`);

  // 保存M3U8地址列表
  const m3u8List: any[] = [];
  playInfo.sources.forEach(source => {
    source.episodes.forEach(ep => {
      if (ep.isM3U8) {
        m3u8List.push({
          source: source.name,
          episode: ep.name,
          url: ep.url
        });
      }
    });
  });

  const m3u8Path = path.join(outputDir, 'm3u8-list.json');
  fs.writeFileSync(m3u8Path, JSON.stringify(m3u8List, null, 2), 'utf8');
  console.log(`M3U8列表已保存到: ${m3u8Path}`);

  // 保存所有播放地址
  const allList: any[] = [];
  playInfo.sources.forEach(source => {
    source.episodes.forEach(ep => {
      allList.push({
        source: source.name,
        episode: ep.name,
        url: ep.url,
        type: ep.isM3U8 ? 'M3U8' : ep.isMP4 ? 'MP4' : '其他'
      });
    });
  });

  const allPath = path.join(outputDir, 'all-play-urls.json');
  fs.writeFileSync(allPath, JSON.stringify(allList, null, 2), 'utf8');
  console.log(`所有播放地址已保存到: ${allPath}`);
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('演示：获取视频播放地址\n');

    // 模拟从搜索结果中选择一个视频
    const siteKey = '玩偶';
    const siteName = '👽玩偶哥哥┃4K弹幕';
    const videoId = '1';
    const videoName = '仙逆';

    console.log(`已选择视频:`);
    console.log(`  站点: ${siteName}`);
    console.log(`  视频ID: ${videoId}`);
    console.log(`  视频名称: ${videoName}\n`);

    // 生成模拟播放信息
    const playInfo = generateMockPlayInfo(siteKey, siteName, videoId, videoName);

    // 输出播放信息
    printPlayInfo(playInfo);

    // 选择特定剧集（例如：线路1的第10集）
    selectEpisode(playInfo, 0, 9);

    // 保存播放信息
    savePlayInfo(playInfo);

  } catch (error: any) {
    console.error('获取播放信息失败:', error.message);
    console.error(error.stack);
  }
}

// 执行主函数
main();
