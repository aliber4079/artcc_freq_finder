// lib/sectors.js
//
// Sector matching shared by the map (public/conus.html, loaded with a
// <script> tag - defines the global SectorLib) and the frequency service
// (server.js, via require). One copy of the logic, so the map's prediction
// and the service's top answer can't disagree.
//
// Works on the raw data from data/centers.json and data/liveatc.json.

(function (root) {
  // How far to look for "the flight may be about to be handed off" answers
  const NEAR_BORDER_NM = 20;   // neighboring sectors within this distance
  const ALT_MARGIN_FT = 2000;  // layer above/below within this many feet
  const ALT_STEP_FT = 500;

  // Flat list of every sector as { code, center, info }, in center order.
  // Build once per data load and pass to the functions below.
  function buildIndex(centers) {
    const index = [];
    for (const [centerCode, center] of Object.entries(centers)) {
      for (const [code, info] of Object.entries(center.sectors)) {
        index.push({ code, center: centerCode, info, split: center });
      }
    }
    return index;
  }

  // --- Point-in-polygon (ray casting). ring = [[lat, lon], ...] ---
  function pointInPolygon(lat, lon, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [yi, xi] = ring[i];
      const [yj, xj] = ring[j];
      const intersects = ((yi > lat) !== (yj > lat)) &&
        (lon < (xj - xi) * (lat - yi) / (yj - yi + 1e-15) + xi);
      if (intersects) inside = !inside;
    }
    return inside;
  }

  const isTopTier = tier => tier === 'Ultra' || tier === 'Superhigh';

  // Would a flight at altFt be worked by this sector, if it were inside it?
  // Low/High split and the top-tier floor come from the sector's own center
  // (estimates everywhere except ZKC's Ultra sectors, which have real floors).
  function tierFitsAltitude(entry, altFt) {
    const { info, split } = entry;
    if (isTopTier(info.tier)) {
      return altFt >= split.lowHighSplitFt && altFt >= (info.alt_floor_ft || split.highSuperhighSplitFt);
    }
    return info.tier === (altFt < split.lowHighSplitFt ? 'Low' : 'High');
  }

  // --- Sector matching: top tier first (it sits on top of High), then
  // Low/High. Returns the index entry, or null outside all known sectors. ---
  function findSector(index, lat, lon, altFt) {
    for (const e of index) {
      if (isTopTier(e.info.tier) && tierFitsAltitude(e, altFt) && pointInPolygon(lat, lon, e.info.polygon)) return e;
    }
    for (const e of index) {
      if (!isTopTier(e.info.tier) && tierFitsAltitude(e, altFt) && pointInPolygon(lat, lon, e.info.polygon)) return e;
    }
    return null;
  }

  // Shortest distance (nautical miles) from a point to a polygon's edge.
  // Flat-earth approximation around the point - fine at these distances.
  function distanceToEdgeNm(lat, lon, ring) {
    const kx = 60 * Math.cos(lat * Math.PI / 180); // nm per degree of longitude here
    const ky = 60;                                 // nm per degree of latitude
    let best = Infinity;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const ax = (ring[j][1] - lon) * kx, ay = (ring[j][0] - lat) * ky;
      const bx = (ring[i][1] - lon) * kx, by = (ring[i][0] - lat) * ky;
      const dx = bx - ax, dy = by - ay;
      const len2 = dx * dx + dy * dy;
      const t = len2 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len2)) : 0;
      const px = ax + t * dx, py = ay + t * dy;
      best = Math.min(best, Math.hypot(px, py));
    }
    return best;
  }

  function buildMountUrl(mountId, icaoOverrides) {
    let icao = icaoOverrides[mountId];
    if (!icao) {
      const m = mountId.match(/^([a-zA-Z]{3,4})\d*_/);
      icao = m ? m[1].toLowerCase() : '';
    }
    return `https://www.liveatc.net/hlisten.php?mount=${mountId}&icao=${icao}`;
  }

  // --- The 2-3 most likely frequencies for a position ---
  // 1. the sector the point is inside, at this altitude
  // 2. the sector just above/below, if a layer change is within ALT_MARGIN_FT
  // 3. neighboring sectors at this altitude within NEAR_BORDER_NM
  // Ranked by how close the alternative is (as a share of its margin).
  // Sectors with no known frequency are still listed (freq: null) - hiding
  // them would make a gap in our data look like a confident answer.
  function rankFrequencies(index, liveatc, lat, lon, altFt, limit = 3) {
    const candidates = [];
    const inside = findSector(index, lat, lon, altFt);
    if (inside) candidates.push({ entry: inside, score: -1, reason: 'inside' });

    for (const dir of [-1, 1]) {
      for (let d = ALT_STEP_FT; d <= ALT_MARGIN_FT; d += ALT_STEP_FT) {
        const alt = altFt + dir * d;
        if (alt < 0) break;
        const other = findSector(index, lat, lon, alt);
        if (other && other !== inside) {
          candidates.push({ entry: other, score: d / ALT_MARGIN_FT, reason: 'altitude_split', alt_diff_ft: dir * d });
          break;
        }
      }
    }

    for (const e of index) {
      if (e === inside || !tierFitsAltitude(e, altFt)) continue;
      // Contains the point but lost to a sector on top of it - that's an
      // altitude question (handled above), not a border one
      if (pointInPolygon(lat, lon, e.info.polygon)) continue;
      const nm = distanceToEdgeNm(lat, lon, e.info.polygon);
      if (nm <= NEAR_BORDER_NM) {
        candidates.push({ entry: e, score: nm / NEAR_BORDER_NM, reason: 'near_border', distance_nm: Math.round(nm * 10) / 10 });
      }
    }

    candidates.sort((a, b) => a.score - b.score);
    const seenSectors = new Set(), seenFreqs = new Set(), results = [];
    for (const c of candidates) {
      const { info } = c.entry;
      if (seenSectors.has(c.entry.code)) continue;
      // Same frequency twice (e.g. one sector drawn in two layers) - one answer is enough
      if (info.freq && seenFreqs.has(info.freq)) continue;
      seenSectors.add(c.entry.code);
      if (info.freq) seenFreqs.add(info.freq);
      results.push(formatResult(c, results.length + 1, liveatc));
      if (results.length >= limit) break;
    }
    return results;
  }

  function formatResult(c, rank, liveatc) {
    const { code, center, info } = c.entry;
    const r = { rank, reason: c.reason };
    if (c.distance_nm !== undefined) r.distance_nm = c.distance_nm;
    if (c.alt_diff_ft !== undefined) r.alt_diff_ft = c.alt_diff_ft;
    Object.assign(r, {
      center,
      sector: info.sector_num,
      sector_code: code,
      tier: info.tier === 'Ultra' ? 'Superhigh' : info.tier, // ZKC says "Ultra" for the same layer
      name: info.name || null,
      freq: info.freq || null,
      liveatc: info.mount_id ? {
        mount: info.mount_id,
        feed_name: liveatc.feed_names[info.mount_id] || null,
        url: buildMountUrl(info.mount_id, liveatc.icao_overrides)
      } : null
    });
    return r;
  }

  const SectorLib = { buildIndex, pointInPolygon, findSector, distanceToEdgeNm, buildMountUrl, rankFrequencies, NEAR_BORDER_NM, ALT_MARGIN_FT };
  if (typeof module !== 'undefined' && module.exports) module.exports = SectorLib;
  else root.SectorLib = SectorLib;
})(this);
