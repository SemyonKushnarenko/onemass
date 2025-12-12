import type { DataSourceOptions } from 'typeorm';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export function dataSourceFactory(): DataSourceOptions {
  const isTest = process.env.NODE_ENV === 'test';
  const isProd = process.env.NODE_ENV === 'production';

  return {
    type: 'postgres',
    host: process.env.TEST_POSTGRES_HOST ?? process.env.POSTGRES_HOST,
    port: parseInt(
      (isTest ? process.env.TEST_DB_PORT : process.env.DB_PORT) ?? '5432',
    ),
    username: process.env.TEST_POSTGRES_USER ?? process.env.POSTGRES_USER,
    password: process.env.TEST_POSTGRES_PASS ?? process.env.POSTGRES_PASS,
    database: process.env.TEST_POSTGRES_NAME ?? process.env.POSTGRES_NAME,
    entities: isProd
      ? ['dist/**/*.entity.js']
      : [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: isProd
      ? ['dist/src/migrations/*.js']
      : [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: isTest,
    dropSchema: isTest,
  };
}

export default new DataSource(dataSourceFactory());
