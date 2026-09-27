# Project: artcc_freq_finder (formerly "artcc-finder")

**This project is now homed on GitHub**: https://github.com/aliber4079/artcc_freq_finder

## What this is, right now

A web app (`conus.html` + `server.js`) that matches a live flight's
position/altitude to the specific ATC sector controlling it, then to
that sector's real LiveATC.net audio feed. Multi-center, with a
dropdown selector - not the old single-city CLI script.

**The old Python CLI tool (`artcc_lookup.py`) has been explicitly
retired.** Do not resurrect it or suggest extending it. All active work
happens in `conus.html`.

## Current centers, and how confident each piece of data is

| Center | Sectors (total) | Confirmed audio links | Geometry source |
|---|---|---|---|
| ZKC (Kansas City) | 42 | 12 | vzkc.org's own published GeoJSON |
| ZME (Memphis) | 35 (+1 inferred) | 10 | vATCSCC/PERTI |
| ZAU (Chicago) | 50 | 15 | vATCSCC/PERTI |
| ZNY (New York) | 62 | 26 | vATCSCC/PERTI |
| ZBW (Boston) | 47 | 28 | vATCSCC/PERTI |
| ZAB (Albuquerque) | 52 | 15 | vATCSCC/PERTI |

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

## The per-center extraction recipe (repeat this for new centers)

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
   2, ZNY had 2, ZBW had 0, ZAB had 0). These become honest "audio, no polygon yet" entries
   in the `links` array, not silently dropped and not force-matched.
7. Watch for real data-entry quirks in LiveATC's own listing before
   assuming your extraction is wrong - confirmed examples so far:
   zero-padded numbers ("9" vs PERTI's "09"), a genuine typo (ZNY's
   Sparta Low mount said "Sector 34" but was really "36", confirmed via
   two independent sources), and tier misclassification (ZNY's Atlantic
   sector is really Superhigh, not High, despite LiveATC's own label).

## Data model (as embedded in conus.html)

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

- `conus.html` - the app (single file, all data embedded inline as JS)
- `server.js` - Node proxy; holds the FR24 API token server-side, logs
  to a file (not console) by default
- `PROJECT_STATUS.md` - point-in-time summary of what's done and what
  remains; may drift from this file over time, check both
