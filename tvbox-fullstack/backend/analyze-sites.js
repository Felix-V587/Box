const config = require('./output/config.json');

const sites = config.sites.filter(s => s.searchable === 1);
console.log('可搜索站点数:', sites.length);

console.log('\n=== 站点详情（前5个）===');
sites.slice(0, 5).forEach((s, i) => {
  console.log(`${i+1}. ${s.name}`);
  console.log(`   API: ${s.api}`);
  console.log(`   Ext: ${typeof s.ext === 'object' ? JSON.stringify(s.ext) : s.ext}`);
});

console.log('\n=== 播放站点分析 ===');
const playSites = sites.filter(s => 
  s.api.includes('csp_AppSx') || 
  s.api.includes('csp_AppTT') ||
  s.api.includes('csp_T4')
);

console.log('可播放站点数:', playSites.length);
console.log('\nAppSx站点:');
playSites.filter(s => s.api.includes('csp_AppSx') || s.api.includes('csp_AppTT')).forEach(s => {
  console.log(`- ${s.name}`);
  console.log(`  ext.siteUrl: ${s.ext?.siteUrl || 'N/A'}`);
});
