import { registerAs } from '@nestjs/config';

export default registerAs('spider', () => ({
  timeout: parseInt(process.env.SPIDER_TIMEOUT || '10000', 10),
  memoryLimit: parseInt(process.env.SPIDER_MEMORY_LIMIT || '128', 10),
  concurrentLimit: parseInt(process.env.SPIDER_CONCURRENT_LIMIT || '5', 10),
}));
