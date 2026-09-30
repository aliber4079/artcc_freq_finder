// ZMA (Miami Center). LiveATC Miami page, 2026-09-30.
// 18 of 21 frequencies match vNAS/CRC by sector number.
//   renumbered: 135.600 "41 Junar Low" -> Low 42 (CRC: BIMINI LOW 42; the 42
//     shape contains Bimini and is 1 nm from the Miami receiver; 41 is 20 nm off)
//   26 Homestead: not in CRC, but PERTI Low/High 26 contains Miami and Homestead
//   audio-only: 17 APOLO (in CRC, no PERTI shape); 124.825 (LiveATC lists it
//     under 08, CRC has it as 89 FROSTY, which has no PERTI shape)
//   extra freqs not in CRC, kept as secondary feeds: 24 134.750, 25 133.275
// PERTI ZMA superhigh is broken for 00, 04, 06 (2-3 different shapes each) - dropped.
const LAYERS = {
  '02': ['Low', 'High', 'Superhigh'], '18': ['Low', 'High'], '08': ['Low', 'High'], '26': ['Low', 'High'],
  '60': ['Low', 'High'], '01': ['High'], '25': ['High'], '40': ['High'],
  '04': ['Low'], '07': ['Low'], '20': ['Low'], '21': ['Low'], '22': ['Low'], '23': ['Low'], '24': ['Low'],
  '42': ['Low'], '46': ['Low']
};
const s = (title, freq, mount, num, name) => LAYERS[num].map(t => [title, freq, mount, t, num, name]);

