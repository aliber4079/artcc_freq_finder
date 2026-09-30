// tools/add_center.js
//
// Adds one ARTCC to data/centers.json (sector shapes from PERTI + LiveATC
// feeds) and its LiveATC link fixes / feed names to data/liveatc.json.
//
// Usage:  node tools/add_center.js tools/centers/<artcc>.config.js
//
// The config (see tools/centers/ for examples) holds what was read off
// that center's LiveATC page. Before writing one, cross-check frequencies
// against vNAS/CRC: https://data-api.vnas.vatsim.net/api/artccs/<ARTCC>
// (facility.positions) - see CLAUDE.md for the full recipe.
//
// Config exports: { center, displayName, skipTiers?, dropSectors?, links,
//   preferred?, icaoOverrides?, feedNames?, sectorNotes?, audioOnlyLabel? }
// dropSectors: sector codes to leave out entirely - for PERTI entries
//   that are ambiguous (e.g. two different shapes under one code)
// links rows: [LiveATC title, freq, mount, tier|null, sector number|null, name]
//   tier or number null -> audio-only entry (no confirmed polygon)
// preferred: { '<sector code>' or 'audio:<num>': mount } - which feed a
//   sector's own row uses when several feeds carry it
//
// PERTI's geometry files are downloaded once into tools/.cache/ (not in git).
// Restart server.js afterwards - it loads data/ at startup.

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const CACHE = path.join(__dirname, '.cache');
const PERTI_URL = 'https://raw.githubusercontent.com/vATCSCC/PERTI/main/assets/geojson/';

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode} for ${url}`)); res.resume(); return; }
      const out = fs.createWriteStream(dest);
      res.pipe(out);
      out.on('finish', () => out.close(resolve));
    }).on('error', reject);
  });
}

async function loadPerti(file) {
  fs.mkdirSync(CACHE, { recursive: true });
  const dest = path.join(CACHE, file);
  if (!fs.existsSync(dest)) {
    console.log(`downloading PERTI ${file}...`);
    await download(PERTI_URL + file, dest);
  }
  return JSON.parse(fs.readFileSync(dest, 'utf8'));
}

// One sector / one link per line, so git diffs show what changed
function writeCenters(C) {
  const j = JSON.stringify;
  const out = ['{'];
  const centers = Object.entries(C);
  centers.forEach(([code, c], ci) => {
    out.push(`  ${j(code)}: {`);
    for (const [k, v] of Object.entries(c)) if (k !== 'sectors' && k !== 'links') out.push(`    ${j(k)}: ${j(v)},`);
    const ss = Object.entries(c.sectors);
    out.push('    "sectors": {');
    ss.forEach(([sc, s], i) => out.push(`      ${j(sc)}: ${j(s)}${i < ss.length - 1 ? ',' : ''}`));
    out.push('    },', '    "links": [');
    (c.links || []).forEach((l, i) => out.push(`      ${j(l)}${i < c.links.length - 1 ? ',' : ''}`));
    out.push('    ]', `  }${ci < centers.length - 1 ? ',' : ''}`);
  });
  out.push('}');
  const text = out.join('\n') + '\n';
  if (j(JSON.parse(text)) !== j(C)) throw new Error('reformat changed data');
  fs.writeFileSync(path.join(ROOT, 'data', 'centers.json'), text);
}

function writeLiveatc(LA) {
  const j = JSON.stringify;
  const obj = o => '{\n' + Object.entries(o).map(([k, v]) => `    ${j(k)}: ${j(v)}`).join(',\n') + '\n  }';
  const text = `{\n  "_notes": ${j(LA._notes, null, 2).replace(/\n/g, '\n  ')},\n  "icao_overrides": ${obj(LA.icao_overrides)},\n  "feed_names": ${obj(LA.feed_names)}\n}\n`;
  if (j(JSON.parse(text)) !== j(LA)) throw new Error('liveatc reformat mismatch');
  fs.writeFileSync(path.join(ROOT, 'data', 'liveatc.json'), text);
}

async function main() {
  if (!process.argv[2]) throw new Error('usage: node tools/add_center.js tools/centers/<artcc>.config.js');
  const cfg = require(path.resolve(process.argv[2]));
  const CENTER = cfg.center;

  const C = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'centers.json'), 'utf8'));
  if (C[CENTER]) throw new Error(CENTER + ' is already in data/centers.json');

  // PERTI reuses sector numbers across tiers, so codes are tier letter + number
  const TIER = { low: ['Low', 'L'], high: ['High', 'H'], superhigh: ['Superhigh', 'S'] };
  const sectors = {};
  for (const [file, [tier, letter]] of Object.entries(TIER)) {
    if ((cfg.skipTiers || []).includes(tier)) continue;
    (await loadPerti(file + '.json')).features.filter(f => f.properties.artcc === CENTER).forEach(f => {
      if (f.geometry.type !== 'Polygon') throw new Error('unexpected geometry ' + f.geometry.type);
      const code = `${CENTER}-${letter}${f.properties.sector}`;
      if ((cfg.dropSectors || []).includes(code)) return;
      if (sectors[code]) throw new Error(`duplicate ${code} in PERTI ${file} - bad data, check it (skipTiers?) before continuing`);
      sectors[code] = { tier, sector_num: f.properties.sector, polygon: f.geometry.coordinates[0].map(([lon, lat]) => [lat, lon]) };
    });
  }

  const preferred = cfg.preferred || {};
  const links = [];
  const seenAudioOnly = new Set();
  for (const [title, freq, mount_id, tier, num, name] of cfg.links) {
    const code = tier && num ? `${CENTER}-${TIER[tier.toLowerCase()][1]}${num}` : null;
    if (code) {
      const s = sectors[code];
      if (!s) throw new Error(`no PERTI polygon for ${code} - wrong tier/number, or make it audio-only`);
      if (!preferred[code] || preferred[code] === mount_id) Object.assign(s, { freq, name, mount_id });
      links.push({ title, freq, mount_id, tier, sectorCode: code });
    } else {
      const key = 'audio:' + (num || name);
      if (seenAudioOnly.has(key) || (preferred[key] && preferred[key] !== mount_id)) continue;
      seenAudioOnly.add(key);
      const label = cfg.audioOnlyLabel ? cfg.audioOnlyLabel(title, num, name) : title;
      links.push({ title: label, freq, mount_id, tier: tier || 'High', sectorCode: null });
    }
  }
  for (const code of Object.keys(sectors)) {
    const { tier, sector_num, polygon, freq, name, mount_id } = sectors[code];
    sectors[code] = { tier, sector_num, polygon, ...(freq && { freq, ...(name && { name }), mount_id }) };
  }
  for (const [code, note] of Object.entries(cfg.sectorNotes || {})) {
    if (!sectors[code]) throw new Error('note for missing sector ' + code);
    sectors[code].note = note;
  }

  C[CENTER] = { displayName: cfg.displayName, lowHighSplitFt: 23500, highSuperhighSplitFt: 33000, sectors, links };
  writeCenters(C);

  const LA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'liveatc.json'), 'utf8'));
  Object.assign(LA.icao_overrides, cfg.icaoOverrides || {});
  Object.assign(LA.feed_names, cfg.feedNames || {});
  writeLiveatc(LA);

  // Mounts whose icao can't be guessed from their name and have no override
  const guess = m => { const x = m.match(/^([a-zA-Z]{3,4})\d*_/); return x ? x[1].toLowerCase() : ''; };
  const unguessable = [...new Set(links.map(l => l.mount_id))].filter(m => !LA.icao_overrides[m] && !guess(m));
  if (unguessable.length) console.log('WARNING - no icao for:', unguessable.join(', '));

  const withAudio = Object.entries(sectors).filter(([, s]) => s.mount_id);
  console.log(`${CENTER}: ${Object.keys(sectors).length} sectors, ${withAudio.length} with audio, ${links.length} links`);
  console.log(withAudio.map(([c, s]) => `  ${c} ${s.name || ''} ${s.freq} ${s.mount_id}`).join('\n'));
  const ao = links.filter(l => !l.sectorCode);
  if (ao.length) console.log('audio-only:\n  ' + ao.map(l => `${l.title} ${l.mount_id}`).join('\n  '));
}

main().catch(e => { console.error(e.message); process.exit(1); });
