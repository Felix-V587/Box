const axios = require('axios');

async function testBackendApi() {
  console.log('=== 测试后端API ===\n');

  const url = 'http://www.饭太硬.com/tv';
  const apiUrl = 'http://localhost:3000/api/v1/sources/parse-url';

  try {
    console.log('1. 测试后端解析接口');
    console.log('   URL:', apiUrl);
    console.log('   参数:', { url });
    console.log();

    const response = await axios.post(apiUrl, { url }, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('✓ 请求成功');
    console.log('响应状态:', response.status);
    console.log('响应数据:');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('\n✗ 请求失败');
    console.error('错误信息:', error.message);

    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    }

    if (error.code === 'ECONNREFUSED') {
      console.error('\n提示: 后端服务未启动');
      console.error('请先启动后端服务: cd tv-box/backend && npm run start:dev');
    }
  }
}

async function testDirectParse() {
  console.log('\n=== 直接测试解析逻辑 ===\n');

  const url = 'http://www.饭太硬.com/tv';

  try {
    console.log('1. 获取配置数据');
    const response = await axios.get(url, {
      timeout: 15000,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 10)',
      },
    });

    const data = Buffer.from(response.data);
    console.log('✓ 数据大小:', data.length, 'bytes');

    const text = data.toString('utf-8');

    // 查找TVBox标记
    console.log('\n2. 查找TVBox Base64标记');
    const base64Pattern = /[A-Za-z]{8}\*\*/;
    const match = text.match(base64Pattern);

    if (match) {
      console.log('✓ 找到标记:', match[0]);

      const startIndex = text.indexOf(match[0]) + 10;
      const base64Content = text.substring(startIndex);

      console.log('✓ Base64内容长度:', base64Content.length);

      const decoded = Buffer.from(base64Content, 'base64').toString('utf-8');
      console.log('✓ 解码后长度:', decoded.length);

      const json = JSON.parse(decoded);
      console.log('✓ JSON解析成功');

      if (json.video) {
        console.log('✓ 找到', json.video.length, '个数据源');
        console.log('\n第一个数据源:');
        console.log(JSON.stringify(json.video[0], null, 2));
      }

    } else {
      console.log('✗ 未找到标记');
    }

  } catch (error) {
    console.error('✗ 错误:', error.message);
  }
}

async function main() {
  await testDirectParse();
  console.log('\n' + '='.repeat(50) + '\n');
  await testBackendApi();
}

main();