module.exports = {
  center: 'ZMA',
  displayName: 'Miami Center',
  dropSectors: ['ZMA-S00', 'ZMA-S04', 'ZMA-S06'],
  links: [
    ...s('Miami Center (Sector 02 HOBEE Low/High)', '119.825', 'kmlb1_zma02', '02', 'HOBEE'),
    ...s('Miami Center (Sector 04 Melbourne Low)', '132.250', 'kmlb1_zma04', '04', 'Melbourne'),
    ['Miami Center (Sector 17 APOLO Ultra High)', '128.650', 'kmlb1_zma17', 'Superhigh', null, 'APOLO'],
    ...s('Miami Center (Sector 18 ADOOR Low/High)', '134.350', 'kmlb1_zma18', '18', 'ADOOR'),
    ...s('Miami Center (Sector 22 BAIRN Low)', '133.475', 'kmlb1_zma22', '22', 'BAIRN'),
    ...s('Miami Center (Sector 23 STOOP Low)', '126.950', 'kmlb1_zma23', '23', 'STOOP'),
    ...s('Miami Center (Sector 07 Sarasota Low)', '132.350', 'ksrq2_zma_132350', '07', 'Sarasota'),
    ...s('Miami Center (Sector 07 Sarasota Low)', '132.350', 'ksrq1_zma', '07', 'Sarasota'),
    ...s('Miami Center (Sector 08 CIGAR Low/High)', '133.900', 'ksrq1_zma', '08', 'CIGAR'),
    ...s('Miami Center (Sector 25 Fort Myers High)', '128.225', 'ksrq1_zma', '25', 'Fort Myers High'),
    ...s('Miami Center (Sector 08 CIGAR Low/High)', '133.900', 'ksrq2_zma_133900', '08', 'CIGAR'),
    ...s('Miami Center (Sector 25 Fort Myers High)', '128.225', 'ksrq2_zma_128225', '25', 'Fort Myers High'),
    ...s('Miami Center (Sector 08 CIGAR Low/High)', '133.900', 'zma_fmy_133900', '08', 'CIGAR'),
    ...s('Miami Center (Sector 24 Fort Myers Low)', '134.750', 'zma24_fmy', '24', 'Fort Myers Low'),
    ...s('Miami Center (Sector 24 Fort Meyers Low)', '132.400', 'zma24_fmy', '24', 'Fort Myers Low'),
    ...s('Miami Center (Sector 24 Fort Meyers Low)', '132.400', 'zma_fmy_132400', '24', 'Fort Myers Low'),
    ...s('Miami Center (Sector 24 Fort Myers Low)', '134.750', 'zma_fmy_134750', '24', 'Fort Myers Low'),
    ...s('Miami Center (Sector 25 backup)', '133.275', 'zma25_fmy', '25', 'Fort Myers High'),
    ...s('Miami Center (Sector 25 Fort Meyers High)', '128.225', 'zma25_fmy', '25', 'Fort Myers High'),
    ...s('Miami Center (Sector 25 Fort Meyers High)', '128.225', 'zma_fmy_128225', '25', 'Fort Myers High'),
    ...s('Miami Center (Sector 25 backup)', '133.275', 'zma_fmy_133275', '25', 'Fort Myers High'),
    ...s('Miami Center (Sector 07 Sarasota Low)', '132.350', 'zma08_fmy', '07', 'Sarasota'),
    ...s('Miami Center (Sector 08 CIGAR Low/High)', '133.900', 'zma08_fmy', '08', 'CIGAR'),
    ['Miami Center (Sector 08 CIGAR Low/High)', '124.825', 'zma08_fmy', 'Low', null, '124.825'],
    ...s('Miami Center (Sector 01 PERMT High)', '125.325', 'kpbi1_zma01', '01', 'PERMT'),
    ...s('Miami Center (Sector 04 Melbourne Low)', '132.250', 'kvrb_zma04', '04', 'Melbourne'),
    ...s('Miami Center (Sector 20 Palm Beach Low)', '132.150', 'kpbi1_zma20', '20', 'Palm Beach'),
    ...s('Miami Center (Sector 21 Freeport Low)', '133.400', 'kpbi1_zma21', '21', 'Freeport'),
    ...s('Miami Center (Sector 23 STOOP Low)', '126.950', 'kvrb_zma23', '23', 'STOOP'),
    ...s('Miami Center (Sector 46 ALUTO Low)', '135.175', 'kpbi1_zma46', '46', 'ALUTO'),
    ...s('Miami Center (Sector 26 Homestead Low/High)', '124.750', 'zma26_kmia3', '26', 'Homestead'),
    ...s('Miami Center (Sector 40 Bimini High)', '126.325', 'zma40_kmia3', '40', 'Bimini High'),
    ...s('Miami Center (Sector 41 Junar Low)', '135.600', 'zma41_kmia3', '42', 'Bimini Low'),
    ...s('Miami Center (Sector 60 Georgetown High/Low)', '127.225', 'zma60_kmia3', '60', 'George Town')
  ],
  // Each sector's own row: a single-sector feed on the CRC-confirmed frequency
  preferred: {
    'ZMA-L04': 'kmlb1_zma04', 'ZMA-L23': 'kmlb1_zma23', 'ZMA-L07': 'ksrq2_zma_132350',
    'ZMA-L08': 'ksrq2_zma_133900', 'ZMA-H08': 'ksrq2_zma_133900',
    'ZMA-H25': 'ksrq2_zma_128225', 'ZMA-L24': 'zma_fmy_132400'
  },
  audioOnlyLabel: (title, num, name) => name === '124.825'
    ? 'Miami Center 124.825 (LiveATC lists it under Sector 08 CIGAR) - vNAS/CRC has it as sector 89 FROSTY, which has no map boundary'
    : `${title} - no map boundary (not in PERTI)`,
  icaoOverrides: {
    kpbi1_zma01: 'kdjt', kpbi1_zma20: 'kdjt', kpbi1_zma21: 'kdjt', kpbi1_zma46: 'kdjt',
    zma_fmy_133900: 'kfmy', zma24_fmy: 'kfmy', zma_fmy_132400: 'kfmy', zma_fmy_134750: 'kfmy',
    zma25_fmy: 'kfmy', zma_fmy_128225: 'kfmy', zma_fmy_133275: 'kfmy', zma08_fmy: 'kfmy',
    zma26_kmia3: 'kmia', zma40_kmia3: 'kmia', zma41_kmia3: 'kmia', zma60_kmia3: 'kmia'
  },
  feedNames: {
    kmlb1_zma02: 'Miami Center (Sector 02)', kmlb1_zma04: 'Miami Center (Sector 04)', kmlb1_zma17: 'Miami Center (Sector 17)',
    kmlb1_zma18: 'Miami Center (Sector 18)', kmlb1_zma22: 'Miami Center (Sector 22)', kmlb1_zma23: 'Miami Center (Sector 23)',
    ksrq2_zma_132350: 'ZMA Miami Center (07)', ksrq1_zma: 'ZMA Miami Center (07/08/25)', ksrq2_zma_133900: 'ZMA Miami Center (08)',
    ksrq2_zma_128225: 'ZMA Miami Center (25)', zma_fmy_133900: 'ZMA Miami Center (Sector 08)',
    zma24_fmy: 'ZMA Miami Center (Sector 24 Both)', zma_fmy_132400: 'ZMA Miami Center (Sector 24/132.4)',
    zma_fmy_134750: 'ZMA Miami Center (Sector 24/134.75)', zma25_fmy: 'ZMA Miami Center (Sector 25 Both)',
    zma_fmy_128225: 'ZMA Miami Center (Sector 25/128.225)', zma_fmy_133275: 'ZMA Miami Center (Sector 25/133.275)',
    zma08_fmy: 'ZMA Miami Center (Sector 7/8 Both)', kpbi1_zma01: 'ZMA Sector 01', kvrb_zma04: 'ZMA Sector 04',
    kpbi1_zma20: 'ZMA Sector 20', kpbi1_zma21: 'ZMA Sector 21', kvrb_zma23: 'ZMA Sector 23', kpbi1_zma46: 'ZMA Sector 46',
    zma26_kmia3: 'ZMA26 Miami Center (Homestead)', zma40_kmia3: 'ZMA40 Miami Center (Bimini)',
    zma41_kmia3: 'ZMA41 Miami Center (Junar)', zma60_kmia3: 'ZMA60 Miami Center (Georgetown)'
  },
  sectorNotes: {
    'ZMA-L42': 'LiveATC lists 135.600 as "Sector 41 Junar Low"; vNAS/CRC has it as sector 42 (Bimini Low), and this shape contains Bimini and is 1 nm from the Miami receiver (41 is 20 nm away).',
    'ZMA-L26': 'Not in vNAS/CRC; matched on LiveATC + PERTI, and the shape contains the Miami and Homestead receivers.'
  }
};
