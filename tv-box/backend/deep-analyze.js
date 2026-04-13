const axios = require('axios');
const fs = require('fs');
const zlib = require('zlib');

async function deepAnalyze() {
  const url = 'http://www.饭太硬.com/tv';
  console.log('=== 深度分析数据源 ===\n');
  console.log('URL:', url, '\n');

  try {
    // 获取数据
    const response = await axios.get(url, {
      timeout: 15000,
      responseType: 'arraybuffer',
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 10; MI 9 Build/QKQ1.190825.002)',
        'Accept': '*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive',
      },
    });

    console.log('响应状态:', response.status);
    console.log('响应头:');
    Object.entries(response.headers).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    const data = Buffer.from(response.data);
    console.log('\n数据大小:', data.length, 'bytes');

    // 保存原始数据
    fs.writeFileSync('source-raw.bin', data);
    console.log('✓ 原始数据已保存到 source-raw.bin\n');

    // 分析文件头
    console.log('=== 文件头分析 ===');
    const header = data.slice(0, 20);
    console.log('前20字节(hex):', header.toString('hex'));
    console.log('前20字节(ascii):', header.toString('ascii').replace(/[^\x20-\x7E]/g, '.'));

    // 检测文件类型
    const hex = header.toString('hex');
    if (hex.startsWith('89504e47')) console.log('✓ 检测到 PNG 文件');
    if (hex.startsWith('47494638')) console.log('✓ 检测到 GIF 文件');
    if (hex.startsWith('ffd8ff')) console.log('✓ 检测到 JPEG 文件');
    if (hex.startsWith('504b0304')) console.log('✓ 检测到 ZIP 文件');
    if (hex.startsWith('1f8b')) console.log('✓ 检测到 GZIP 文件');
    if (hex.startsWith('425a')) console.log('✓ 检测到 BZIP2 文件');

    // 尝试各种解码
    console.log('\n=== 解码尝试 ===\n');

    // 1. 直接UTF-8
    console.log('1. 直接UTF-8解码:');
    try {
      const utf8 = data.toString('utf-8');
      console.log('  长度:', utf8.length, '字符');
      console.log('  前200字符:', utf8.substring(0, 200));

      // 检查是否包含特定标记
      const markers = ['video', 'spider', 'jar', 'http://', 'https://', '{', '['];
      markers.forEach(m => {
        const count = (utf8.match(new RegExp(m, 'gi')) || []).length;
        if (count > 0) console.log(`  ✓ 找到 "${m}": ${count} 次`);
      });

      // 尝试解析JSON
      try {
        const json = JSON.parse(utf8);
        console.log('  ✓✓✓ JSON解析成功！');
        fs.writeFileSync('decoded-json.json', JSON.stringify(json, null, 2));
        console.log('  已保存到 decoded-json.json');
        return;
      } catch (e) {
        console.log('  ✗ 不是有效JSON');
      }
    } catch (e) {
      console.log('  ✗ 失败:', e.message);
    }

    // 2. GZIP解压
    console.log('\n2. GZIP解压:');
    try {
      const decompressed = zlib.gunzipSync(data);
      console.log('  ✓ 解压成功');
      console.log('  解压后大小:', decompressed.length, 'bytes');
      console.log('  前200字符:', decompressed.toString('utf-8').substring(0, 200));

      fs.writeFileSync('source-gzip.bin', decompressed);

      try {
        const json = JSON.parse(decompressed.toString('utf-8'));
        console.log('  ✓✓✓ JSON解析成功！');
        fs.writeFileSync('decoded-json.json', JSON.stringify(json, null, 2));
        console.log('  已保存到 decoded-json.json');
        return;
      } catch (e) {
        console.log('  ✗ 不是有效JSON');
      }
    } catch (e) {
      console.log('  ✗ 失败:', e.message);
    }

    // 3. Base64解码
    console.log('\n3. Base64解码:');
    try {
      const text = data.toString('utf-8').trim();
      if (/^[A-Za-z0-9+/=\s]+$/.test(text)) {
        console.log('  ✓ 数据是有效Base64');
        const decoded = Buffer.from(text, 'base64');
        console.log('  解码后大小:', decoded.length, 'bytes');
        console.log('  前200字符:', decoded.toString('utf-8').substring(0, 200));

        fs.writeFileSync('source-base64.bin', decoded);

        try {
          const json = JSON.parse(decoded.toString('utf-8'));
          console.log('  ✓✓✓ JSON解析成功！');
          fs.writeFileSync('decoded-json.json', JSON.stringify(json, null, 2));
          console.log('  已保存到 decoded-json.json');
          return;
        } catch (e) {
          console.log('  ✗ 不是有效JSON，尝试进一步解码...');

          // 尝试GZIP解压Base64解码后的数据
          try {
            const decompressed = zlib.gunzipSync(decoded);
            console.log('  ✓ GZIP解压成功');
            console.log('  解压后大小:', decompressed.length, 'bytes');
            console.log('  前200字符:', decompressed.toString('utf-8').substring(0, 200));

            fs.writeFileSync('source-base64-gzip.bin', decompressed);

            try {
              const json = JSON.parse(decompressed.toString('utf-8'));
              console.log('  ✓✓✓ JSON解析成功！');
              fs.writeFileSync('decoded-json.json', JSON.stringify(json, null, 2));
              console.log('  已保存到 decoded-json.json');
              return;
            } catch (e) {
              console.log('  ✗ 仍然不是有效JSON');
            }
          } catch (e) {
            console.log('  ✗ GZIP解压失败:', e.message);
          }
        }
      } else {
        console.log('  ✗ 数据不是有效Base64');
      }
    } catch (e) {
      console.log('  ✗ 失败:', e.message);
    }

    // 4. 查找JSON片段
    console.log('\n4. 查找JSON片段:');
    try {
      const text = data.toString('utf-8');

      // 查找 { 开始的JSON对象
      const startBrace = text.indexOf('{');
      if (startBrace !== -1) {
        console.log('  找到 { 在位置', startBrace);

        // 尝试找到匹配的 }
        let depth = 0;
        let endBrace = -1;
        for (let i = startBrace; i < text.length; i++) {
          if (text[i] === '{') depth++;
          if (text[i] === '}') depth--;
          if (depth === 0) {
            endBrace = i;
            break;
          }
        }

        if (endBrace !== -1) {
          const jsonStr = text.substring(startBrace, endBrace + 1);
          console.log('  提取长度:', jsonStr.length, '字符');
          console.log('  前200字符:', jsonStr.substring(0, 200));

          try {
            const json = JSON.parse(jsonStr);
            console.log('  ✓✓✓ JSON解析成功！');
            fs.writeFileSync('decoded-json.json', JSON.stringify(json, null, 2));
            console.log('  已保存到 decoded-json.json');
            return;
          } catch (e) {
            console.log('  ✗ 解析失败:', e.message);
          }
        }
      }

      // 查找 [ 开始的JSON数组
      const startBracket = text.indexOf('[');
      if (startBracket !== -1) {
        console.log('  找到 [ 在位置', startBracket);

        let depth = 0;
        let endBracket = -1;
        for (let i = startBracket; i < text.length; i++) {
          if (text[i] === '[') depth++;
          if (text[i] === ']') depth--;
          if (depth === 0) {
            endBracket = i;
            break;
          }
        }

        if (endBracket !== -1) {
          const jsonStr = text.substring(startBracket, endBracket + 1);
          console.log('  提取长度:', jsonStr.length, '字符');
          console.log('  前200字符:', jsonStr.substring(0, 200));

          try {
            const json = JSON.parse(jsonStr);
            console.log('  ✓✓✓ JSON解析成功！');
            fs.writeFileSync('decoded-json.json', JSON.stringify(json, null, 2));
            console.log('  已保存到 decoded-json.json');
            return;
          } catch (e) {
            console.log('  ✗ 解析失败:', e.message);
          }
        }
      }
    } catch (e) {
      console.log('  ✗ 失败:', e.message);
    }

    // 5. 尝试其他编码
    console.log('\n5. 尝试其他编码:');
    const encodings = ['utf16le', 'latin1', 'ascii'];
    for (const enc of encodings) {
      try {
        const text = data.toString(enc);
        console.log(`  ${enc}: 前100字符 -`, text.substring(0, 100));

        try {
          const json = JSON.parse(text);
          console.log(`  ✓✓✓ ${enc} JSON解析成功！`);
          fs.writeFileSync('decoded-json.json', JSON.stringify(json, null, 2));
          return;
        } catch (e) {
          // 继续尝试下一个编码
        }
      } catch (e) {
        console.log(`  ✗ ${enc} 失败`);
      }
    }

    console.log('\n✗✗✗ 所有解码方法都失败了');
    console.log('请检查保存的 source-raw.bin 文件');

  } catch (error) {
    console.error('\n请求失败:', error.message);
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应头:', JSON.stringify(error.response.headers, null, 2));
    }
  }
}

deepAnalyze();
