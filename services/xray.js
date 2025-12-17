const fs = require('fs');
const path = require('path');
const os = require('os');
const unzipper = require('unzipper');
const { downloadFile } = require('../core/download');
const { retry } = require('../core/utils');

function arch() {
  return os.arch().includes('arm') ? 'arm' : 'amd';
}

async function downloadXray(binPath, version) {
  if (fs.existsSync(binPath)) return;

  const url = arch() === 'arm'
    ? `https://github.com/XTLS/Xray-core/releases/download/v${version}/Xray-linux-arm64-v8a.zip`
    : `https://github.com/XTLS/Xray-core/releases/download/v${version}/Xray-linux-64.zip`;

  const zipPath = `${binPath}.zip`;
  await retry(() => downloadFile(url, zipPath));

  await new Promise((resolve, reject) => {
    fs.createReadStream(zipPath)
      .pipe(unzipper.Parse())
      .on('entry', e => {
        if (e.path === 'xray') e.pipe(fs.createWriteStream(binPath));
        else e.autodrain();
      })
      .on('close', resolve)
      .on('error', reject);
  });

  fs.chmodSync(binPath, 0o755);
  fs.unlinkSync(zipPath);
}

function writeConfig(configPath, uuid, port) {
  fs.writeFileSync(configPath, JSON.stringify({
    log: { loglevel: 'none' },
    inbounds: [
      {
        port,
        protocol: 'vless',
        settings: {
          clients: [{ id: uuid }],
          decryption: 'none',
          fallbacks: [{ path: '/vmess-argo', dest: 3003 }]
        }
      },
      {
        port: 3003,
        listen: '127.0.0.1',
        protocol: 'vmess',
        settings: { clients: [{ id: uuid, alterId: 0 }] },
        streamSettings: {
          network: 'ws',
          wsSettings: { path: '/vmess-argo' }
        }
      }
    ],
    outbounds: [{ protocol: 'freedom' }]
  }, null, 2));
}

module.exports = { downloadXray, writeConfig };
