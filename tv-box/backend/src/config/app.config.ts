import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  name: process.env.APP_NAME || 'TVBox Backend',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  apiVersion: process.env.API_VERSION || '1.0',
}));
