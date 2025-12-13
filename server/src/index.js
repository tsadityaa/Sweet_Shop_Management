'use strict';

const http = require('http');
const app = require('./server');
const { connectDB } = require('./lib/db');
const { env } = require('./lib/env');

const PORT = env.PORT || 5000;

async function start() {
  try {
    await connectDB();

    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
