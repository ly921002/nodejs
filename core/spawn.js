const fs = require('fs');
const { spawn } = require('child_process');

function spawnDetached(cmd, args, fakeName) {
  const devNull = fs.openSync('/dev/null', 'w');
  const p = spawn(cmd, args, {
    detached: true,
    stdio: ['ignore', devNull, devNull],
    argv0: fakeName
  });
  p.unref();
  return p.pid;
}

module.exports = { spawnDetached };
