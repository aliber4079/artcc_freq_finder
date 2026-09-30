// ZOA (Oakland Center). LiveATC Oakland page, 2026-09-30.
// All 10 frequencies match vNAS/CRC. Sectors 15 and 34 are stacked
// (same shape in each PERTI layer they're in). 35 (big offshore sector):
// Low/High identical, Superhigh somewhat smaller; LiveATC gives no layer
// and CRC has 35 as one position, so the feed goes on all three layers.
const LAYERS = {
  '35': ['Low', 'High', 'Superhigh'], '34': ['Low', 'High', 'Superhigh'], '15': ['High', 'Superhigh'],
  '10': ['Low'], '16': ['Low'], '40': ['Low'], '41': ['Low'], '42': ['Low'], '44': ['Low'], '45': ['Low']
};
const s = (title, freq, mount, num) => LAYERS[num].map(t => [title, freq, mount, t, num, null]);

module.exports = {
  center: 'ZOA',
  displayName: 'Oakland Center',
  links: [
    ...s('Oakland Center (Sector 42 Low)', '132.200', 'kcic1', '42'),
    ...s('Oakland Center (Zone 45, Lo)', '128.800', 'krno', '45'),
    ...s('Oakland Center (Sector 35)', '134.150', 'zoa_35', '35'),
    ...s('Oakland Center Sector 35', '134.150', 'zoa_sfo', '35'),
    ...s('Oakland Center Sector 40', '127.800', 'zoa_sfo', '40'),
    ...s('Oakland Center Sector 41', '125.850', 'zoa_sfo', '41'),
    ...s('Oakland Center (Sector 44 Low)', '127.950', 'ktrk_zoa44', '44'),
    ...s('Oakland Center (Sector 15 High)', '132.800', 'kfat3', '15'),
    ...s('Oakland Center (Sector 16 Low)', '123.800', 'kfat3', '16'),
    ...s('Oakland Center (Sector 34 High)', '134.375', 'kfat3', '34'),
    ...s('Oakland Center (Sector 10 Low)', '128.700', 'kprb1_zoa10', '10')
  ],
  preferred: { 'ZOA-L35': 'zoa_35', 'ZOA-H35': 'zoa_35', 'ZOA-S35': 'zoa_35' },
  icaoOverrides: { kcic1: 'kcic', krno: 'krno', zoa_35: 'ksfo', zoa_sfo: 'ksfo', kfat3: 'kfat' },
  feedNames: {
    kcic1: 'KCIC Tower/ZOA42', krno: 'KRNO Del/Gnd/Twr/App/ZOA', zoa_35: 'ZOA Oakland Center (35)',
    zoa_sfo: 'ZOA Oakland Center (35/40/41)', ktrk_zoa44: 'ZOA Oakland Center (44)',
    kfat3: 'ZOA Oakland Center (Fresno)', kprb1_zoa10: 'ZOA Sector 10'
  }
};
