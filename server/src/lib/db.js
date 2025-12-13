'use strict';

const mongoose = require('mongoose');
const { env } = require('./env');

let isConnected = false;

async function connectDB() {
  if (isConnected) return mongoose.connection;
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  isConnected = true;
  return mongoose.connection;
}

module.exports = { connectDB };
