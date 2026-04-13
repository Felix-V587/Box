const axios = require('axios');
const fs = require('fs');

async function analyzeSource() {
  try {
    console.log('正在请求: http://www.饭太硬.com/tv\n');

    const response = await axios.get('http://www.饭太硬.com/tv', {
      timeout: 15000,
      responseType: 'arraybuffer', // 获取原始二进制数据
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'identity', // 禁用自动解压
      },
    });

    console.log('响应状态:', response.status);
    console.log('响应头:', JSON.stringify(response.headers, null, 2));
    console.log('数据长度:', response.data.length, 'bytes\n');

    // 保存原始数据
    fs.writeFileSync('raw-data.bin', response.data);
    console.log('原始数据已保存到 raw-data.bin\n');

    // 尝试不同的解码方式
    const data = response.data;

    // 1. 尝试UTF-8解码
    console.log('=== 尝试UTF-8解码 ===');
    try {
      const utf8Text = data.toString('utf-8');
      console.log('前200字符:', utf8Text.substring(0, 200));

      // 检查是否包含JSON标记
      if (utf8Text.includes('{') || utf8Text.includes('[')) {
        console.log('✓ 包含JSON标记');
        // 尝试提取JSON
        const jsonMatch = utf8Text.match(/[\[{].*[\]}]/s);
        if (jsonMatch) {
          console.log('找到JSON片段:', jsonMatch[0].substring(0, 500));
        }
      }
    } catch (e) {
      console.log('✗ UTF-8解码失败');
    }

    // 2. 尝试Base64解码
    console.log('\n=== 尝试Base64解码 ===');
    try {
      const base64Text = data.toString('utf-8').trim();
      // 检查是否是有效的Base64
      if (/^[A-Za-z0-9+/=\s]+$/.test(base64Text)) {
        console.log('✓ 数据看起来像Base64');
        const decoded = Buffer.from(base64Text, 'base64');
        console.log('解码后长度:', decoded.length, 'bytes');
        console.log('解码后前200字符:', decoded.toString('utf-8').substring(0, 200));

        // 保存解码后的数据
        fs.writeFileSync('decoded-data.bin', decoded);
        console.log('解码后数据已保存到 decoded-data.bin');

        // 尝试解析JSON
        try {
          const json = JSON.parse(decoded.toString('utf-8'));
          console.log('\n✓✓✓ JSON解析成功！');
          console.log('JSON类型:', Array.isArray(json) ? '数组' : '对象');
          console.log('JSON结构:', JSON.stringify(json, null, 2).substring(0, 2000));
        } catch (e) {
          console.log('✗ JSON解析失败:', e.message);
        }
      } else {
        console.log('✗ 数据不是有效的Base64');
      }
    } catch (e) {
      console.log('✗ Base64解码失败:', e.message);
    }

    // 3. 查找特定标记
    console.log('\n=== 查找特定标记 ===');
    const text = data.toString('utf-8');
    const markers = ['video', 'sources', 'spider', 'jar', 'js', 'py', 'http'];
    markers.forEach(marker => {
      const count = (text.match(new RegExp(marker, 'gi')) || []).length;
      if (count > 0) {
        console.log(`✓ 找到 "${marker}" 标记: ${count} 次`);
        // 显示上下文
        const index = text.toLowerCase().indexOf(marker.toLowerCase());
        if (index !== -1) {
          const context = text.substring(Math.max(0, index - 50), index + 100);
          console.log(`  上下文: ...${context}...`);
        }
      }
    });

    // 4. 尝试GZIP解压
    console.log('\n=== 尝试GZIP解压 ===');
    try {
      const zlib = require('zlib');
      const decompressed = zlib.gunzipSync(data);
      console.log('✓ GZIP解压成功');
      console.log('解压后长度:', decompressed.length, 'bytes');
      console.log('解压后前200字符:', decompressed.toString('utf-8').substring(0, 200));

      // 保存解压后的数据
      fs.writeFileSync('decompressed-data.bin', decompressed);
      console.log('解压后数据已保存到 decompressed-data.bin');
    } catch (e) {
      console.log('✗ GZIP解压失败:', e.message);
    }

    // 5. 分析数据结构
    console.log('\n=== 数据结构分析 ===');
    console.log('前100字节(hex):', data.slice(0, 100).toString('hex'));
    console.log('前100字节(ascii):', data.slice(0, 100).toString('ascii'));

    // 检查文件头
    const header = data.slice(0, 4);
    console.log('文件头(hex):', header.toString('hex'));

    // 常见文件头识别
    const fileHeaders = {
      '89504e47': 'PNG',
      '47494638': 'GIF',
      'ffd8ffe0': 'JPEG',
      'ffd8ffe1': 'JPEG',
      '504b0304': 'ZIP',
      '1f8b08': 'GZIP',
      '425a68': 'BZIP2',
    };

    const headerHex = header.toString('hex');
    Object.entries(fileHeaders).forEach(([sig, type]) => {
      if (headerHex.startsWith(sig)) {
        console.log(`✓ 识别为 ${type} 文件`);
      }
    });

  } catch (error) {
    console.error('\n请求失败:', error.message);
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应头:', JSON.stringify(error.response.headers, null, 2));
    }
  }
}

analyzeSource();
