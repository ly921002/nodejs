const express = require('express');
const state = require('../core/state');

function startServer(port, subPath) {
  const app = express();

  app.get('/health', (_, res) => res.json(state));

  app.get(`/${subPath}`, (_, res) => {
    if (!state.ready) return res.status(503).send('Not ready');
    res.type('text/plain').send(state.sub);
  });

  app.get('/', (_, res) => res.send('Service running'));
  app.listen(port);
}

module.exports = { startServer };
