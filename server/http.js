const express = require('express');
const state = require('../core/state');

function startServer(port, subPath) {
  const app = express();

  app.get('/health', (_, res) => res.json(state));

  app.get(`/${subPath}`, (_, res) => {
    if (!state.ready) return res.status(503).send('Not ready');
    res.type('text/plain').send(state.sub);
  });

  app.get('/', async (req, res) => {
    try {
      // 尝试读取当前目录下的 index.html
      const html = await fs.promises.readFile(path.join(__dirname, 'index.html'), 'utf8');
      res.send(html);
    } catch (err) {
      // 如果读取失败（文件不存在等），返回基础状态
      res.send(`Service is running. Visit /${subPath}`);
    }
  });
  app.listen(port);
}

module.exports = { startServer };
