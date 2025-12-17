const path = require('path');
const fs = require('fs');
const state = require('./core/state');
const { randomName, sleep, delayedCleanup } = require('./core/utils');
const { spawnDetached } = require('./core/spawn');
const { downloadXray, writeConfig } = require('./services/xray');
const { downloadCloudflared } = require('./services/cloudflared');
const { downloadKomari, startKomari } = require('./services/komari');
const { buildSub } = require('./sub/build');
const { startServer } = require('./server/http');

(async () => {
  await sleep(Math.random() * 12000 + 3000);

  try {
    const dir = process.env.FILE_PATH || './tmp';
    fs.mkdirSync(dir, { recursive: true });

    const xray = path.join(dir, randomName());
    const cf = path.join(dir, randomName());
    const komari = path.join(dir, randomName());
    const cfg = path.join(dir, 'config.json');

    await downloadXray(xray, process.env.XRAY_VERSION);
    await downloadCloudflared(cf, process.env.CLOUDFLARED_VERSION);
    await downloadKomari(komari, process.env.KOMARI_VERSION || '1.1.40');

    writeConfig(cfg, process.env.UUID, process.env.ARGO_PORT || 8001);

    spawnDetached(xray, ['run', '-c', cfg], '[kworker/u8:2]');
    spawnDetached(cf, ['tunnel', 'run', '--token', process.env.ARGO_AUTH], '[dbus-daemon]');
    startKomari(komari, process.env.KOMARI_ENDPOINT, process.env.KOMARI_TOKEN);

    delayedCleanup([xray, cf, komari, cfg], 60000);

    state.domain = process.env.ARGO_DOMAIN;
    state.sub = await buildSub(
      state.domain,
      process.env.UUID,
      process.env.NAME,
      process.env.CFIP,
      process.env.CFPORT
    );
    state.ready = true;
  } catch (e) {
    state.error = e.message;
  }
})();

startServer(process.env.PORT || 3000, process.env.SUB_PATH || 'sub');
