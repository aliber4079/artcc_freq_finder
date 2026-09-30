# Project: artcc_freq_finder (formerly "artcc-finder")

**This project is now homed on GitHub**: https://github.com/aliber4079/artcc_freq_finder

## What this is, right now

A web app (`public/conus.html` + `server.js`, data in `data/centers.json`) that matches a live flight's
position/altitude to the specific ATC sector controlling it, then to
that sector's real LiveATC.net audio feed. Multi-center, with a
dropdown selector - not the old single-city CLI script.

**The old Python CLI tool (`artcc_lookup.py`) has been explicitly
retired.** Do not resurrect it or suggest extending it.

**Direction (decided 2026-09-29):** turn this into a web service - given
coordinates + altitude (or a callsign), return the 2-3 most likely
frequencies as JSON, for programs that react to FR24 alerts (maybe FR24
itself someday). The map stays, as a view of the same data. Plan, one
step at a time: (1) data out of the HTML into `data/centers.json` - done;
(2) service endpoint in `server.js` - done; (3) callsign input; (4) hosting.

**The service:** `GET /api/v1/frequencies?lat=35.08&lon=-106.65&alt=12000`
returns `{ version: 1, query, results: [...] }`, up to 3 results, best
first. Each result: `rank`, `reason` (`inside` / `altitude_split` with
`alt_diff_ft` / `near_border` with `distance_nm`), `center`, `sector`,
`sector_code`, `tier` (ZKC's "Ultra" reported as "Superhigh"), `name`,
`freq`, `liveatc` (`{mount, feed_name, url}` or null). Sectors with no
known frequency are still returned (`freq: null`) - don't hide the gap.
Outside all known sectors -> `results: []`. v1 is meant for other
programs: don't rename or remove fields; add a v2 instead. Ranking
margins (20 nm, 2,000 ft) are first guesses, not tuned against real
handoffs yet. The logic is in `lib/sectors.js`, shared with the map.

## Current centers, and how confident each piece of data is

| Center | Sectors (total) | Confirmed audio links | Geometry source |
|---|---|---|---|
| ZKC (Kansas City) | 42 | 12 | vzkc.org's own published GeoJSON |
| ZME (Memphis) | 35 (+1 inferred) | 10 | vATCSCC/PERTI |
| ZAU (Chicago) | 50 | 15 | vATCSCC/PERTI |
| ZNY (New York) | 62 | 26 | vATCSCC/PERTI |
| ZBW (Boston) | 47 | 28 | vATCSCC/PERTI |
| ZAB (Albuquerque) | 52 | 15 | vATCSCC/PERTI |
| ZLA (Los Angeles) | 16 (High only) | 25 | vATCSCC/PERTI |
| ZDC (Washington) | 56 | 30 | vATCSCC/PERTI |
| ZDV (Denver) | 35 (Low + High only) | 9 | vATCSCC/PERTI |
| ZTL (Atlanta) | 45 | 16 | vATCSCC/PERTI |

- **ZKC's data is the most solid**: sourced from vzkc.org's own real
  GeoJSON (traced back to CRC video maps + chart, the actual data real
  VATSIM controllers use), independently cross-validated against PERTI,
  and further validated by overlaying it on a real FAA IFR Enroute chart.
- **Every other center's geometry comes from `github.com/vATCSCC/PERTI`**
  (`assets/geojson/{low,high,superhigh}.json`) - a real, actively
  maintained repo with sector-level polygons for essentially all US
  ARTCCs. This was the single biggest breakthrough of the project:
  it solves the *geometry* problem nationwide, but has **no frequency
  data** - that still requires per-center manual work (see below).
- **Frequency/audio-link data** for every center besides ZKC comes from
  manually pasting that center's real LiveATC.net feed-listing page
  (`feedindex.php?type=us-artcc&center=X`) and parsing it. This is real
  work, one center at a time - there is no shortcut or bulk source for
  this part.

## Other data sources found (not yet used in the app)

- **vNAS / CRC public data** (the data VATSIM controllers' CRC program
  loads): `https://data-api.vnas.vatsim.net/api/artccs/<ARTCC>` (e.g. ZLA).
  No login needed. Checked for ZLA on 2026-09-26:
  - `facility.positions` = every sector with its frequency (ZLA: 37).
    Every ZLA frequency from LiveATC matched - a second, independent
    source for frequencies. Useful for cross-checking any center.
  - `videoMaps` = map layers as GeoJSON, downloadable at
    `https://data-api.vnas.vatsim.net/Files/VideoMaps/<ARTCC>/<id>.geojson`.
    The ERAM area maps (`ZLAA`...`ZLAF`) include Low sector border lines
    (filters 1/2 = "LOW WEST"/"LOW EAST" per `facility.eramConfiguration.geoMaps`).
    But they're ~2,700 loose line pieces mixed with other features and
    no sector-number labels - not ready-made polygons. Turning them into
    polygons would be real work and need visual checking.
  - VATSIM data copies real boundaries but is volunteer-made, not FAA data.
- **vZLA website** (laartcc.org): real, but no downloadable sector files -
  only procedure PDFs and picture diagrams.

## The per-center extraction recipe (repeat this for new centers)

**Tooling:** write `tools/centers/<artcc>.config.js` from the pasted
LiveATC table (see `zdv`/`ztl` configs for the format and comments), then
`node tools/add_center.js tools/centers/<artcc>.config.js`. It pulls PERTI
geometry (cached in `tools/.cache/`, gitignored), refuses duplicate PERTI
sector codes and unmatched (tier, number) pairs, writes both data files in
their one-entry-per-line layout, and warns about mounts with no icao.
Restart the server afterwards. (Centers before ZDV were added with
one-off scripts, so they have no config file.)

1. User pastes the raw HTML table from
   `https://www.liveatc.net/feedindex.php?type=us-artcc&center=<Name>`.
2. Parse each feed block: mount ID (from `myDirectStream('...')`),
   status (skip DOWN feeds), and every "Name: freq" line.
3. **Filter to real sectors only**: keep the current center's own name
   prefix, drop CTAF/FSS/Tower/Approach lines, drop frequencies >=200
   (UHF military duplicates of the same VHF frequency).
4. **Deduplicate carefully** - the same sector can appear on multiple
   mounts (different receivers), and a sector can have >1 real VHF
   frequency (not just a VHF/UHF pair). Key on (sector number, tier),
   not on the display name - two different mounts sometimes give the
   same real sector two different colloquial names.
5. Pull that center's real geometry from PERTI
   (`low.json`/`high.json`/`superhigh.json`, filtered by `artcc` field).
   **Key by (tier + sector number), not sector number alone** - PERTI
   reuses sector numbers across tiers (e.g. Low "01" and Superhigh "01"
   are different real sectors).
6. Cross-validate every extracted (number, tier) pair against PERTI's
   real set before trusting a match. Expect a few genuine misses - not
   every LiveATC-audible sector has a PERTI polygon (ZME had 2, ZAU had
   2, ZNY had 2, ZBW had 0, ZAB had 0, ZLA had 12 - all its Low sectors,
   ZDC had 2). Before calling something a miss, look the frequency up in
   the vNAS/CRC positions (see above) - for ZDC that resolved sectors
   LiveATC names without a number, and a wrong sector number. These become honest "audio, no polygon yet" entries
   in the `links` array, not silently dropped and not force-matched.
7. Watch for real data-entry quirks in LiveATC's own listing before
   assuming your extraction is wrong - confirmed examples so far:
   zero-padded numbers ("9" vs PERTI's "09"), a genuine typo (ZNY's
   Sparta Low mount said "Sector 34" but was really "36", confirmed via
   two independent sources), and tier misclassification (ZNY's Atlantic
   sector is really Superhigh, not High, despite LiveATC's own label).

## Data model (`data/centers.json`)

One sector / one link per line, so git diffs stay readable - keep that
layout when adding centers (edit or regenerate the file; don't put data
back into the HTML).

```js
CENTERS = {
  "ZKC": {
    displayName, lowHighSplitFt, highSuperhighSplitFt,
    sectors: { "<code>": { tier, sector_num, polygon, freq?, name?,
                            mount_id?, alt_floor_ft?, provisional?, note? } },
    links: [ { title, freq, mount_id, tier, sectorCode|null } ]
  },
  ...
}
```

- `sectors` = every real polygon, whether or not it has confirmed audio.
- `links` = every real LiveATC entry found, whether or not it has a
  matching polygon. `sectorCode: null` means real audio, no boundary yet.
- The app's own UI already surfaces this honestly (speaker icon
  filled/empty, "(no map boundary yet)" labels) - don't hide the gaps.

## Known limitations, stated plainly

- Altitude tier splits are **real, per-sector data for ZKC's Ultra tier
  only**. Every other center's High/Superhigh split is an **estimated**
  center-level threshold (23,500ft Low/High, ~33-35k High/Superhigh) -
  not independently sourced. If real per-sector floor data ever turns
  up for other centers, this should be corrected.
- Five ZBW sectors (09 Utica, 17 Nantucket, 18 Cape, 39 Cambridge,
  49 Southie) have real audio but are listed audio-only: LiveATC doesn't
  say their tier and PERTI has that number in more than one tier. The
  user deferred deciding which tier each is; don't force-match them.
- **ZLA has High sectors only.** PERTI has no ZLA Low or Superhigh
  polygons (every other US center has all three). The user chose to add
  ZLA with High only for now. Flights below ~23,500ft in LA airspace get
  no sector match, and all 12 ZLA Low sectors on LiveATC are audio-only
  entries (one per sector; alternate receivers for the same sector are
  kept in `links` but not listed). A better source (e.g. vZLA's own data)
  could fill this in later.
- ZLA sectors 28 and 30 are "Oceanic" on LiveATC; they're matched to
  PERTI's High 28 (offshore west of LA) and High 30 (LA-San Diego coast).
- **ZDV has no Superhigh sectors.** PERTI's ZDV superhigh layer is broken
  (exact duplicate shapes; numbers 00-06 that aren't Denver's real Ultra
  High sectors 18/30/46/65/67), so it was left out. Above ~33,000ft in
  Denver airspace the service answers with the High sector underneath -
  same situation as ZLA (no Superhigh either). PERTI superhigh also has
  duplicate numbers for ZFW (65) and ZMA (00, 04, 06) - check those
  before adding them. Most ZDV LiveATC feeds were DOWN on 2026-09-30;
  only the 9 UP ones were used - re-paste later to pick up more.
- ZTL: all 13 LiveATC frequencies match vNAS/CRC. "Ultra Low" (sectors
  18, 48) is Atlanta's own term, not a new layer - PERTI has them as Low.
  Sector 08 is "Montgomery Lake" on LiveATC, "Martin Lake" in CRC - used CRC's.
- ZDV sector 11: LiveATC says 134.500, vNAS/CRC says 120.475. Kept
  LiveATC's (it's what that feed says it monitors), flagged via `note`.
- ZDC: LiveATC's "Sector 54 Snow Hill High" is really sector 39 (CRC has
  Snow Hill = 39 on the same 121.375; PERTI has 39 only as Superhigh) -
  matched to ZDC-S39, flagged via `note`. The feed titled "SIE54" is 59
  Sea Isle (its own line and CRC agree). "SWANN" and "Bay" have no number
  on LiveATC; CRC says Swann = 17 (matched, Low) and Bay = 10 - but PERTI
  has 10 in High and Superhigh, so Bay is audio-only like ZBW's cases.
  "Guard Dog" (135.525) isn't in CRC at all - audio-only, no number.
