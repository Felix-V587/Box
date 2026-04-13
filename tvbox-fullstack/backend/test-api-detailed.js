const axios = require('axios');

async function testAPI() {
  try {
    console.log('=== 1. 测试配置加载 ===');
    const configResponse = await axios.post('http://localhost:3000/config/load', {
      url: 'http://www.饭太硬.com/tv'
    }, { timeout: 90000 });

    console.log('✓ 配置加载成功');
    console.log('  站点数:', configResponse.data.data?.sites?.length || 0);
    console.log('  Spider:', configResponse.data.data?.spider?.substring(0, 60) || 'N/A');

    console.log('\n=== 2. 测试搜索"仙逆" ===');
    const searchResponse = await axios.post('http://localhost:3000/search', {
      keyword: '仙逆'
    }, { timeout: 60000 });

    console.log('✓ 搜索成功');
    console.log('  总站点数:', searchResponse.data.data?.totalSites || 0);
    console.log('  成功站点:', searchResponse.data.data?.successSites || 0);
    console.log('  总结果数:', searchResponse.data.data?.totalVideos || 0);

    // 显示搜索结果
    const results = searchResponse.data.data?.results || [];
    console.log('\n搜索结果详情:');
    results.forEach((siteResult, index) => {
      if (siteResult.videos.length > 0) {
        console.log(`\n【${index + 1}】${siteResult.siteName}`);
        siteResult.videos.forEach((video, vIndex) => {
          console.log(`  ${vIndex + 1}. ${video.vod_name} (${video.vod_remarks || 'N/A'})`);
        });
      }
    });

    // 获取第一个搜索结果的播放地址
    if (results.length > 0 && results[0].videos.length > 0) {
      const firstSite = results[0];
      const firstVideo = firstSite.videos[0];

      console.log('\n=== 3. 测试播放地址获取 ===');
      console.log('选择视频:', firstVideo.vod_name);
      console.log('站点:', firstSite.siteName);
      console.log('视频ID:', firstVideo.vod_id);

      const playerResponse = await axios.post('http://localhost:3000/player/info', {
        siteKey: firstSite.siteKey,
        siteName: firstSite.siteName,
        videoId: firstVideo.vod_id,
        videoName: firstVideo.vod_name
      }, { timeout: 30000 });

      console.log('\n✓ 播放信息获取成功');
      console.log('  线路数:', playerResponse.data.data?.sources?.length || 0);

      const sources = playerResponse.data.data?.sources || [];
      sources.forEach((source, sIndex) => {
        console.log(`\n  【线路${sIndex + 1}】${source.name}`);
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
      });

      // 选择第1集的播放地址
      if (sources.length > 0 && sources[0].episodes?.length > 0) {
        const episode = sources[0].episodes[0];
        console.log('\n=== 4. 最终结果 ===');
        console.log('视频:', firstVideo.vod_name);
        console.log('线路:', sources[0].name);
        console.log('剧集:', episode.name);
        console.log('类型:', episode.isM3U8 ? 'M3U8' : episode.isMP4 ? 'MP4' : '其他');
        console.log('播放地址:', episode.url);
      }
    }

  } catch (error) {
    console.error('\n✗ 错误:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testAPI();
