const config = require('./output/config.json');

const searchableSites = config.sites.filter(s => s.searchable === 1);
console.log('支持搜索的站点数量:', searchableSites.length);
console.log('\n站点列表:');
searchableSites.forEach((s, i) => {
  console.log(`${i+1}. ${s.name} (${s.key})`);
  console.log(`   API: ${s.api}`);
  console.log(`   Type: ${s.type}`);
  if (s.quickSearch !== undefined) console.log(`   QuickSearch: ${s.quickSearch}`);
  if (s.ext) console.log(`   Ext:`, typeof s.ext === 'object' ? JSON.stringify(s.ext) : s.ext);
});
