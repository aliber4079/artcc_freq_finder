// ZDV (Denver Center). LiveATC Denver page, 2026-09-30 - most feeds DOWN;
// only UP feeds used. Frequencies checked against vNAS/CRC ZDV positions.
module.exports = {
  center: 'ZDV',
  displayName: 'Denver Center',
  // PERTI's ZDV superhigh layer is broken: exact duplicate shapes and
  // numbers (00-06) that don't match Denver's real Ultra High sectors
  // (18, 30, 46, 65, 67 per LiveATC). Left out.
  skipTiers: ['Superhigh'],
  links: [
    ['Denver Center (Sector 26 POWDR Low)', '119.850', 'kase2_app_ctr', 'Low', '26', 'POWDR'],
    ['Denver Center (Sector 21 Cheyenne Low)', '125.900', 'kcys', 'Low', '21', 'Cheyenne'],
    // CRC has sector 11 "Junction Low" on 120.475, not 134.500 - kept
    // LiveATC's frequency (it's what that feed says it monitors), flagged
    ['Denver Center (Sector 11 Grand Junction Low)', '134.500', 'kgjt', 'Low', '11', 'Grand Junction'],
    // CRC calls 06 "Kremmling Low", same frequency
    ['Denver Center (Sector 06 Denver West Departure Low)', '128.650', 'kden1_zdv_128650', 'Low', '06', 'Kremmling'],
    ['Denver Center (Sector 07 Thurman Low)', '133.950', 'kden1_zdv_133950', 'Low', '07', 'Thurman'],
    ['Denver Center (Sector 26 POWDR Low)', '119.850', 'kden1_zdv_119850', 'Low', '26', 'POWDR'],
    ['Denver Center (Sector 36 Farmington Low)', '118.575', 'kdro_zdv_118575', 'Low', '36', 'Farmington'],
    ['Denver Center (Sector 61 Falcon High)', '126.875', 'kden1_zdv_126875', 'High', '61', 'Falcon'],
    ['Denver Center (Sector 26 POWDR Low)', '119.850', 'kase2_zdv', 'Low', '26', 'POWDR']
  ],
  preferred: { 'ZDV-L26': 'kase2_zdv' },
  icaoOverrides: { kcys: 'kcys', kgjt: 'kgjt' },
  feedNames: {
    kase2_app_ctr: 'KASE Approach/Denver Center', kcys: 'KCYS Gnd/Twr/App/Center', kgjt: 'KGJT Gnd/Twr/App/ZDV',
    kden1_zdv_128650: 'ZDV Denver Center (DEN West Dep)', kden1_zdv_133950: 'ZDV Denver Center (Sector 07 Thurman Low)',
    kden1_zdv_119850: 'ZDV Denver Center (Sector 26 POWDR Low)', kdro_zdv_118575: 'ZDV Denver Center (Sector 36)',
    kden1_zdv_126875: 'ZDV Denver Center (Sector 61 High)', kase2_zdv: 'ZDV Sector 26 POWDR Low'
  },
  sectorNotes: {
    'ZDV-L11': 'LiveATC lists 134.500 for this sector; vNAS/CRC has 120.475. Frequency not confirmed.'
  }
};
