// server.js
//
// Serves zkc_map.html and proxies flight lookups to Flightradar24, so the
// FR24_API_TOKEN never reaches the browser (unlike the earlier version of
// this tool, which put the token in a client-side input field - fine for
// personal local use, not safe for a public-facing page).
//
// Setup:
//   export FR24_API_TOKEN=your_token_here
//   node server.js
//
// Then visit http://<your-server>:8080/ (or whatever PORT you set).
//
// This uses only Node's built-in http/https modules - no npm install,
// no dependencies, matching the "no rigamarole" spirit of the rest of
// this project.

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;
const FR24_TOKEN = process.env.FR24_API_TOKEN;
const HTML_FILE = path.join(__dirname, 'conus.html');

// All logging goes to this file, not the console - so it's consistent
// whether the process is run manually in a terminal or as a background
// service (rather than depending on however OpenRC/the shell happens to
// redirect stdout). Override the path with LOG_FILE if you want it
// somewhere else (e.g. /var/log/conus-map.log).
const LOG_FILE = process.env.LOG_FILE || path.join(__dirname, 'server.log');

function log(...parts) {
  const message = parts.map(p => (typeof p === 'string' ? p : JSON.stringify(p))).join(' ');
  const line = `[${new Date().toISOString()}] ${message}\n`;
  try {
    fs.appendFileSync(LOG_FILE, line);
  } catch (err) {
    // Last-resort fallback if the log file itself can't be written to
    // (e.g. bad permissions) - still surface the error somewhere. Using
    // sync writes (not fs.appendFile's async version) specifically so a
    // log call immediately followed by process.exit() - like the missing-
    // token check below - can't get silently dropped before it's written.
    process.stderr.write(`Failed to write to log file ${LOG_FILE}: ${err.message}\n`);
  }
}

if (!FR24_TOKEN) {
  log('FR24_API_TOKEN is not set. Set it before starting the server: export FR24_API_TOKEN=your_token_here');
  process.exit(1);
}

// Same fast-path heuristic as artcc_lookup.py: guess ICAO (3-letter
// prefix, e.g. UAL455) vs IATA (2-letter prefix, e.g. UA455) style so we
// try the more likely filter first instead of eating a guaranteed-miss
// request every time.
function guessFilterOrder(callsign) {
  const m = callsign.match(/^([A-Z]+)\d/);
  const prefixLen = m ? m[1].length : 0;
  if (prefixLen === 2) return ['flights', 'callsigns'];
  return ['callsigns', 'flights'];
}

function fr24Request(paramName, callsign) {
  return new Promise((resolve, reject) => {
    const qs = new url.URLSearchParams({ [paramName]: callsign, limit: '15' });
    const options = {
      hostname: 'fr24api.flightradar24.com',
      path: `/api/live/flight-positions/light?${qs.toString()}`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Version': 'v1',
        'Authorization': `Bearer ${FR24_TOKEN}`,
        // Same fix as the Python script: FR24's bot-protection blocks the
        // default Node/urllib-style user agent outright.
        'User-Agent': 'zkc-map-proxy/1.0'
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function handleLookup(req, res) {
  const parsed = url.parse(req.url, true);
  const callsign = (parsed.query.callsign || '').trim().toUpperCase();

  if (!callsign) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'callsign query param is required' }));
    return;
  }

  const order = guessFilterOrder(callsign);

  for (const paramName of order) {
    try {
      const { statusCode, body } = await fr24Request(paramName, callsign);
      if (statusCode !== 200) {
        log(`FR24 returned HTTP ${statusCode} for ${paramName}=${callsign}: ${body.slice(0, 300)}`);
        continue; // try the other filter before giving up
      }
      const parsed = JSON.parse(body);
      log(`FR24 [${paramName}=${callsign}]:`, parsed);
      if (parsed && parsed.data && parsed.data.length > 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(parsed));
        return;
      }
    } catch (e) {
      log(`Request error for ${paramName}=${callsign}:`, e.message);
    }
  }

  log(`FR24: no match for ${callsign} on either filter`);

  // Neither filter found anything - respond with an empty data array,
  // same shape FR24 itself uses for "no match", so the browser's existing
  // handling (checks data.data.length) works unchanged.
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ data: [] }));
}

function serveHtml(req, res) {
  fs.readFile(HTML_FILE, 'utf8', (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Could not read zkc_map.html - check it exists one level up from proxy/server.js');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);

  if (parsed.pathname === '/api/lookup') {
    handleLookup(req, res).catch((e) => {
      log('Unhandled error in /api/lookup:', e.message, e.stack);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'internal server error' }));
    });
    return;
  }

  if (parsed.pathname === '/' || parsed.pathname === '/index.html') {
    serveHtml(req, res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  log(`Listening on http://0.0.0.0:${PORT}`);
  log(`Serving: ${HTML_FILE}`);
});
