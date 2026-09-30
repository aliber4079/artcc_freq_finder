// ZOB (Cleveland Center). LiveATC Cleveland page, 2026-09-30.
// Checked against vNAS/CRC ZOB positions: 12 of 14 frequencies match by
// sector number; the other two are LiveATC numbering errors that CRC
// resolves by frequency (and PERTI confirms the corrected sectors exist).
module.exports = {
  center: 'ZOB',
  displayName: 'Cleveland Center',
  links: [
    // LiveATC says "Sector 51 Palmer High"; CRC: Palmer = 58 on 121.075;
    // PERTI has 58 only as Superhigh
    ['Cleveland Center (Sector 51 Palmer High)', '121.075', 'kpit2_zob', 'Superhigh', '58', 'Palmer'],
    ['Cleveland Center (Sector 57 Brecksville High)', '125.875', 'kpit2_zob', 'High', '57', 'Brecksville'],
    ['Cleveland Center (Sector 64 Keystone Ultra High)', '134.475', 'kpit2_zob', 'Superhigh', '64', 'Keystone'],
    ['Cleveland Center (Sector 12 Lansing Low)', '126.750', 'kfnt2_zob12', 'Low', '12', 'Lansing'],
    ['Cleveland Center (Sector 19 Gamble Super High)', '126.525', 'zob_alg1_gambshi', 'Superhigh', '19', 'Gamble'],
    ['Cleveland Center (Sector 20 Dresden Low)', '132.250', 'zob_alg1_dresdlo', 'Low', '20', 'Dresden'],
    ['Cleveland Center (Windsor Low Sector 21)', '132.450', 'kpcw1_zob_21', 'Low', '21', 'Windsor'],
    // LiveATC says High; PERTI has 26 only as Superhigh (like ZNY's Atlantic)
    ['Cleveland Center (Sector 26 Lake High)', '120.075', 'zob_alg1_lakehi', 'Superhigh', '26', 'Lake'],
    ['Cleveland Center (Sector 27 Hudson High)', '134.775', 'zob_alg1_hudhi', 'High', '27', 'Hudson'],
    // Real (CRC has Bluffton 47 on 119.325) but PERTI has no 47 in any layer
    ['Cleveland Center (Bluffton High Sector 47)', '119.325', 'kpcw1_zob_47', 'High', null, 'Bluffton'],
    ['Cleveland Center (Ravenna High Sector 48)', '119.875', 'kpcw1_zob_48', 'High', '48', 'Ravenna'],
    ['Cleveland Center Sector 53 Indian Head Low', '124.400', 'kjst_zob_124400', 'Low', '53', 'Indian Head'],
    // LiveATC says "Sector 61 Morgantown Low"; CRC: Morgantown = 55 on 126.950; PERTI has Low 55
    ['Cleveland Center (Sector 61 Morgantown Low)', '126.950', 'zob_ckb', 'Low', '55', 'Morgantown'],
    ['Cleveland Center (Sector 67 Imperial High)', '132.125', '2g9_zob', 'High', '67', 'Imperial']
  ],
  audioOnlyLabel: (title) => `${title} - no map boundary (not in PERTI)`,
  icaoOverrides: {
    zob_alg1_gambshi: 'kmtc', zob_alg1_dresdlo: 'kmtc', zob_alg1_lakehi: 'kmtc', zob_alg1_hudhi: 'kmtc',
    kpcw1_zob_21: 'kcle', kpcw1_zob_47: 'kcle', kpcw1_zob_48: 'kcle', zob_ckb: 'kckb', '2g9_zob': '2g9'
  },
  feedNames: {
    kpit2_zob: 'ZOB (Moon Twp RCAG)', kfnt2_zob12: 'ZOB Sector 12', zob_alg1_gambshi: 'ZOB Sector 19 Gamble Hi',
    zob_alg1_dresdlo: 'ZOB Sector 20 Dresden Low', kpcw1_zob_21: 'ZOB Sector 21 Windsor Low',
    zob_alg1_lakehi: 'ZOB Sector 26 Lake Hi', zob_alg1_hudhi: 'ZOB Sector 27 Hudson Hi',
    kpcw1_zob_47: 'ZOB Sector 47 Bluffton Hi', kpcw1_zob_48: 'ZOB Sector 48 Ravenna Hi',
    kjst_zob_124400: 'ZOB Sector 53', zob_ckb: 'ZOB Sector 61 Morgantown Low', '2g9_zob': 'ZOB Sector 67'
  },
  sectorNotes: {
    'ZOB-S58': 'LiveATC lists this as "Sector 51 Palmer High"; vNAS/CRC has Palmer = sector 58 on the same 121.075, and PERTI has 58 only as Superhigh.',
    'ZOB-L55': 'LiveATC lists this as "Sector 61 Morgantown Low"; vNAS/CRC has Morgantown = sector 55 on the same 126.950.',
    'ZOB-S26': 'LiveATC calls sector 26 Lake "High"; PERTI has 26 only as Superhigh.'
  }
};
