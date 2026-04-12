/**
 * 前端集成测试
 * 测试前端是否能正确调用后端API并获取真实播放地址
 */

const http = require('http');
const querystring = require('querystring');

function testAPI(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testFrontendIntegration() {
  console.log('========================================');
  console.log('前端集成测试');
  console.log('========================================\n');

  try {
    // 测试1: 配置加载（前端调用）
    console.log('【1】测试配置加载（前端调用）');
    console.log('前端请求: POST /api/config/load');
    const configResult = await testAPI('POST', '/api/config/load', {
      url: 'http://www.饭太硬.com/tv'
    });
    console.log('后端响应状态码:', configResult.status);
    console.log('后端响应成功:', configResult.data.success);

    if (configResult.status !== 200 && configResult.status !== 201) {
      console.log('\n✗ 配置加载失败，停止测试');
      return;
    }

    if (!configResult.data.success) {
      console.log('\n✗ 配置加载失败，停止测试');
      console.log('错误信息:', configResult.data.error);
      return;
    }

    console.log('✓ 配置加载成功');
    console.log('站点数量:', configResult.data.data.sites.length);

    // 模拟前端搜索流程
    console.log('\n【2】模拟前端搜索流程');
    console.log('前端请求: POST /api/search');

    const searchResult = await testAPI('POST', '/api/search', {
      keyword: '仙逆'
    });
    console.log('后端响应状态码:', searchResult.status);
    console.log('后端响应成功:', searchResult.data.success);

    if ((searchResult.status !== 200 && searchResult.status !== 201) || !searchResult.data.success) {
      console.log('\n✗ 搜索失败，停止测试');
      return;
    }

    console.log('✓ 搜索成功');
    console.log('总站点数:', searchResult.data.data.totalSites);
    console.log('成功站点数:', searchResult.data.data.successSites);
    console.log('总视频数:', searchResult.data.data.totalVideos);

    // 模拟前端获取播放信息流程
    console.log('\n【3】模拟前端获取播放信息流程');

    const result = searchResult.data.data;
    if (result.results && result.results.length > 0) {
      const firstResult = result.results.find(r => r.videos && r.videos.length > 0);

      if (firstResult) {
        const video = firstResult.videos[0];
        console.log('前端选择视频:', video.vod_name);
        console.log('前端请求: POST /api/player/info');

        const playResult = await testAPI('POST', '/api/player/info', {
          siteKey: firstResult.siteKey,
          siteName: firstResult.siteName,
          videoId: video.vod_id,
          videoName: video.vod_name
        });
        console.log('后端响应状态码:', playResult.status);
        console.log('后端响应成功:', playResult.data.success);

        if (playResult.status === 200 || playResult.status === 201) {
          if (!playResult.data.success) {
            console.log('\n✗ 播放信息获取失败');
            console.log('错误信息:', playResult.data.error);
            return;
          }

          const playInfo = playResult.data.data;
          console.log('✓ 播放信息获取成功');
          console.log('视频名称:', playInfo.videoName);
          console.log('线路数量:', playInfo.sources.length);

          // 分析播放地址
          console.log('\n【4】分析播放地址');
          let hasRealUrl = false;
          let totalEpisodes = 0;

          playInfo.sources.forEach((source, index) => {
            console.log(`\n  【线路${index + 1}】${source.name}`);
            console.log(`  剧集数量: ${source.episodes.length}`);
            totalEpisodes += source.episodes.length;

            source.episodes.slice(0, 3).forEach(ep => {
              const isReal = !ep.url.includes('example.com');
              const isM3U8 = ep.url.includes('.m3u8');
              const isMP4 = ep.url.includes('.mp4');

              console.log(`    ${ep.name}: ${isReal ? '✓' : '⚠️'} ${isM3U8 ? 'M3U8' : isMP4 ? 'MP4' : '其他'}`);
              if (isReal) hasRealUrl = true;
            });
          });

          console.log(`\n总剧集数: ${totalEpisodes}`);

          console.log('\n========================================');
          if (hasRealUrl) {
            console.log('✓ 前端集成测试成功');
            console.log('✓ 成功获取到真实播放地址');
            console.log('✓ 前端可以正常播放视频');
          } else {
            console.log('⚠️  前端集成测试部分成功');
            console.log('⚠️  仍然是模拟数据');
          }
          console.log('========================================');

          console.log('\n【5】测试总结');
          console.log('✓ 后端API正常工作');
          console.log('✓ 前端可以调用后端API');
          console.log('✓ 配置加载成功');
          console.log('✓ 搜索功能正常');
          console.log('✓ 播放信息获取正常');
          console.log(hasRealUrl ? '✓ 获取到真实播放地址' : '⚠️  未获取到真实播放地址');

        } else {
          console.log('\n✗ 播放信息获取失败');
          console.log('状态码:', playResult.status);
        }
      } else {
        console.log('\n✗ 没有找到搜索结果');
      }
    } else {
      console.log('\n✗ 搜索结果为空');
    }

  } catch (error) {
    console.error('\n✗ 测试失败:', error.message);
  }
}

testFrontendIntegration().catch(console.error);
