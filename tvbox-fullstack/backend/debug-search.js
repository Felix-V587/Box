const axios = require('axios');

async function testAPI() {
  try {
    // 先加载配置
    await axios.post('http://localhost:3000/config/load', {
      url: 'http://www.饭太硬.com/tv'
    }, { timeout: 90000 });

    // 搜索
    const searchResponse = await axios.post('http://localhost:3000/search', {
      keyword: '仙逆'
    }, { timeout: 60000 });

    const results = searchResponse.data.data?.results || [];

    console.log('搜索结果数量:', results.length);

    // 找到有视频的结果
    const validResults = results.filter(r => r.videos && r.videos.length > 0);
    console.log('有视频的结果数量:', validResults.length);

    if (validResults.length > 0) {
      const firstSite = validResults[0];
      const firstVideo = firstSite.videos[0];

      console.log('\n第一个视频信息:');
      console.log('  siteKey:', firstSite.siteKey);
      console.log('  siteName:', firstSite.siteName);
      console.log('  vod_id:', firstVideo.vod_id);
      console.log('  vod_name:', firstVideo.vod_name);

      console.log('\n尝试获取播放信息...');
      const playerResponse = await axios.post('http://localhost:3000/player/info', {
        siteKey: firstSite.siteKey,
        siteName: firstSite.siteName,
        videoId: firstVideo.vod_id,
        videoName: firstVideo.vod_name
      }, { timeout: 30000 });

      console.log('播放信息响应:', JSON.stringify(playerResponse.data, null, 2));
    }

  } catch (error) {
    console.error('错误:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
  }
}

testAPI();
