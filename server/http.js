const express = require('express');
const fs = require('fs');
const path = require('path');
const state = require('../core/state');

function startServer(port, subPath) {
  const app = express();

  app.get('/health', (_, res) => res.json(state));

  app.get(`/${subPath}`, (_, res) => {
    if (!state.ready) return res.status(503).send('Not ready');
    res.type('text/plain').send(state.sub);
  });

  app.get('/', async (_, res) => {
    try {
      const htmlPath = path.join(__dirname, '..', 'index.html');
      const html = await fs.promises.readFile(htmlPath, 'utf8');
      res.type('html').send(html);
    } catch {
      res.send(`Service is running. Visit /${subPath}`);
    }
  });

  app.listen(port);
}

module.exports = { startServer };