- Two ZAB sectors (47 Silver City Low, 90 San Simon High) are only on
  LiveATC as UHF frequencies on the Tucson/Davis-Monthan feed - no VHF
  listed. They're kept (not dropped as UHF duplicates, since there's no
  VHF to duplicate) and their freq says "(UHF)". Expect to hear the
  controller and military pilots, likely not civilian pilots.
- ZAB sector 94 (CNX) is labeled "LH" on LiveATC and PERTI has it in both
  Low and High, so the same feed is attached to both polygons.
- One ZME sector (34, Superhigh) has a polygon that's not independently
  sourced - it's copied from ZME-H28 because the user confirmed by ear
  that they geographically match. Flagged via the `note` field.

## Development practices that have mattered

- **Always test full execution, not just syntax.** `node --check` alone
  missed a real bug (a `let` used before its declaration line, which
  silently killed the rest of the script). Mock `document`/`L`/etc. and
  actually `eval()` the extracted script before shipping.
- **Verify claims about external data by actually fetching/parsing it**,
  not by trusting a description of it (this caught: a completely broken
  Copilot-generated "sector" dataset that was really just whole-ARTCC
  boundaries relabeled; a sign error in the ETA geometry math; the tier-
  collision bug in PERTI extraction that silently dropped 4 sectors).
- The user has a disability that means information needs to come as
  direct answers to direct questions, not unprompted volume - one
  instruction/step at a time, confirm before big structural work.

## Files (see the GitHub repo for current layout)

- `public/conus.html` - the map app; loads `data/centers.json` at startup
  (so it needs `server.js` running - opening the file directly won't work)
- `data/centers.json` - every center's sectors, frequencies, feeds
- `data/liveatc.json` - LiveATC player-link fixes and LiveATC's own feed names
- `lib/sectors.js` - sector matching + frequency ranking, used by
  `server.js`. The map loads it only for building LiveATC links; for
  "which sector is this flight in" the map calls `/api/v1/frequencies`
  like any other program (decided 2026-09-29), so the map always shows
  exactly what the service answers.
- `server.js` - Node server: serves the map + data, the frequency service, proxies FR24 lookups;
  loads `data/` once at startup (restart after data changes);
  holds the FR24 API token server-side, logs to a file (not console)
- `PROJECT_STATUS.md` - point-in-time summary of what's done and what
  remains; may drift from this file over time, check both
