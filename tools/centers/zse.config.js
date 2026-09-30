// ZSE (Seattle Center). LiveATC Seattle page, 2026-09-30.
// All 16 numbered frequencies match vNAS/CRC (36's extra 121.400 isn't in
// CRC - kept as a secondary feed; 36's main freq is CRC's 127.550).
//
// ZSE High and Superhigh are stacked: PERTI has the same sector numbers
// with the same shapes in both layers, so a "High" feed is attached to
// the Superhigh copy too. "Low/Hi" sectors (02, 32) exist in all three.
const LAYERS = {
  '02': ['Low', 'High', 'Superhigh'], '32': ['Low', 'High', 'Superhigh'],
  '14': ['High', 'Superhigh'], '15': ['High', 'Superhigh'], '42': ['High', 'Superhigh'], '46': ['High', 'Superhigh'],
  '04': ['Low'], '05': ['Low'], '06': ['Low'], '08': ['Low'], '09': ['Low'], '30': ['Low'], '34': ['Low'], '35': ['Low'], '36': ['Low']
};
const s = (title, freq, mount, num) => LAYERS[num].map(t => [title, freq, mount, t, num, null]);

module.exports = {
  center: 'ZSE',
  displayName: 'Seattle Center',
  links: [
    // CRC has 128.450 as sector 07, but PERTI's 07 is ~160 nm from Missoula
    // (the receiver) and ~90 nm from the Mullan Pass radio site - fails the
    // location check, so not attached to the 07 shape
    ['Seattle Center (Mullan Pass RCAG)', '128.450', 'kmso', 'High', null, '07?'],
    ...s('Seattle Center (Sector 06 Low)', '125.800', 'keug3_zse_125800', '06'),
    ...s('Seattle Center (Sector 09 Low)', '132.600', 'kykm1_zse_132600', '09'),
    ...s('Seattle Center (Sector 14 High)', '134.900', 'zse_kmfr_134900', '14'),
    ...s('Seattle Center (Sector 14 High)', '134.900', 'zse_kmfr_14_15', '14'),
    ...s('Seattle Center (Sector 15 High)', '135.150', 'zse_kmfr_14_15', '15'),
    ...s('Seattle Center (Sector 15 High)', '135.150', 'zse_kmfr_135150', '15'),
    ...s('Seattle Center (Sector 30 Low)', '124.850', 'zse_kmfr_124850', '30'),
    ...s('Seattle Center (Sector 30 Low)', '124.850', 'zse_kmfr', '30'),
    ...s('Seattle Center (Sector 36 Low)', '121.400', 'zse_kmfr', '36'),
    ...s('Seattle Center (Sector 36 Low)', '127.550', 'zse_kmfr', '36'),
    ...s('Seattle Center (Sector 32 Low/Hi)', '126.600', 'ksea_zse_126600', '32'),
    ...s('Seattle Center (Sector 36 Low)', '127.550', 'zse_kmfr_127550', '36'),
    ...s('Seattle Center (Sector 46 High/Low)', '121.350', 'kuao1_zse_121350', '46'),
    ...s('Seattle Center (Sector 8)', '123.950', 'kcoe2_zse8', '08'),
    ...s('Seattle Center (Sector 36 Low)', '127.550', 'keug3_zse_132075_127550', '36'),
    // "Low/High" on LiveATC, but PERTI has 42 only in High/Superhigh
    ...s('Seattle Center (Sector 42 Low/High)', '132.075', 'keug3_zse_132075_127550', '42'),
    ...s('Seattle Center (Sector 02 Low/Hi)', '128.300', 'kpdx_zse', '02'),
    ...s('Seattle Center (Sector 04 Low)', '124.200', 'kpdx_zse', '04'),
    ...s('Seattle Center (Sector 05 Low)', '128.150', 'kpdx_zse', '05'),
    ...s('Seattle Center (Sector 06 Low)', '125.800', 'kpdx_zse', '06'),
    ...s('Seattle Center (Sector 32 Low/Hi)', '126.600', 'kpdx_zse', '32'),
    ...s('Seattle Center (Sector 34 Low)', '119.650', 'kpdx_zse', '34'),
    ...s('Seattle Center (Sector 05 Low)', '128.150', 'kbdn2_zse05', '05'),
    ...s('Seattle Center (Sector 35 Low)', '126.150', 'kbdn2_zse35', '35')
  ],
  // A feed for that one sector beats a multi-sector one
  preferred: {
    'ZSE-L06': 'keug3_zse_125800', 'ZSE-H14': 'zse_kmfr_134900', 'ZSE-S14': 'zse_kmfr_134900',
    'ZSE-H15': 'zse_kmfr_135150', 'ZSE-S15': 'zse_kmfr_135150', 'ZSE-L30': 'zse_kmfr_124850',
    'ZSE-L32': 'ksea_zse_126600', 'ZSE-H32': 'ksea_zse_126600', 'ZSE-S32': 'ksea_zse_126600',
    'ZSE-L36': 'zse_kmfr_127550', 'ZSE-L05': 'kbdn2_zse05'
  },
  audioOnlyLabel: () => 'Seattle Center (Mullan Pass RCAG) 128.450 - vNAS/CRC says sector 07, but that sector\'s map boundary is far from this receiver; not attached',
  icaoOverrides: {
    zse_kmfr_134900: 'kmfr', zse_kmfr_14_15: 'kmfr', zse_kmfr_135150: 'kmfr', zse_kmfr_124850: 'kmfr',
    zse_kmfr: 'kmfr', zse_kmfr_127550: 'kmfr', ksea_zse_126600: 'ksea'
  },
  feedNames: {
    keug3_zse_125800: 'Seattle Center (Sector 06 Low)', kykm1_zse_132600: 'Seattle Center (Sector 09 Low)',
    zse_kmfr_134900: 'Seattle Center (Sector 14)', zse_kmfr_14_15: 'Seattle Center (Sector 14/15)',
    zse_kmfr_135150: 'Seattle Center (Sector 15)', zse_kmfr_124850: 'Seattle Center (Sector 30)',
    zse_kmfr: 'Seattle Center (Sector 30/36)', ksea_zse_126600: 'Seattle Center (Sector 32 Low/Hi)',
    zse_kmfr_127550: 'Seattle Center (Sector 36)', kuao1_zse_121350: 'Seattle Center (Sector 46 Low/High)',
    kcoe2_zse8: 'Seattle Center (Sector 8)', keug3_zse_132075_127550: 'Seattle Center (Sectors 42/36)',
    kpdx_zse: 'ZSE Seattle Center (PDX Area)', kbdn2_zse05: 'ZSE Seattle Center (Sector 05)',
    kbdn2_zse35: 'ZSE Seattle Center (Sector 35)'
  }
};
