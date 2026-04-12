/**
 * Spider引擎测试
 * 演示如何使用Spider引擎
 */

const { JSEngine, SpiderWrapper } = require('./dist/index');

async function testSpider() {
    console.log('========================================');
    console.log('TVBox Spider Engine 测试');
    console.log('========================================\n');

    try {
        // 创建一个简单的测试Spider
        const testSpiderCode = `
function init(ext) {
    console.log('Spider initialized with ext:', ext);
}

function home(filter) {
    const result = {
        class: [
            { type_id: '1', type_name: '电影' },
            { type_id: '2', type_name: '电视剧' },
            { type_id: '3', type_name: '综艺' },
            { type_id: '4', type_name: '动漫' },
        ],
        filters: {}
    };
    return JSON.stringify(result);
}

function category(tid, pg, filter, extend) {
    const result = {
        list: [
            {
                vod_id: '1',
                vod_name: '测试视频1',
                vod_pic: 'https://example.com/pic1.jpg',
                vod_remarks: '高清',
                vod_year: '2024',
                vod_type: '电影',
                vod_area: '中国',
            },
            {
                vod_id: '2',
                vod_name: '测试视频2',
                vod_pic: 'https://example.com/pic2.jpg',
                vod_remarks: '超清',
                vod_year: '2024',
                vod_type: '电影',
                vod_area: '美国',
            }
        ],
        page: pg,
        pagecount: 1,
        limit: 20,
        total: 2
    };
    return JSON.stringify(result);
}

function search(key, quick) {
    const result = {
        list: [
            {
                vod_id: '1',
                vod_name: key + ' - 搜索结果1',
                vod_pic: 'https://example.com/search1.jpg',
                vod_remarks: '搜索结果',
            },
            {
                vod_id: '2',
                vod_name: key + ' - 搜索结果2',
                vod_pic: 'https://example.com/search2.jpg',
                vod_remarks: '搜索结果',
            }
        ]
    };
    return JSON.stringify(result);
}

function detail(ids) {
    const result = {
        list: [
            {
                vod_id: ids[0],
                vod_name: '测试视频详情',
                vod_pic: 'https://example.com/detail.jpg',
                vod_remarks: '更新至第10集',
                vod_play_from: '线路1$$$线路2$$$线路3',
                vod_play_url: '第1集$https://example.com/ep1.m3u8#第2集$https://example.com/ep2.m3u8#第3集$https://example.com/ep3.m3u8$$$第1集$https://example.com/ep1.mp4#第2集$https://example.com/ep2.mp4$$$第1集$https://example.com/backup1.m3u8'
            }
        ]
    };
    return JSON.stringify(result);
}

function play(flag, id, vipFlags) {
    const result = {
        parse: 0,
        url: id,
        jx: 0,
        header: {
            'User-Agent': 'Mozilla/5.0'
        }
    };
    return JSON.stringify(result);
}
`;

        // 创建JSEngine
        console.log('【1】创建JSEngine');
        const engine = new JSEngine({
            timeout: 30000,
            enableLog: true,
        });

        // 执行Spider代码
        console.log('【2】执行Spider代码');
        await engine.execute(testSpiderCode);

        // 创建Spider包装器
        console.log('【3】创建Spider包装器');
        const wrapper = new SpiderWrapper(engine, 'test', {
            timeout: 30000,
            enableLog: true,
        });

        // 初始化Spider
        console.log('【4】初始化Spider');
        await wrapper.init('test-ext');

        // 测试首页
        console.log('\n【5】测试首页');
        const homeResult = await wrapper.home(true);
        console.log('首页结果:', homeResult);
        const homeData = JSON.parse(homeResult);
        console.log('分类数量:', homeData.class.length);

        // 测试分类
        console.log('\n【6】测试分类');
        const categoryResult = await wrapper.category('1', '1', true);
        console.log('分类结果:', categoryResult);
        const categoryData = JSON.parse(categoryResult);
        console.log('视频数量:', categoryData.list.length);

        // 测试搜索
        console.log('\n【7】测试搜索');
        const searchResult = await wrapper.search('仙逆', false);
        console.log('搜索结果:', searchResult);
        const searchData = JSON.parse(searchResult);
        console.log('搜索结果数量:', searchData.list.length);

        // 测试详情
        console.log('\n【8】测试详情');
        const detailResult = await wrapper.detail(['1']);
        console.log('详情结果:', detailResult);
        const detailData = JSON.parse(detailResult);
        console.log('线路数:', detailData.list[0].vod_play_from.split('$$$').length);

        // 测试播放
        console.log('\n【9】测试播放');
        const playResult = await wrapper.play('线路1', 'https://example.com/ep1.m3u8');
        console.log('播放结果:', playResult);
        const playData = JSON.parse(playResult);
        console.log('播放地址:', playData.url);

        // 清理
        console.log('\n【10】清理资源');
        wrapper.destroy();

        console.log('\n========================================');
        console.log('✓ 测试完成');
        console.log('========================================');

    } catch (error) {
        console.error('\n✗ 测试失败:', error.message);
        if (error.details) {
            console.error('详情:', error.details);
        }
        if (error.stack) {
            console.error('堆栈:', error.stack);
        }
    }
}

// 运行测试
testSpider().catch(console.error);
