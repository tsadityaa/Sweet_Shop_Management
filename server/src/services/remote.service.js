'use strict';

// Example axios client for server-to-server communication
const axios = require('axios');

const client = axios.create({
  timeout: 8000,
  withCredentials: true,
});

async function ping(url) {
  const res = await client.get(url);
  return res.data;
}

module.exports = { client, ping };
