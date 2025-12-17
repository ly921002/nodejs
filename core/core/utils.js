const fs = require('fs');

function randomName(len = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length: len }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function retry(fn, times = 3, delay = 1000) {
  for (let i = 0; i < times; i++) {
    try { return await fn(); }
    catch (e) {
      if (i === times - 1) throw e;
      await sleep(delay);
    }
  }
}

function randomUA() {
  const uas = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Mozilla/5.0 (X11; Linux x86_64)',
    'curl/7.88.1',
    'Wget/1.21.4'
  ];
  return uas[Math.floor(Math.random() * uas.length)];
}

function delayedCleanup(files, delayMs = 60000) {
  setTimeout(() => {
    for (const f of files) {
      try { fs.unlinkSync(f); } catch {}
    }
  }, delayMs);
}

module.exports = {
  randomName,
  sleep,
  retry,
  randomUA,
  delayedCleanup
};
