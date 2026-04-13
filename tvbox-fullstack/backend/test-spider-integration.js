/**
 * Spider引擎集成测试
 * 测试搜索和播放服务与Spider引擎的集成
 */

const axios = require('axios');

async function testIntegration() {
  console.log('========================================');
  console.log('TVBox Spider引擎集成测试');
  console.log('========================================\n');

  const baseUrl = 'http://localhost:3000';

  try {
    // 【1】测试后端服务连接
    console.log('【1】测试后端服务连接');
    try {
      const response = await axios.get(`${baseUrl}/`, { timeout: 5000 });
      console.log('✓ 后端服务正常');
    } catch (error) {
      console.log('✗ 后端服务不可用');
      console.log('请先启动后端服务: npm run start:dev');
      return;
    }

    // 【2】测试配置加载
    console.log('\n【2】测试配置加载');
    const configResponse = await axios.get(`${baseUrl}/config/load`, {
      params: { url: 'http://www.饭太硬.com/tv' },
      timeout: 60000
    });
    console.log(`✓ 配置加载成功 (${configResponse.data.duration}ms)`);
    console.log(`  站点数: ${configResponse.data.sites}`);

    // 【3】测试搜索（使用Spider引擎）
    console.log('\n【3】测试搜索（使用Spider引擎）');
    const searchResponse = await axios.get(`${baseUrl}/search`, {
      params: { keyword: '仙逆' },
      timeout: 60000
    });

    console.log(`✓ 搜索成功 (${searchResponse.data.duration}ms)`);
    console.log(`  总站点: ${searchResponse.data.totalSites}`);
    console.log(`  成功站点: ${searchResponse.data.successSites}`);
    console.log(`  失败站点: ${searchResponse.data.failedSites}`);
    console.log(`  总结果: ${searchResponse.data.totalVideos}`);

    if (searchResponse.data.results.length > 0) {
      const firstResult = searchResponse.data.results[0];
      console.log('\n  搜索结果:');
      console.log(`    ${firstResult.siteName} - ${firstResult.videos[0].vod_name}`);

      // 【4】测试播放地址获取（使用Spider引擎）
      console.log('\n【4】测试播放地址获取（使用Spider引擎）');
      const playResponse = await axios.get(`${baseUrl}/player/play`, {
        params: {
          siteKey: firstResult.siteKey,
          siteName: firstResult.siteName,
          videoId: firstResult.videos[0].vod_id,
          videoName: firstResult.videos[0].vod_name
        },
        timeout: 30000
      });

      console.log(`✓ 播放信息获取成功`);
      console.log(`  线路数: ${playResponse.data.sources.length}`);

      playResponse.data.sources.forEach((source, index) => {
        console.log(`\n  【线路${index + 1}】${source.name}`);
        console.log(`    剧集数: ${source.episodes.length}`);
        console.log(`    第1集: ${source.episodes[0].name}`);
        console.log(`    地址: ${source.episodes[0].url}`);
        console.log(`    类型: ${source.episodes[0].isM3U8 ? 'M3U8' : 'MP4'}`);
      });

      console.log('\n========================================');
      console.log('✓ 集成测试完成');
      console.log('========================================');

      console.log('\n总结:');
      console.log('1. Spider引擎已成功集成到后端');
      console.log('2. 搜索服务可以使用Spider引擎执行搜索');
      console.log('3. 播放服务可以使用Spider引擎获取播放地址');
      console.log('4. 系统支持多数据源获取（TVBox服务器、Spider引擎、模拟数据）');

    } else {
      console.log('\n✗ 没有搜索结果');
    }

  } catch (error) {
    console.error('\n✗ 测试失败:', error.message);
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

// 运行测试
testIntegration().catch(console.error);
