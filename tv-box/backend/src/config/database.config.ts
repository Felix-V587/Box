import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'better-sqlite3',
  database: configService.get<string>('DB_DATABASE') || join(__dirname, '../../data/tvbox.db'),
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  synchronize: configService.get<string>('DB_SYNCHRONIZE') === 'true',
  logging: configService.get<string>('DB_LOGGING') === 'true',
  migrations: [join(__dirname, '../database/migrations/*{.ts,.js}')],
  migrationsRun: true,
});
