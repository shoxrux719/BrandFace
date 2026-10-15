const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const publicRoot = path.resolve(__dirname, 'dist');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };
const port = Number(process.env.PORT || 4173);
const server = http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400); response.end('Bad request'); return; }
  const file = path.resolve(publicRoot, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (!file.startsWith(publicRoot + path.sep)) { response.writeHead(403); response.end('Forbidden'); return; }
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) { response.writeHead(404); response.end('Not found'); return; }
    response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    fs.createReadStream(file).pipe(response);
  });
});
server.listen(port, '127.0.0.1', () => console.log(`Jennifer Williams portfolio: http://localhost:${port}`));
