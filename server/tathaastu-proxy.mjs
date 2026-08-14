#!/usr/bin/env node
/**
 * Thin TathaAstu forwarder. The app calls this URL; the key stays on the server.
 *
 *   TATHAASTU_API_KEY=… node server/tathaastu-proxy.mjs
 *
 * Then set EXPO_PUBLIC_TATHAASTU_PROXY_URL=http://127.0.0.1:8787
 */
import http from 'node:http';

const PORT = Number(process.env.TATHAASTU_PROXY_PORT ?? 8787);
const UPSTREAM = 'https://api.tathaastuapi.com';
const KEY = process.env.TATHAASTU_API_KEY?.trim();

if (!KEY) {
  console.error('TATHAASTU_API_KEY is required on the proxy. It must not live in the app binary.');
  process.exit(1);
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const path = req.url ?? '/';
  if (!path.startsWith('/v1/')) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not_found', detail: 'This proxy only forwards /v1/*' }));
    return;
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);

  const headers = {
    Accept: 'application/json',
    'X-API-Key': KEY,
  };
  if (body.length) headers['Content-Type'] = req.headers['content-type'] ?? 'application/json';

  try {
    const upstream = await fetch(`${UPSTREAM}${path}`, {
      method: req.method,
      headers,
      body: body.length ? body : undefined,
    });
    const text = await upstream.text();
    res.writeHead(upstream.status, { 'Content-Type': 'application/json' });
    res.end(text);
  } catch (err) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'bad_gateway', detail: String(err) }));
  }
});

server.listen(PORT, () => {
  console.log(`TathaAstu proxy on http://127.0.0.1:${PORT} → ${UPSTREAM}`);
});
