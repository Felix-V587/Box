const axios = require('axios');

async function testTvBoxBase64() {
  const url = 'http://www.饭太硬.com/tv';
  console.log('=== 测试TVBox Base64解码 ===\n');
  console.log('URL:', url, '\n');

  try {
    // 获取数据
    const response = await axios.get(url, {
      timeout: 15000,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 10; MI 9 Build/QKQ1.190825.002)',
      },
    });

    const data = Buffer.from(response.data);
    console.log('数据大小:', data.length, 'bytes\n');

    // 转换为文本
    const text = data.toString('utf-8');

    // 查找TVBox Base64标记
    console.log('=== 查找TVBox Base64标记 ===');
    const base64Pattern = /[A-Za-z]{8}\*\*/;
    const match = text.match(base64Pattern);

    if (match) {
      console.log('✓ 找到标记:', match[0]);
      console.log('标记位置:', text.indexOf(match[0]));

      // 提取Base64内容
      const startIndex = text.indexOf(match[0]) + 10;
      const base64Content = text.substring(startIndex);

      console.log('Base64内容长度:', base64Content.length);
      console.log('Base64前100字符:', base64Content.substring(0, 100));

      // 解码
      console.log('\n=== 解码Base64 ===');
      try {
        const decoded = Buffer.from(base64Content, 'base64').toString('utf-8');
        console.log('✓ 解码成功');
        console.log('解码后长度:', decoded.length);
        console.log('解码后前500字符:\n', decoded.substring(0, 500));

        // 尝试解析JSON
        console.log('\n=== 解析JSON ===');
        try {
          const json = JSON.parse(decoded);
          console.log('✓✓✓ JSON解析成功！');
          console.log('JSON类型:', Array.isArray(json) ? '数组' : '对象');

          if (json.video) {
            console.log('video字段存在，包含', json.video.length, '个数据源');
            console.log('第一个数据源:', JSON.stringify(json.video[0], null, 2));
          } else if (json.sites) {
            console.log('sites字段存在，包含', json.sites.length, '个数据源');
            console.log('第一个数据源:', JSON.stringify(json.sites[0], null, 2));
          } else if (Array.isArray(json)) {
            console.log('数组格式，包含', json.length, '个数据源');
            console.log('第一个数据源:', JSON.stringify(json[0], null, 2));
          }

          // 保存解析结果
          const fs = require('fs');
          fs.writeFileSync('parsed-config.json', JSON.stringify(json, null, 2));
          console.log('\n✓ 配置已保存到 parsed-config.json');

        } catch (e) {
          console.log('✗ JSON解析失败:', e.message);
          console.log('尝试查找JSON片段...');

          // 尝试提取JSON
          const jsonMatch = decoded.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            console.log('找到JSON片段，长度:', jsonMatch[0].length);
            try {
              const json = JSON.parse(jsonMatch[0]);
              console.log('✓ JSON片段解析成功！');

              const fs = require('fs');
              fs.writeFileSync('parsed-config.json', JSON.stringify(json, null, 2));
              console.log('✓ 配置已保存到 parsed-config.json');
            } catch (e2) {
              console.log('✗ JSON片段解析失败:', e2.message);
            }
          }
        }

      } catch (e) {
        console.log('✗ Base64解码失败:', e.message);
      }

    } else {
      console.log('✗ 未找到TVBox Base64标记');

      // 尝试其他方法
      console.log('\n尝试查找其他标记...');
      const markers = ['**', 'video', 'sites', '{', '['];
      markers.forEach(marker => {
        const index = text.indexOf(marker);
        if (index !== -1) {
          console.log(`✓ 找到 "${marker}" 在位置 ${index}`);
          console.log(`  上下文: ${text.substring(Math.max(0, index - 20), index + 50)}`);
        }
      });
    }

  } catch (error) {
    console.error('\n请求失败:', error.message);
    if (error.response) {
      console.error('状态码:', error.response.status);
    }
  }
}

testTvBoxBase64();
