/**
 * 简单的API测试脚本
 */

const http = require('http');

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

async function runTests() {
  console.log('========================================');
  console.log('API测试');
  console.log('========================================\n');

  try {
    // 测试1: 配置加载
    console.log('【1】测试配置加载');
    const configResult = await testAPI('POST', '/config/load', {
      url: 'http://www.饭太硬.com/tv'
    });
    console.log('状态码:', configResult.status);
    console.log('响应:', JSON.stringify(configResult.data, null, 2));

    if (configResult.status !== 200 && configResult.status !== 201) {
      console.log('\n✗ 配置加载失败，停止测试');
      return;
    }

    // 测试2: 搜索
    console.log('\n【2】测试搜索');
    const searchResult = await testAPI('POST', '/search', {
      keyword: '仙逆'
    });
    console.log('状态码:', searchResult.status);
    console.log('响应:', JSON.stringify(searchResult.data, null, 2));

    if ((searchResult.status !== 200 && searchResult.status !== 201) || !searchResult.data.success) {
      console.log('\n✗ 搜索失败，停止测试');
      console.log('状态码:', searchResult.status);
      console.log('响应:', searchResult.data);
      return;
    }
    
    console.log('✓ 搜索成功');
    console.log('总站点数:', searchResult.data.data.totalSites);
    console.log('成功站点数:', searchResult.data.data.successSites);
    console.log('总视频数:', searchResult.data.data.totalVideos);

    // 测试3: 播放信息
    console.log('\n【3】测试播放信息');
    const result = searchResult.data.data;
    if (result.results && result.results.length > 0) {
      const firstResult = result.results.find(r => r.videos && r.videos.length > 0);
      
      if (firstResult) {
        const video = firstResult.videos[0];
        console.log('选择视频:', video.vod_name);
        
        const playResult = await testAPI('POST', '/player/info', {
          siteKey: firstResult.siteKey,
          siteName: firstResult.siteName,
          videoId: video.vod_id,
          videoName: video.vod_name
        });
        console.log('状态码:', playResult.status);
        console.log('响应:', JSON.stringify(playResult.data, null, 2));

        if (playResult.status === 200 || playResult.status === 201) {
          if (!playResult.data.success) {
            console.log('\n✗ 播放信息获取失败');
            console.log('错误信息:', playResult.data.error);
            return;
          }
          
          const playInfo = playResult.data.data;
          console.log('\n播放地址分析:');
          
          let hasRealUrl = false;
          playInfo.sources.forEach((source, index) => {
            console.log(`\n  【线路${index + 1}】${source.name}`);
            source.episodes.slice(0, 3).forEach(ep => {
              const isReal = !ep.url.includes('example.com');
              console.log(`    ${ep.name}: ${isReal ? '✓ 真实' : '⚠️ 模拟'} - ${ep.url.substring(0, 80)}...`);
              if (isReal) hasRealUrl = true;
            });
          });

          console.log('\n========================================');
          if (hasRealUrl) {
            console.log('✓ 成功获取到真实播放地址');
          } else {
            console.log('⚠️  仍然是模拟数据');
          }
          console.log('========================================');
        } else {
          console.log('\n✗ 播放信息获取失败');
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

runTests().catch(console.error);
