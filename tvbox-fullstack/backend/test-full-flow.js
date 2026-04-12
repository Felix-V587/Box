/**
 * 测试完整的搜索和播放流程
 * 模拟前端的行为
 */

const axios = require('axios');

async function testFullFlow() {
  console.log('========================================');
  console.log('完整搜索和播放流程测试');
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

    // 【2】加载配置
    console.log('\n【2】加载配置');
    const configResponse = await axios.post(`${baseUrl}/config/load`, {
      url: 'http://www.饭太硬.com/tv'
    }, { timeout: 60000 });

    if (configResponse.data.success) {
      console.log('✓ 配置加载成功');
    } else {
      console.log('✗ 配置加载失败:', configResponse.data.error);
      return;
    }

    // 【3】搜索视频
    console.log('\n【3】搜索视频 "仙逆"');
    const searchResponse = await axios.post(`${baseUrl}/search`, {
      keyword: '仙逆'
    }, { timeout: 60000 });

    if (searchResponse.data.success) {
      const result = searchResponse.data.data;
      console.log('✓ 搜索成功');
      console.log(`  总站点: ${result.totalSites}`);
      console.log(`  成功站点: ${result.successSites}`);
      console.log(`  失败站点: ${result.failedSites}`);
      console.log(`  总结果: ${result.totalVideos}`);

      if (result.results && result.results.length > 0) {
        // 找到第一个成功的搜索结果
        const firstSuccessResult = result.results.find(r => r.videos && r.videos.length > 0);
        
        if (firstSuccessResult) {
          const video = firstSuccessResult.videos[0];
          console.log('\n  选择视频:');
          console.log(`    站点: ${firstSuccessResult.siteName}`);
          console.log(`    名称: ${video.vod_name}`);
          console.log(`    ID: ${video.vod_id}`);

          // 【4】获取播放信息
          console.log('\n【4】获取播放信息');
          const playResponse = await axios.post(`${baseUrl}/player/info`, {
            siteKey: firstSuccessResult.siteKey,
            siteName: firstSuccessResult.siteName,
            videoId: video.vod_id,
            videoName: video.vod_name
          }, { timeout: 30000 });

          if (playResponse.data.success) {
            const playInfo = playResponse.data.data;
            console.log('✓ 播放信息获取成功');
            console.log(`  视频名称: ${playInfo.videoName}`);
            console.log(`  线路数: ${playInfo.sources.length}`);

            playInfo.sources.forEach((source, index) => {
              console.log(`\n  【线路${index + 1}】${source.name}`);
              console.log(`    剧集数: ${source.episodes.length}`);
              console.log(`    第1集: ${source.episodes[0].name}`);
              console.log(`    地址: ${source.episodes[0].url}`);

              // 检查地址是否是真实的
              if (source.episodes[0].url.includes('example.com')) {
                console.log(`    ⚠️  这是模拟数据，不是真实地址`);
              } else {
                console.log(`    ✓ 似乎是真实地址`);
              }
            });

            console.log('\n========================================');
            console.log('✓ 完整流程测试完成');
            console.log('========================================');

            console.log('\n总结:');
            console.log('1. 配置加载成功');
            console.log('2. 搜索功能正常');
            console.log('3. 播放信息获取正常');
            
            // 检查是否是真实地址
            const hasRealUrl = playInfo.sources.some(source =>
              source.episodes.some(ep => !ep.url.includes('example.com'))
            );
            
            if (hasRealUrl) {
              console.log('4. ✓ 获取到了真实的播放地址');
            } else {
              console.log('4. ⚠️  仍然是模拟数据，未获取到真实地址');
              console.log('   可能原因:');
              console.log('   - Spider引擎未正确加载');
              console.log('   - TVBox服务器未运行');
              console.log('   - 站点API不可用');
            }

          } else {
            console.log('✗ 播放信息获取失败:', playResponse.data.error);
          }
        } else {
          console.log('\n✗ 没有找到搜索结果');
        }
      } else {
        console.log('\n✗ 搜索结果为空');
      }
    } else {
      console.log('✗ 搜索失败:', searchResponse.data.error);
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
testFullFlow().catch(console.error);
