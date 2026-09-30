# ARTCC Frequency Finder

**Which Center sector is that airplane in?** Give it a position and altitude,
and it tells you the 2–3 most likely air route traffic control center (ARTCC)
sectors, their frequencies, and a [LiveATC.net](https://www.liveatc.net) feed
to listen to when one is known.

**Try it: https://aliber4079.github.io/artcc_freq_finder/try/**
(runs entirely in your browser)

It started as a way to find the right LiveATC feed quickly when FR24 sends a
7700 (emergency) squawk alert.

## Coverage

All 20 continental US Centers: about 700 sectors, ~235 of them with a LiveATC
feed matched. Alaska and Honolulu aren't included.

## How it picks answers

1. **Inside** – the sector the position is in, at that altitude
2. **Altitude split** – the sector just above or below, if a layer change is
   within 2,000 ft
3. **Near border** – neighboring sectors within 20 nm

Best first, up to three. Sectors with no known frequency are still shown, so a
gap in the data never looks like a confident answer.

## This is a beta – please report mistakes

The data has known weak spots:

- **Sector boundaries come from VATSIM data**, not official FAA data. It's
  close, but volunteer-made.
- **Altitude splits** between low / high / ultra-high are estimates for most
  Centers.
- **LiveATC's own listings sometimes disagree** with other sources (wrong
  sector numbers, wrong layers). Each conflict was checked against vNAS/CRC
  and the feed's receiver location; the uncertain calls are flagged in the data.
- A few areas have **no shapes yet**, e.g. LA Center below ~23,500 ft.

If you listen to a Center and spot a wrong sector, frequency or feed, please
[open an issue](https://github.com/aliber4079/artcc_freq_finder/issues) or
reply in the
[LiveATC forum thread](https://forums.liveatc.net/artccfirtracon-maps/which-center-sector-is-that-airplane-in-position-in-liveatc-feed-out/).

## For developers

There's also a small web service and a map:

```bash
node server.js
```

- Map: `http://localhost:8080/`
- Test page: `http://localhost:8080/try/`
- API: `GET /api/v1/frequencies?lat=35.08&lon=-106.65&alt=12000` returns JSON
- API docs (Swagger, with "Try it out"): `http://localhost:8080/docs`

`server.js` expects an `FR24_API_TOKEN` environment variable (used for the
map's flight lookup). No `npm install` is needed – it uses only Node's
built-in modules.

| Path | What it is |
|---|---|
| `lib/sectors.js` | Sector matching and ranking (shared by everything) |
| `data/centers.json` | Sector shapes, frequencies and feeds for all 20 Centers |
| `data/liveatc.json` | LiveATC player-link fixes and feed names |
| `try/` | The static test page (what GitHub Pages serves) |
| `public/` | The map, and the API description (`openapi.yaml`) |
| `tools/add_center.js` | Adds a Center from a config in `tools/centers/` |

## Data sources and credits

- **Sector boundaries:** [vATCSCC/PERTI](https://github.com/vATCSCC/PERTI),
  MIT License, Copyright (c) 2025 Jeremy Peterson – full license in
  [`data/PERTI-LICENSE`](data/PERTI-LICENSE). Kansas City Center's
  boundaries come from [vZKC](https://vzkc.org).
- **Frequencies and feeds:** LiveATC.net feed listings.
- **Cross-checks:** vNAS/CRC facility data (the data VATSIM controllers use).

Not affiliated with LiveATC.net, the FAA, VATSIM or Flightradar24. Not for
real-world navigation or operational use.
