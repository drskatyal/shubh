#!/usr/bin/env node
/**
 * Thin Divine Vedic Prakash forwarder. The app calls this URL; the key stays here.
 *
 *   DIVINE_API_KEY=… node server/divine-proxy.mjs
 *
 * Then set EXPO_PUBLIC_DIVINE_PROXY_URL=http://127.0.0.1:8787
 *
 * Official hosts differ per route (astroapi-1/2/3). This map is from
 * https://developers.divineapi.com/ — do not invent paths.
 */
import http from 'node:http';

const PORT = Number(process.env.DIVINE_PROXY_PORT ?? 8787);
const KEY = process.env.DIVINE_API_KEY?.trim();
const TOKEN = process.env.DIVINE_API_TOKEN?.trim() || KEY;

const HOST_BY_PATH = {
  '/indian-api/v2/find-panchang': 'https://astroapi-1.divineapi.com',
  '/indian-api/v1/auspicious-timings': 'https://astroapi-3.divineapi.com',
  '/indian-api/v1/inauspicious-timings': 'https://astroapi-3.divineapi.com',
  '/indian-api/v1/find-choghadiya': 'https://astroapi-2.divineapi.com',
  '/indian-api/v1/muhurat/hora': 'https://astroapi-3.divineapi.com',
  '/indian-api/v1/muhurat/marriage': 'https://astroapi-3.divineapi.com',
  '/indian-api/v1/muhurat/house-entering': 'https://astroapi-3.divineapi.com',
  '/indian-api/v1/muhurat/vehicle-purchase': 'https://astroapi-3.divineapi.com',
  '/indian-api/v1/muhurat/business-start': 'https://astroapi-3.divineapi.com',
  '/indian-api/v1/muhurat/property-purchase': 'https://astroapi-3.divineapi.com',
  '/indian-api/v1/english-calendar-festivals': 'https://astroapi-3.divineapi.com',
  '/indian-api/v1/date-specific-festivals': 'https://astroapi-3.divineapi.com',
  '/indian-api/v1/find-festival': 'https://astroapi-3.divineapi.com',
  '/indian-api/v3/basic-astro-details': 'https://astroapi-3.divineapi.com',
  '/indian-api/v2/planetary-positions': 'https://astroapi-3.divineapi.com',
  '/indian-api/v1/vimshottari-dasha': 'https://astroapi-3.divineapi.com',
  '/indian-api/v2/ashtakoot-milan': 'https://astroapi-3.divineapi.com',
  '/indian-api/v2/dashakoot-milan': 'https://astroapi-3.divineapi.com',
};

function hostFor(pathname) {
  if (HOST_BY_PATH[pathname]) return HOST_BY_PATH[pathname];
  if (/^\/indian-api\/v1\/horoscope-chart\/[^/]+$/.test(pathname)) {
    return 'https://astroapi-3.divineapi.com';
  }
  return null;
}

if (!KEY) {
  console.error('DIVINE_API_KEY is required on the proxy. It must not live in the app binary.');
  process.exit(1);
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url ?? '/', `http://127.0.0.1:${PORT}`);
  const host = hostFor(url.pathname);
  if (!host || req.method !== 'POST') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not_found', detail: 'Unknown Divine route' }));
    return;
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  let payload = {};
  if (chunks.length) {
    try {
      payload = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
    } catch {
      payload = {};
    }
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) payload = {};
  payload.api_key = KEY;

  const form = new URLSearchParams();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) continue;
    form.set(key, String(value));
  }

  try {
    const upstream = await fetch(`${host}${url.pathname}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
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
  console.log(`Divine proxy on http://127.0.0.1:${PORT}`);
});
