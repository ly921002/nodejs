const { exec } = require('child_process');
const fs = require('fs');

function execCmd(cmd, timeout = 20000) {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout }, (err, stdout, stderr) => {
      if (err) return reject(err);
      resolve({ stdout, stderr });
    });
  });
}

// 探测 IPv6 是否可用（快、稳定）
async function detectIPStack() {
  try {
    await execCmd('curl -6 -s --connect-timeout 3 https://ipv6.google.com >/dev/null');
    return 'v6';
  } catch {
    return 'v4';
  }
}

// 自动选择 -4 / -6 的下载
async function downloadAutoIP(url, outPath) {
  const ipStack = await detectIPStack();
  const ipFlag = ipStack === 'v6' ? '-6' : '-4';

  const cmd = [
    'curl',
    ipFlag,
    '-fL',
    '--connect-timeout 15',
    '--max-time 60',
    `"${url}"`,
    '-o',
    `"${outPath}"`
  ].join(' ');

  await execCmd(cmd);

  // 强校验：文件必须存在且非空
  if (!fs.existsSync(outPath) || fs.statSync(outPath).size === 0) {
    throw new Error(`download failed: ${outPath}`);
  }
}

module.exports = {
  downloadAutoIP
};
