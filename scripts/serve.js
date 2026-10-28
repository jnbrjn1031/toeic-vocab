// 개발용 정적 서버. GitHub Pages와 같은 /toeic-vocab/ 하위 경로로 서빙한다.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const BASE = '/toeic-vocab/';
const PORT = Number(process.env.PORT) || 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function send(res, status, body = '', type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/' || url.pathname === '/toeic-vocab') {
    res.writeHead(302, { Location: BASE });
    return res.end();
  }
  if (!url.pathname.startsWith(BASE)) return send(res, 404, 'Not found');

  let rel;
  try {
    rel = decodeURIComponent(url.pathname.slice(BASE.length));
  } catch {
    return send(res, 400, 'Bad request');
  }
  let file = resolve(join(ROOT, rel));
  if (file !== ROOT && !file.startsWith(ROOT + sep)) return send(res, 403, 'Forbidden');

  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    send(res, 200, body, MIME[extname(file)] ?? 'application/octet-stream');
  } catch {
    send(res, 404, 'Not found');
  }
}).listen(PORT, () => console.log(`http://localhost:${PORT}${BASE}`));
