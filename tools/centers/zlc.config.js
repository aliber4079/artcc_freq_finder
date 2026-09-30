// ZLC (Salt Lake Center). LiveATC Salt Lake page, 2026-09-30.
// All 7 numbered frequencies match vNAS/CRC; CRC also identifies the 3
// unnumbered Missoula/Kalispell ones (132.400 = 06, 127.075 = 12, 133.400 = 19).
//
// ZLC sectors are STACKED: in PERTI each number has the same shape in
// every layer it appears in (identical areas) - one sector, surface to
// top, which is what LiveATC's "Low/Hi/Ultra Hi" labels mean. So each
// feed is attached to every layer its sector has in PERTI.
const LAYERS = { '03': ['Low', 'High', 'Superhigh'], '04': ['Low', 'High', 'Superhigh'], '06': ['Low', 'High', 'Superhigh'],
  '07': ['Low', 'High'], '08': ['Low', 'High'], '15': ['Low', 'High', 'Superhigh'],
  '16': ['Low', 'High', 'Superhigh'], '19': ['Low', 'High'], '32': ['Low', 'High'] };
const stacked = (title, freq, mount, num, name) => LAYERS[num].map(t => [title, freq, mount, t, num, name]);

module.exports = {
  center: 'ZLC',
  displayName: 'Salt Lake Center',
  links: [
    // Missoula feed lists three unnumbered "Salt Lake Center" freqs - numbered by CRC.
    // 06 is ~32 nm south of Missoula; 19 contains Missoula and Kalispell.
    ...stacked('Salt Lake Center (Missoula) 132.400', '132.400', 'kmso', '06', null),
    ...stacked('Salt Lake City Center (Missoula) 133.400', '133.400', 'kmso', '19', null),
    // 127.075 = CRC sector 12, but PERTI has no 12 in any layer
    ['Salt Lake Center (Missoula) 127.075', '127.075', 'kmso', null, '12', null],
    ['Sale Lake Center (KGPI App/Dep)', '127.075', 'kgpi2_app', null, '12', null],
    ...stacked('Salt Lake Center (Sector 16 Low/High/Ultra High)', '133.250', 'kjac1_zlc', '16', null),
    ...stacked('Salt Lake Center (Sector 15 Low/Hi/Ultra Hi)', '127.750', 'kbil1_zlc15_127750', '15', null),
    ...stacked('Salt Lake Center (Sector 03 Low/Hi/Ultra Hi)', '119.950', 'kslc_zlc03_119950', '03', null),
    ...stacked('Salt Lake Center (Sector 04 Low/Hi/Ultra Hi)', '135.775', 'kslc_zlc04_135775', '04', null),
    // LiveATC says "Low" for 07 and 32, but the shapes are stacked (same area in Low and High)
    ...stacked('ZLC Salt Lake Center (Sector 07 Low)', '127.700', 'kslc_zlc07_127700', '07', null),
    ...stacked('Salt Lake Center (Sector 08 Low/High)', '128.350', '46u2_zlc', '08', null),
    ...stacked('Salt Lake Center (Sector 32 Low)', '133.900', 'kslc_zlc32_133900', '32', null)
  ],
  preferred: { 'audio:12': 'kgpi2_app' },
  audioOnlyLabel: () => 'Salt Lake Center 127.075 (sector 12 per vNAS/CRC; Kalispell approach) - no map boundary (not in PERTI)',
  icaoOverrides: { kmso: 'kmso', '46u2_zlc': '46u' },
  feedNames: {
    kmso: 'KMSO Gnd/Twr/App/ZLC/ZSE', kjac1_zlc: 'Salt Lake Center (JAC)', kgpi2_app: 'Salt Lake Center (KGPI App/Dep)',
    kbil1_zlc15_127750: 'ZLC Salt Lake Center (Sector 15)', kslc_zlc03_119950: 'ZLC Sector 03',
    kslc_zlc04_135775: 'ZLC Sector 04', kslc_zlc07_127700: 'ZLC Sector 07', '46u2_zlc': 'ZLC Sector 08 Low/High',
    kslc_zlc32_133900: 'ZLC Sector 32'
  },
  sectorNotes: {
    'ZLC-L06': 'No sector number on LiveATC (Missoula feed, "Salt Lake Center: 132.400"); vNAS/CRC has 132.400 as sector 6. Shape is ~32 nm from Missoula.',
    'ZLC-L19': 'No sector number on LiveATC (Missoula feed, "Salt Lake City Center: 133.400"); vNAS/CRC has 133.400 as sector 19. Shape contains Missoula.'
  }
};
