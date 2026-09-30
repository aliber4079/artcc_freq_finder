// ZHU (Houston Center). LiveATC Houston page, 2026-09-30.
// All 6 frequencies match vNAS/CRC. Names from CRC where they differ
// (36: LiveATC "Beaumont", CRC "Liberty"; 76: "San Antonio" vs "Slimm").
module.exports = {
  center: 'ZHU',
  displayName: 'Houston Center',
  links: [
    ['Houston Center (Sector 36 Beaumont Low)', '124.700', 'kiah3_zhu_124700', 'Low', '36', 'Liberty'],
    ['Houston Center (Sector 46 Houston High)', '132.775', 'kiah3_zhu_132775', 'High', '46', 'Houston'],
    // LiveATC says High; PERTI has 76 only as Superhigh
    ['Houston Center (Sector 76 San Antonio High)', '125.625', 'ksat1_zhu_125625', 'Superhigh', '76', 'Slimm'],
    ['Houston Center (Sector 78 Austin High)', '126.425', 'zhu_aus2', 'High', '78', 'Austin'],
    ['Houston Center (Sector 80 Industry Low)', '132.150', 'zhu_aus3', 'Low', '80', 'Industry'],
    ['Houston Center (Sector 96 Bergstrom Low)', '125.650', 'zhu_aus1', 'Low', '96', 'Bergstrom']
  ],
  icaoOverrides: { zhu_aus1: 'kaus', zhu_aus2: 'kaus', zhu_aus3: 'kaus' },
  feedNames: {
    kiah3_zhu_124700: 'Houston Center (Sector 36)', kiah3_zhu_132775: 'Houston Center (Sector 46)',
    ksat1_zhu_125625: 'Houston Center (Sector 76 High)', zhu_aus2: 'ZHU Houston Center (Sector 78)',
    zhu_aus3: 'ZHU Houston Center (Sector 80)', zhu_aus1: 'ZHU Houston Center (Sector 96)'
  },
  sectorNotes: {
    'ZHU-S76': 'LiveATC calls sector 76 "San Antonio High"; PERTI has 76 only as Superhigh.'
  }
};
