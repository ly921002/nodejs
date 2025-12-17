const fs = require('fs');
const os = require('os');
const { downloadFile } = require('./core/download');
const { retry } = require('./core/utils');

function arch() {
  return os.arch().includes('arm') ? 'arm' : 'amd';
}

async function downloadCloudflared(binPath, version) {
  if (fs.existsSync(binPath)) return;

  const url = arch() === 'arm'
    ? `https://github.com/cloudflare/cloudflared/releases/download/${version}/cloudflared-linux-arm64`
    : `https://github.com/cloudflare/cloudflared/releases/download/${version}/cloudflared-linux-amd64`;

  await retry(() => downloadFile(url, binPath));
  fs.chmodSync(binPath, 0o755);
}

module.exports = { downloadCloudflared };
