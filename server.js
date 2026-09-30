// server.js
//
// Serves the map (public/conus.html) and its data, answers the frequency
// service (/api/v1/frequencies), and proxies flight lookups to
// Flightradar24, so the
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
const SectorLib = require('./lib/sectors');

// Files the browser may fetch: URL path -> [file on disk, content type].
// Explicit list, so nothing else in the project folder is ever served.
const STATIC_FILES = {
  '/': ['public/conus.html', 'text/html'],
  '/index.html': ['public/conus.html', 'text/html'],
  '/data/centers.json': ['data/centers.json', 'application/json'],
  '/data/liveatc.json': ['data/liveatc.json', 'application/json'],
  '/lib/sectors.js': ['lib/sectors.js', 'text/javascript'],
  // Swagger UI for the frequency service - try it at /docs
  '/docs': ['public/docs.html', 'text/html'],
  '/openapi.yaml': ['public/openapi.yaml', 'text/yaml']
};

// Sector data for the frequency service, loaded once at startup - restart
// the server after changing anything in data/.
const CENTERS = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'centers.json'), 'utf8'));
const LIVEATC = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'liveatc.json'), 'utf8'));
const SECTOR_INDEX = SectorLib.buildIndex(CENTERS);

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

// --- Frequency service ---
// GET /api/v1/frequencies?lat=35.08&lon=-106.65&alt=12000
// lat/lon in decimal degrees, alt in feet (as FR24 reports them).
// Returns the 2-3 most likely frequencies, best first - see lib/sectors.js
// rankFrequencies for how they're chosen. Meant to be called by other
// programs, so any website may call it (CORS open) and the response
// format is versioned: don't rename fields in v1.
function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(body, null, 2));
}

function handleFrequencies(req, res) {
  const q = url.parse(req.url, true).query;
  const num = name => (q[name] === undefined || q[name] === '' ? NaN : Number(q[name]));
  const lat = num('lat'), lon = num('lon'), alt = num('alt');

  const problems = [];
  if (!(lat >= -90 && lat <= 90)) problems.push('lat must be a number from -90 to 90');
  if (!(lon >= -180 && lon <= 180)) problems.push('lon must be a number from -180 to 180');
  if (!(alt >= 0 && alt <= 100000)) problems.push('alt must be a number of feet from 0 to 100000');
  if (problems.length) {
    sendJson(res, 400, { version: 1, error: problems.join('; '), example: '/api/v1/frequencies?lat=35.08&lon=-106.65&alt=12000' });
    return;
  }

  const results = SectorLib.rankFrequencies(SECTOR_INDEX, LIVEATC, lat, lon, alt);
  log(`frequencies lat=${lat} lon=${lon} alt=${alt} ->`, results.map(r => `${r.sector_code}:${r.reason}`).join(', ') || '(none)');
  sendJson(res, 200, { version: 1, query: { lat, lon, alt_ft: alt }, results });
}

function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      log(`Could not read ${filePath}:`, err.message);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Could not read ${path.relative(__dirname, filePath)}`);
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
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

  if (parsed.pathname === '/api/v1/frequencies') {
    try {
      handleFrequencies(req, res);
    } catch (e) {
      log('Unhandled error in /api/v1/frequencies:', e.message, e.stack);
      sendJson(res, 500, { version: 1, error: 'internal server error' });
    }
    return;
  }

  const file = STATIC_FILES[parsed.pathname];
  if (file) {
    serveFile(res, path.join(__dirname, file[0]), file[1]);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  log(`Listening on http://0.0.0.0:${PORT}`);
  log(`Loaded ${SECTOR_INDEX.length} sectors from ${Object.keys(CENTERS).length} centers`);
});
