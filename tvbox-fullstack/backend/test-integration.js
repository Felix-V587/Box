const axios = require('axios');

const FRONTEND_URL = 'http://localhost:5174';
const BACKEND_URL = 'http://localhost:3000';

async function testFullIntegration() {
  console.log('========================================');
  console.log('TVBox 前后端联调测试');
  console.log('========================================\n');

  try {
    // 1. 测试后端服务
    console.log('【1】测试后端服务连接');
    try {
      const backendHealth = await axios.get(`${BACKEND_URL}/config/current`, { timeout: 5000 });
      console.log('  ✓ 后端服务正常\n');
    } catch (e) {
      console.log('  ✗ 后端服务未响应\n');
      return;
    }

    // 2. 测试前端服务
    console.log('【2】测试前端服务连接');
    try {
      const frontendHealth = await axios.get(FRONTEND_URL, { timeout: 5000 });
      console.log('  ✓ 前端服务正常\n');
    } catch (e) {
      console.log('  ✗ 前端服务未响应\n');
      return;
    }

    // 3. 加载配置
    console.log('【3】加载配置');
    console.log('  数据源: http://www.饭太硬.com/tv');
    const configStart = Date.now();
    const configResponse = await axios.post(`${BACKEND_URL}/config/load`, {
      url: 'http://www.饭太硬.com/tv'
    }, { timeout: 90000 });
    const configTime = Date.now() - configStart;

    if (configResponse.data.success) {
      console.log(`  ✓ 配置加载成功 (${configTime}ms)`);
      console.log(`  站点数: ${configResponse.data.data?.sites?.length || 0}\n`);
    } else {
      console.log('  ✗ 配置加载失败\n');
      return;
    }

    // 4. 搜索视频
    console.log('【4】搜索视频"仙逆"');
    const searchStart = Date.now();
    const searchResponse = await axios.post(`${BACKEND_URL}/search`, {
      keyword: '仙逆'
    }, { timeout: 60000 });
    const searchTime = Date.now() - searchStart;

    if (searchResponse.data.success) {
      const data = searchResponse.data.data;
      console.log(`  ✓ 搜索成功 (${searchTime}ms)`);
      console.log(`  总站点: ${data.totalSites}`);
      console.log(`  成功站点: ${data.successSites}`);
      console.log(`  总结果: ${data.totalVideos}\n`);

      // 显示搜索结果
      const results = data.results || [];
      const validResults = results.filter(r => r.videos && r.videos.length > 0);

      console.log('  搜索结果:');
      validResults.forEach((site, index) => {
        site.videos.forEach((video, vIndex) => {
          console.log(`    ${index + 1}.${vIndex + 1} ${site.siteName} - ${video.vod_name} (${video.vod_remarks || 'N/A'})`);
        });
      });
      console.log();

      // 5. 获取播放地址
      if (validResults.length > 0) {
        const firstSite = validResults[0];
        const firstVideo = firstSite.videos[0];

        console.log('【5】获取播放地址');
        console.log(`  选择: ${firstSite.siteName} - ${firstVideo.vod_name}`);

        const playerStart = Date.now();
        const playerResponse = await axios.post(`${BACKEND_URL}/player/info`, {
          siteKey: firstSite.siteKey,
          siteName: firstSite.siteName,
          videoId: firstVideo.vod_id,
          videoName: firstVideo.vod_name
        }, { timeout: 30000 });
        const playerTime = Date.now() - playerStart;

        if (playerResponse.data.success) {
          const playData = playerResponse.data.data;
          console.log(`  ✓ 播放信息获取成功 (${playerTime}ms)`);
          console.log(`  线路数: ${playData.sources?.length || 0}\n`);

          // 显示播放线路
          const sources = playData.sources || [];
          sources.forEach((source, sIndex) => {
            console.log(`  【线路${sIndex + 1}】${source.name}`);
            console.log(`    剧集数: ${source.episodes?.length || 0}`);

            // 显示前3集
            const displayEpisodes = source.episodes?.slice(0, 3) || [];
            displayEpisodes.forEach((ep, epIndex) => {
              const type = ep.isM3U8 ? 'M3U8' : ep.isMP4 ? 'MP4' : '其他';
              console.log(`    ${epIndex + 1}. ${ep.name} [${type}]`);
              console.log(`       ${ep.url}`);
            });

            if (source.episodes?.length > 3) {
              console.log(`    ... 还有 ${source.episodes.length - 3} 集`);
            }
            console.log();
          });

          // 6. 最终结果
          if (sources.length > 0 && sources[0].episodes?.length > 0) {
            const episode = sources[0].episodes[0];
            console.log('========================================');
            console.log('最终结果');
            console.log('========================================');
            console.log(`视频: ${firstVideo.vod_name}`);
            console.log(`站点: ${firstSite.siteName}`);
            console.log(`线路: ${sources[0].name}`);
            console.log(`剧集: ${episode.name}`);
            console.log(`类型: ${episode.isM3U8 ? 'M3U8' : episode.isMP4 ? 'MP4' : '其他'}`);
            console.log(`\n播放地址:`);
            console.log(episode.url);
            console.log('========================================\n');

            // 7. 性能统计
            console.log('性能统计:');
            console.log(`  配置加载: ${configTime}ms`);
            console.log(`  视频搜索: ${searchTime}ms`);
            console.log(`  播放地址: ${playerTime}ms`);
            console.log(`  总耗时: ${configTime + searchTime + playerTime}ms\n`);

            console.log('✓ 前后端联调测试成功！');
          }
        } else {
          console.log('  ✗ 播放信息获取失败\n');
        }
      }
    } else {
      console.log('  ✗ 搜索失败\n');
    }

  } catch (error) {
    console.error('\n✗ 错误:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testFullIntegration();
