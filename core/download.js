const axios = require('axios');
const fs = require('fs');
const { randomUA } = require('./utils');

async function downloadFile(url, dest) {
  const res = await axios.get(url, {
    responseType: 'stream',
    timeout: 15000,
    headers: { 'User-Agent': randomUA() },
    validateStatus: s => s === 200
  });

  await new Promise((resolve, reject) => {
    const w = fs.createWriteStream(dest);
    res.data.pipe(w);
    w.on('finish', resolve);
    w.on('error', reject);
  });
}

module.exports = { downloadFile };
