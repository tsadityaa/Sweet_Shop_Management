'use strict';

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load .env if present
const envPath = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sweetshop',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
  ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES || '15m',
  REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES || '7d',
  COOKIE_SECURE: String(process.env.COOKIE_SECURE || 'false') === 'true',
  COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || 'None',
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || undefined,
};

module.exports = { env };
