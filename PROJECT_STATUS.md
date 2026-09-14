# ARTCC Freq Finder — Project Status

*Last updated: 2026-09-15*
*Repo: https://github.com/aliber4079/artcc_freq_finder*

## What's built and working

**`conus.html` + `server.js`** — a single-page web app with a center
dropdown, deployed and running. Currently covers **4 centers**:

| Center | Total sectors | Real audio links |
|---|---|---|
| ZKC (Kansas City) | 42 | 12 |
| ZME (Memphis) | 36 (incl. 1 inferred) | 10 |
| ZAU (Chicago) | 50 | 15 |
| ZNY (New York) | 62 | 26 |

Every sector shown on the map is real geometry (from vzkc.org for ZKC,
from the vATCSCC/PERTI national dataset for everyone else). Every audio
link shown is a real, confirmed LiveATC.net feed — nothing is guessed.

Core features: live flight lookup (FR24, proxied so the API key stays
server-side), automatic sector matching by position + altitude,
mismatch detection against whichever LiveATC link you're listening to,
an observation log (auto-logged, CSV export), live ETA-to-sector-exit
countdown, resizable panels, hover-to-highlight between the map and the
links list.

## What remains

1. **More centers** — same recipe each time (see CLAUDE.md for the
   exact steps): paste that center's real LiveATC feed page, extract
   and cross-validate against PERTI's geometry. ~18 US centers left.
2. **Altitude tier splits are unverified estimates for 3 of 4 centers**
   — only ZKC has real per-sector floor data. Worth listening-in to
   confirm/correct the Low/High/Superhigh thresholds for the others,
   the same way one ZME sector (34) was already corrected by ear.
3. **Outstanding replies still pending** from earlier outreach:
   `vatspy-data-project@vatsim.net`, the FlightRadar24 enhancement
   request, and a LiveATC.net admin contact.
4. **Repo setup** — code is ready, needs to actually go into
   the (currently empty) GitHub repo.

## Where things live right now

Everything is in this chat's file outputs — `conus.html`, `server.js`,
`CLAUDE.md`, this file, and the OpenRC service scripts. Next step is
getting these into the actual GitHub repo.
