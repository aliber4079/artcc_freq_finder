// ZMP (Minneapolis Center). LiveATC Minneapolis page, 2026-09-30.
// Messiest so far - checked every frequency against vNAS/CRC:
//   confirmed: 02, 03 (133.550), 05 (125.300), 06, 16, 25 (134.550)
//   renumbered by CRC freq + PERTI: "83 Tomahawk" -> S46, "04/14 White Cloud Low" -> H13
//   unresolvable -> audio-only: 134.750 (LiveATC 25, CRC 22, PERTI has no 22),
//     127.425 "22 Black River" (not in CRC, no PERTI 22), 125.025 (no number)
//   extra freqs not in CRC, attached to their sector as secondary feeds:
//     03 133.650, 05 128.600, 25 127.900
//   33 PIR: LiveATC 132.050 vs CRC 125.100 - kept LiveATC's, flagged
module.exports = {
  center: 'ZMP',
  displayName: 'Minneapolis Center',
  links: [
    // LiveATC says sector 25; CRC says 134.750 is 22 "FAR HI"; PERTI has no 22
    ['Minneapolis Center (Sector 25 Low/High)', '134.750', 'kbji', 'High', null, '134.750'],
    ['Minneapolis Center (Sector 33 PIR Low)', '132.050', 'kfsd1', 'Low', '33', 'PIR'],
    ['ZMP Minneapolis Center (Low)', '125.025', 'ksux2', 'Low', null, '125.025'],
    ['Minneapolis Center (Sector 02 Low)', '132.900', 'ktvc2_all', 'Low', '02', 'TVC'],
    // LiveATC: "Sector 83 Tomahawk Super Hi"; CRC: 125.825 = 46 "MCD SUPER HI";
    // PERTI has Superhigh 46 and no 83 in any layer
    ['Minneapolis Center (Sector 83 Tomahawk Super Hi)', '125.825', 'ktvc2_all', 'Superhigh', '46', 'MCD'],
    ['Minneapolis Center (Sector 03 Low)', '133.550', 'd25_133550', 'Low', '03', 'SAW'],
    ['Minneapolis Center (sector 03 Low)', '133.650', 'd25_133650', 'Low', '03', 'SAW'],
    ['Minneapolis Center (Sector 05 Low)', '128.600', 'klse2_zmp_128600', 'Low', '05', 'ODI'],
    // LiveATC: "Sector 04/14 White Cloud Low"; CRC: 133.175 = 13 "TKV HI"
    // (CRC's 04 and 14 are on other freqs); PERTI has High 13, which covers Green
    // Bay (the receiver) and Tomahawk WI (likely CRC's "TKV"). Named from CRC.
    ['Minneapolis Center (Sector 04/14 White Cloud Low)', '133.175', 'kgrb1_zmp', 'High', '13', 'TKV'],
    ['Minneapolis Center (Sector 05 Low)', '125.300', 'keau_zmp05_125300', 'Low', '05', 'ODI'],
    ['Minneapolis Center (Sector 06 TWINZ Low)', '134.300', 'keau_zmp06_134300', 'Low', '06', 'TWINZ'],
    ['Minneapolis Center (Sector 16 Eau Claire High)', '133.750', 'keau_zmp16_133750', 'High', '16', 'Eau Claire'],
    // Not in CRC; PERTI has no 22 in any layer
    ['Minneapolis Center (Sector 22 Black River Super High)', '127.425', 'keau_zmp22_127425', 'Superhigh', null, '127.425'],
    // 25 is "HI/LO" in CRC too - feed on both layers. 134.550 is the CRC one,
    // listed last so it becomes the sector's main frequency
    ['Minneapolis Center Sector 25 (Low/High)', '127.900', 'kdlh2', 'Low', '25', 'DLH'],
    ['Minneapolis Center Sector 25 (Low/High)', '127.900', 'kdlh2', 'High', '25', 'DLH'],
    ['Minneapolis Center Sector 25 (Low/High)', '134.550', 'kdlh2', 'Low', '25', 'DLH'],
    ['Minneapolis Center Sector 25 (Low/High)', '134.550', 'kdlh2', 'High', '25', 'DLH']
  ],
  preferred: { 'ZMP-L03': 'd25_133550', 'ZMP-L05': 'keau_zmp05_125300' },
  audioOnlyLabel: (title, num, name) => ({
    '134.750': 'Minneapolis Center 134.750 - LiveATC says Sector 25; vNAS/CRC says sector 22 (FAR High), which has no map boundary',
    '125.025': 'Minneapolis Center (Low) 125.025 - no sector number on LiveATC, not in vNAS/CRC',
    '127.425': 'Minneapolis Center (Sector 22 Black River Super High) 127.425 - no map boundary, not in vNAS/CRC'
  })[name] || title,
  icaoOverrides: { kbji: 'kbji', kfsd1: 'kfsd', ksux2: 'ksux', d25_133550: 'd25', d25_133650: 'd25', kdlh2: 'kdlh' },
  feedNames: {
    kbji: 'KBJI CTAF/ZMP', kfsd1: 'KFSD Twr/App/Dep/ZMP', ksux2: 'KSUX Twr/App/ZMP', ktvc2_all: 'KTVC Ground/Tower/Center',
    d25_133550: 'Minneapolis Center (Sector 03 Low) #1', d25_133650: 'Minneapolis Center (Sector 03 Low) #2',
    klse2_zmp_128600: 'Minneapolis Center (Sector 05 LSE Area)', kgrb1_zmp: 'ZMP Sector 04/14',
    keau_zmp05_125300: 'ZMP Sector 05 (125.3)', keau_zmp06_134300: 'ZMP Sector 06 (134.3)',
    keau_zmp16_133750: 'ZMP Sector 16 (133.75)', keau_zmp22_127425: 'ZMP Sector 22 (127.425)', kdlh2: 'ZMP Sector 25/DLH ANG'
  },
  sectorNotes: {
    'ZMP-S46': 'LiveATC lists this as "Sector 83 Tomahawk Super Hi"; vNAS/CRC has 125.825 as sector 46 (MCD Super High), and PERTI has no sector 83.',
    'ZMP-H13': 'LiveATC lists this as "Sector 04/14 White Cloud Low"; vNAS/CRC has 133.175 as sector 13 (TKV High). Number and layer both disagree with LiveATC; the shape does cover Green Bay (where the feed\'s receiver is). Least certain match.',
    'ZMP-L33': 'LiveATC lists 132.050 for this sector; vNAS/CRC has 125.100. Frequency not confirmed.'
  }
};
