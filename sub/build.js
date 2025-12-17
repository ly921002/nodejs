const axios = require('axios');

async function buildSub(domain, uuid, name, cfip, cfport) {
  let meta = 'Unknown';
  try {
    const r = await axios.get('https://speed.cloudflare.com/meta', { timeout: 5000 });
    meta = `${r.data.clientCountry}-${r.data.asOrganization.replace(/\s+/g, '_')}`;
  } catch {}

  const ps = name ? `${name}-${meta}` : meta;

  return Buffer.from(
    `vmess://${Buffer.from(JSON.stringify({
      v: '2',
      ps,
      add: cfip,
      port: cfport,
      id: uuid,
      aid: '0',
      net: 'ws',
      type: 'none',
      host: domain,
      path: '/vmess-argo',
      tls: 'tls'
    })).toString('base64')}`
  ).toString('base64');
}

module.exports = { buildSub };
