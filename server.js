// server.js — drop this next to index.html and run: node server.js
// Handles Unity WebGL requirements: correct MIME types, COOP/COEP headers,
// compressed Unity build files, and auto-combines split .partXX files.

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

const MIME = {
  '.html':      'text/html',
  '.js':        'application/javascript',
  '.css':       'text/css',
  '.wasm':      'application/wasm',
  '.data':      'application/octet-stream',
  '.json':      'application/json',
  '.png':       'image/png',
  '.jpg':       'image/jpeg',
  '.svg':       'image/svg+xml',
  '.ico':       'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

const COMPRESSED_FALLBACKS = [
  { suffix: '.gz', encoding: 'gzip' },
  { suffix: '.br', encoding: 'br'   },
];

// ── Auto-combine split part files ─────────────────────────────────────────────
// Finds any Build/*.partNN files, groups them by base name, sorts, and
// concatenates into the base file (e.g. GrannyBog.wasm.part01 + .part02 → GrannyBog.wasm).
// Runs once at startup; skips if the combined file already exists.
function combineParts() {
  const buildDir = path.join(ROOT, 'Build');
  if (!fs.existsSync(buildDir)) return;

  const files = fs.readdirSync(buildDir);
  const partPattern = /^(.+)\.part(\d+)$/i;

  // Group part files by their base name
  const groups = {};
  for (const f of files) {
    const m = f.match(partPattern);
    if (!m) continue;
    const base = m[1];
    if (!groups[base]) groups[base] = [];
    groups[base].push(f);
  }

  for (const [base, parts] of Object.entries(groups)) {
    const outPath = path.join(buildDir, base);

    if (fs.existsSync(outPath)) {
      console.log(`  [combine] ${base} already exists, skipping.`);
      continue;
    }

    // Sort parts numerically (part01, part02, ...)
    parts.sort((a, b) => {
      const na = parseInt(a.match(partPattern)[2], 10);
      const nb = parseInt(b.match(partPattern)[2], 10);
      return na - nb;
    });

    console.log(`  [combine] Assembling ${base} from ${parts.length} parts...`);
    const out = fs.openSync(outPath, 'w');
    for (const part of parts) {
      const chunk = fs.readFileSync(path.join(buildDir, part));
      fs.writeSync(out, chunk);
      console.log(`            + ${part} (${(chunk.length / 1024 / 1024).toFixed(1)} MB)`);
    }
    fs.closeSync(out);
    const total = fs.statSync(outPath).size;
    console.log(`  [combine] Done -> ${base} (${(total / 1024 / 1024).toFixed(1)} MB total)\n`);
  }
}

// ── Path helpers ──────────────────────────────────────────────────────────────
function resolvePath(urlPath) {
  const safe = path.normalize('/' + urlPath).replace(/^(\.\.[/\\])+/, '');
  return path.join(ROOT, safe);
}

function findFile(filePath) {
  if (fs.existsSync(filePath)) {
    return { file: filePath, encoding: null };
  }
  for (const { suffix, encoding } of COMPRESSED_FALLBACKS) {
    const compressed = filePath + suffix;
    if (fs.existsSync(compressed)) {
      return { file: compressed, encoding };
    }
  }
  return null;
}

// ── Startup ───────────────────────────────────────────────────────────────────
console.log('\n  Checking for split part files...');
combineParts();

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

  const target   = resolvePath(urlPath);
  const found    = findFile(target);
  const ext      = path.extname(urlPath).toLowerCase();
  const mimeType = MIME[ext] || 'application/octet-stream';

  // Required by Chrome/Chromebook for WebAssembly + SharedArrayBuffer
  res.setHeader('Cross-Origin-Opener-Policy',  'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

  console.log(`${req.method} ${req.url}`);

  if (!found) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end(`404 Not Found: ${urlPath}`);
    console.log(`  -> 404`);
    return;
  }

  const headers = { 'Content-Type': mimeType };
  if (found.encoding)                      headers['Content-Encoding'] = found.encoding;
  if (urlPath === '/index.html')           headers['Cache-Control'] = 'no-cache';
  else if (urlPath.startsWith('/Build/'))  headers['Cache-Control'] = 'public, max-age=86400';

  res.writeHead(200, headers);
  fs.createReadStream(found.file).pipe(res);
  const label = found.encoding ? ` (${found.encoding})` : '';
  console.log(`  -> 200${label}  ${path.basename(found.file)}`);
});

server.listen(PORT, '0.0.0.0', () => {
  const nets = require('os').networkInterfaces();
  let lan = '';
  for (const iface of Object.values(nets)) {
    for (const n of iface) {
      if (n.family === 'IPv4' && !n.internal) { lan = n.address; break; }
    }
    if (lan) break;
  }
  console.log('  Granny server running!\n');
  console.log(`  Local:    http://localhost:${PORT}`);
  if (lan) console.log(`  Network:  http://${lan}:${PORT}  <- use this on the Chromebook`);
  console.log('\n  Ctrl+C to stop\n');
});
