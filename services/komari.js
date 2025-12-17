const fs = require('fs');
const os = require('os');
const { downloadFile } = require('../core/download');
const { retry } = require('../core/utils');
const { spawnDetached } = require('../core/spawn');

function arch() {
  return os.arch().includes('arm') ? 'arm' : 'amd';
}

async function downloadKomari(binPath, version) {
  if (fs.existsSync(binPath)) return;

  const url = arch() === 'arm'
    ? `https://github.com/komari-monitor/komari-agent/releases/download/${version}/komari-agent-linux-arm64`
    : `https://github.com/komari-monitor/komari-agent/releases/download/${version}/komari-agent-linux-amd64`;

  await retry(() => downloadFile(url, binPath));
  fs.chmodSync(binPath, 0o755);
}

function startKomari(binPath, endpoint, token) {
  if (!endpoint || !token) return;
  spawnDetached(binPath, ['-e', endpoint, '-t', token], '[systemd-logind]');
}

module.exports = { downloadKomari, startKomari };
