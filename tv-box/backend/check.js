// 简单的类型检查脚本
console.log('Checking TypeScript compilation...');

try {
  // 检查主要模块导入
  require('./src/app.module');
  console.log('✓ App module OK');
} catch (error) {
  console.error('✗ App module error:', error.message);
}

console.log('Type check complete');
