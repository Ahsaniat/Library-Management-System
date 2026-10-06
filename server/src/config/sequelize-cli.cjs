/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

function buildConfig() {
  return {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'library_db',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    dialect: 'postgres',
    logging: false,
  };
}

module.exports = {
  development: buildConfig(),
  test: { ...buildConfig(), database: process.env.DB_NAME || 'library_test' },
  production: buildConfig(),
};
