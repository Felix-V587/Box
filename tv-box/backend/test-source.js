const axios = require('axios');

async function testSource() {
  try {
    console.log('正在请求: http://www.饭太硬.com/tv');
    const response = await axios.get('http://www.饭太硬.com/tv', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    console.log('\n响应状态:', response.status);
    console.log('响应类型:', typeof response.data);
    console.log('数据长度:', response.data.length);

    // 显示前500个字符
    console.log('\n前500个字符:');
    console.log(response.data.substring(0, 500));

    // 检查是否是Base64
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    const isBase64 = base64Regex.test(response.data.trim());

    console.log('\n是否可能是Base64:', isBase64);

    // 如果是Base64，尝试解码
    if (isBase64) {
      try {
        const decoded = Buffer.from(response.data, 'base64').toString('utf-8');
        console.log('\nBase64解码后前500字符:');
        console.log(decoded.substring(0, 500));

        // 尝试解析JSON
        try {
          const json = JSON.parse(decoded);
          console.log('\n解析为JSON成功!');
          console.log('JSON结构:', JSON.stringify(json, null, 2).substring(0, 1000));
        } catch (e) {
          console.log('\n不是JSON格式');
        }
      } catch (e) {
        console.log('\nBase64解码失败:', e.message);
      }
    }

    // 尝试直接解析JSON
    try {
      const json = JSON.parse(response.data);
      console.log('\n直接解析JSON成功!');
      console.log('JSON结构:', JSON.stringify(json, null, 2).substring(0, 1000));
    } catch (e) {
      console.log('\n不是直接的JSON格式');
    }

  } catch (error) {
    console.error('请求失败:', error.message);
    if (error.response) {
      console.error('状态码:', error.response.status);
    }
  }
}

testSource();
