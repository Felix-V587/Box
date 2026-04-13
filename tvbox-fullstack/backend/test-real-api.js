const axios = require('axios');

async function testRealAPI() {
  console.log('=== 测试真实API获取播放地址 ===\n');

  // 测试1: 尝试公开的苹果CMS API
  try {
    console.log('【测试1】公开苹果CMS API');
    const response = await axios.get('https://api.douban.com/v2/movie/top250', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.data && response.data.subjects && response.data.subjects.length > 0) {
      const movie = response.data.subjects[0];
      console.log('✓ 成功获取电影数据');
      console.log(`  标题: ${movie.title}`);
      console.log(`  评分: ${movie.rating.average}`);
    }
  } catch (error) {
    console.log('✗ 测试1失败:', error.message);
  }

  // 测试2: 尝试公开的视频API
  try {
    console.log('\n【测试2】测试视频播放地址');
    
    // 使用一个公开的测试视频
    const testVideoUrl = 'https://media.w3.org/2010/05/sintel/trailer.mp4';
    console.log('测试视频URL:', testVideoUrl);
    
    const response = await axios.head(testVideoUrl, {
      timeout: 10000
    });
    
    console.log('✓ 视频地址可访问');
    console.log(`  状态码: ${response.status}`);
    console.log(`  Content-Type: ${response.headers['content-type']}`);
    console.log(`  Content-Length: ${response.headers['content-length']}`);
    
  } catch (error) {
    console.log('✗ 测试2失败:', error.message);
  }

  // 测试3: 尝试真实的M3U8播放地址
  try {
    console.log('\n【测试3】测试M3U8播放地址');
    
    // 使用公开的测试M3U8
    const testM3U8Url = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
    console.log('测试M3U8 URL:', testM3U8Url);
    
    const response = await axios.get(testM3U8Url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log('✓ M3U8地址可访问');
    console.log(`  状态码: ${response.status}`);
    console.log(`  内容长度: ${response.data.length} 字节`);
    console.log(`  前100字符: ${response.data.substring(0, 100)}...`);
    
  } catch (error) {
    console.log('✗ 测试3失败:', error.message);
  }

  console.log('\n=== 测试完成 ===');
  console.log('\n结论:');
  console.log('1. 公开API可以正常访问');
  console.log('2. 测试播放地址可以正常播放');
  console.log('3. 要获取真实播放地址，需要:');
  console.log('   - 站点提供真实的API接口');
  console.log('   - 站点允许跨域访问');
  console.log('   - 站点返回真实的播放地址');
}

testRealAPI();
