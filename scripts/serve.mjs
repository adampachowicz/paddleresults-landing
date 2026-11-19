import http from 'node:http';
import { mockSearch } from './search-mock.mjs';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
const root = resolve('dist');
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript', '.mjs':'text/javascript', '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp', '.woff2':'font/woff2', '.ttf':'font/ttf', '.xml':'application/xml', '.txt':'text/plain' };
http.createServer(async (req, res) => {
  try {
    const incoming = new URL(req.url, 'http://localhost');
    if (incoming.pathname === '/__search') {
      if (req.method !== 'GET') { res.writeHead(405).end(); return; }
      if (process.env.SEARCH_MOCK === 'true') {
        const result = mockSearch(incoming.searchParams.get('q') || '', incoming.searchParams.get('scope') || 'all', incoming.searchParams.get('discipline') || '');
        res.writeHead(result.status, {'Content-Type':'application/json', 'Cache-Control':'no-store'}).end(JSON.stringify(result.body));
        return;
      }
      if (!process.env.SEARCH_PROXY_TARGET) { res.writeHead(503).end(); return; }
      const target = new URL(process.env.SEARCH_PROXY_TARGET);
      if (!['127.0.0.1','localhost'].includes(target.hostname)) { res.writeHead(503).end(); return; }
      target.searchParams.set('q', incoming.searchParams.get('q') || '');
      target.searchParams.set('scope', incoming.searchParams.get('scope') || 'events');
      if (incoming.searchParams.has('discipline')) target.searchParams.set('discipline', incoming.searchParams.get('discipline'));
      const upstream = await fetch(target, { headers:{ Accept:'application/json', 'X-API-Key':req.headers['x-api-key'] || '' }, signal:AbortSignal.timeout(8000), redirect:'error' });
      res.writeHead(upstream.status, {'Content-Type':'application/json','Cache-Control':'no-store'}).end(await upstream.text());
      return;
    }
    let file = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    if ((await stat(file)).isDirectory()) file += '/index.html';
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store' }).end(body);
  } catch { res.writeHead(404, { 'Content-Type':'text/plain' }).end('Not found'); }
}).listen(Number(process.env.PORT || 4174), '127.0.0.1', () => console.log('Preview: http://localhost:4174'));
