require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'webook_jwt_super_secret_key_2026',
  MONGO_URI: process.env.MONGO_URI || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173'
};
