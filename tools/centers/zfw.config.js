// ZFW (Fort Worth Center). LiveATC Fort Worth page, 2026-09-30.
// Tangled numbering: vNAS/CRC agrees with LiveATC on only 96, 30, 42.
// Two LiveATC labels look swapped/misnumbered - fixed by CRC frequency,
// PERTI (the LiveATC number only exists as Superhigh; the CRC one is Low),
// and receiver location (receiver inside the corrected shape):
//   127.000 "20 Millsap Low"  -> Low 32 (CRC: POS-L 32; Mineral Wells inside)
//   135.250 "25 Scurry Low"   -> Low 29 (CRC: DON-L 29; Tyler inside)
// Not in CRC, audio-only: 120.350 "32 Possum Intermediate",
//   126.725 "29 DONIE Intermediate", 121.375 "39 Mineral Wells Ultra Hi" (no PERTI 39)
// 63 Abilene: CRC has no 63 (its ZFW list doesn't cover every Low sector);
//   PERTI Low 63 contains the Abilene receiver - matched on LiveATC + PERTI.
module.exports = {
  center: 'ZFW',
  displayName: 'Fort Worth Center',
  // PERTI has two different superhigh shapes both labeled 65, 100+ nm apart;
  // can't tell which is right, and no feed needs it - left out
  dropSectors: ['ZFW-S65'],
  links: [
    ['Forth Worth Center (Sector 20 Millsap Low)', '127.000', 'kmwl_zfw_127000', 'Low', '32', 'Possum'],
    ['Forth Worth Center (Sector 32 Possum Intermediate)', '120.350', 'kmwl_zfw_120350', 'High', null, '120.350'],
    ['Forth Worth Center (Sector 39 Mineral Wells Ultra Hi)', '121.375', 'kmwl_zfw_121375', 'Superhigh', null, '121.375'],
    ['Fort Worth Center (Sector 63 Abilene Low)', '127.450', 'kabi4_zfw_127450', 'Low', '63', 'Abilene'],
    ['Fort Worth Center (Sector 96 Waco Low)', '133.300', 'kact1_zfw_133300', 'Low', '96', 'Waco'],
    ['Fort Worth Center (Sector 29 DONIE Intermediate)', '126.725', 'ktyr2_ctr', 'High', null, '126.725'],
    ['Fort Worth Center Sector 25 Scurry Low', '135.250', 'ktyr2_ctr', 'Low', '29', 'Donie'],
    ['Fort Worth Center (Sector 30 Monroe Low)', '126.325', 'kmlu_zfw_126325', 'Low', '30', 'Monroe'],
    ['Ft. Worth Center (Sector 42 DECOD High)', '134.475', 'kprx1_zfw42', 'High', '42', 'Decod'],
    // 42 is stacked High/Superhigh (same shape)
    ['Ft. Worth Center (Sector 42 DECOD High)', '134.475', 'kprx1_zfw42', 'Superhigh', '42', 'Decod']
  ],
  audioOnlyLabel: (title, num, name) => ({
    '120.350': 'Fort Worth Center 120.350 (LiveATC: Sector 32 Possum Intermediate) - not in vNAS/CRC, which puts Possum 32 on 127.000',
    '126.725': 'Fort Worth Center 126.725 (LiveATC: Sector 29 DONIE Intermediate) - not in vNAS/CRC, which puts DONIE 29 on 135.250',
    '121.375': 'Fort Worth Center 121.375 (LiveATC: Sector 39 Mineral Wells Ultra Hi) - no sector 39 in vNAS/CRC or PERTI'
  })[name] || title,
  icaoOverrides: { ktyr2_ctr: 'ktyr' },
  feedNames: {
    kmwl_zfw_127000: 'Forth Worth Center (Sector 20)', kmwl_zfw_120350: 'Forth Worth Center (Sector 32)',
    kmwl_zfw_121375: 'Forth Worth Center (Sector 39)', kabi4_zfw_127450: 'ZFW 63 (Abilene Low)',
    kact1_zfw_133300: 'ZFW Fort Worth Center (Sector 96 Waco Low)', ktyr2_ctr: 'ZFW Sector 25',
    kmlu_zfw_126325: 'ZFW Sector 30 (Monroe Low)', kprx1_zfw42: 'ZFW Sector 42'
  },
  sectorNotes: {
    'ZFW-L32': 'LiveATC lists 127.000 as "Sector 20 Millsap Low"; vNAS/CRC has it as sector 32 (Possum Low), PERTI\'s only 20 is Superhigh, and this shape contains the Mineral Wells receiver.',
    'ZFW-L29': 'LiveATC lists 135.250 as "Sector 25 Scurry Low"; vNAS/CRC has it as sector 29 (DONIE Low), PERTI\'s only 25 is Superhigh, and this shape contains the Tyler receiver.',
    'ZFW-L63': 'Not in vNAS/CRC (its ZFW list has no 63); matched on LiveATC + PERTI, and the shape contains the Abilene receiver.'
  }
};
