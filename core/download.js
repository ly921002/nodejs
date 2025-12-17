const axios = require('axios');
const fs = require('fs');
const http = require('http');
const https = require('https');
const { randomUA } = require('./utils');

/**
 * 探测 IPv6 是否可用
 */
async function detectIPStack() {
  try {
    await axios.get('https://ipv6.google.com', {
      timeout: 3000,
      httpAgent: new http.Agent({ family: 6 }),
      httpsAgent: new https.Agent({ family: 6 }),
      validateStatus: s => s === 200
    });
    return 6;
  } catch {
    return 4;
  }
}

/**
 * 自动识别 v4 / v6 下载
 */
async function downloadFile(url, dest) {
  const family = await detectIPStack();

  const agentOpts = { family };
  const httpAgent = new http.Agent(agentOpts);
  const httpsAgent = new https.Agent(agentOpts);

  const res = await axios.get(url, {
    responseType: 'stream',
    timeout: 15000,
    headers: { 'User-Agent': randomUA() },
    httpAgent,
    httpsAgent,
    validateStatus: s => s === 200
  });

  await new Promise((resolve, reject) => {
    const w = fs.createWriteStream(dest);
    res.data.pipe(w);
    w.on('finish', resolve);
    w.on('error', reject);
  });

  // 强校验：防止“下到空文件 / HTML”
  if (!fs.existsSync(dest) || fs.statSync(dest).size === 0) {
    throw new Error(`download failed: ${url}`);
  }
}

module.exports = { downloadFile };
