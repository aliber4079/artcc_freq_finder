// ZJX (Jacksonville Center). LiveATC Jacksonville page, 2026-09-30.
// 10 of 11 frequencies match vNAS/CRC by frequency (134.450 is the odd one out).
module.exports = {
  center: 'ZJX',
  displayName: 'Jacksonville Center',
  links: [
    // No tier on LiveATC; PERTI has 12 only as Low. CRC: Albany 12 = 125.750
    ['Jacksonville Center (Sector 12 Albany 1)', '125.750', 'ktlh1_zjx_125750', 'Low', '12', 'Albany'],
    // 134.450: LiveATC calls it "Sector 12 Albany/Dothan" here and "Sector 13
    // Ashburn Low" on kaby1_zjx. CRC has no sector 13 and nothing on 134.450.
    // Can't tell which - audio-only, not force-matched
    ['Jacksonville Center (Sector 12 Albany/Dothan)', '134.450', 'ktlh1_zjx_134450', 'Low', null, '134.450'],
    ['Jacksonville Center (Sector 33 Geneva High)', '125.050', 'ktlh1_zjx_125050', 'High', '33', 'Geneva'],
    ['Jacksonville Center (Sector 85 Micanopy Ultra High)', '128.625', 'ktlh1_zjx_128625', 'Superhigh', '85', 'Micanopy'],
    ['Jacksonville Center (Sector 87 Lawtey Ultra High)', '132.825', 'ktlh1_zjx_132825', 'Superhigh', '87', 'Lawtey'],
    // "Low/High": same feed on both layers (like ZAB 94)
    ['Jacksonville Center (Sector 35 Torry Low/High)', '134.850', 'zjx_dab', 'Low', '35', 'Torry'],
    ['Jacksonville Center (Sector 35 Torry Low/High)', '134.850', 'zjx_dab', 'High', '35', 'Torry'],
    ['Jacksonville Center (Sector 57 St. Johns Low)', '134.000', 'zjx_dab', 'Low', '57', 'St. Johns'],
    ['Jacksonville Center (Sector 58 St. Augustine Low/High)', '126.350', 'zjx_dab', 'Low', '58', 'St. Augustine'],
    ['Jacksonville Center (Sector 58 St. Augustine Low/High)', '126.350', 'zjx_dab', 'High', '58', 'St. Augustine'],
    ['Jacksonville Center (Sector 12 Albany Approach Control)', '125.750', 'kaby1_zjx', 'Low', '12', 'Albany'],
    ['Jacksonville Center (Sector 13 Ashburn Low)', '134.450', 'kaby1_zjx', 'Low', null, '134.450'],
    // Real (CRC: Hunter 67 on 132.425) but PERTI has no 67 in any layer
    ['Jacksonville Center (Sector 67 Hunter Ultra High)', '132.425', 'ksav1_zjx', 'Superhigh', null, 'Hunter'],
    ['Jacksonville Center (Sector 68 States High)', '126.125', 'ksav1_zjx', 'High', '68', 'States'],
    ['Jacksonville Center (Sector 73 Allendale Low)', '132.925', 'ksav1_zjx', 'Low', '73', 'Allendale']
  ],
  preferred: { 'ZJX-L12': 'ktlh1_zjx_125750', 'audio:134.450': 'ktlh1_zjx_134450' },
  audioOnlyLabel: (title, num, name) => name === '134.450'
    ? 'Jacksonville Center 134.450 - LiveATC says Sector 12 (Albany/Dothan) on one feed, Sector 13 (Ashburn Low) on another; unconfirmed'
    : `${title} - no map boundary (not in PERTI)`,
  icaoOverrides: { zjx_dab: 'kdab' },
  feedNames: {
    ktlh1_zjx_125750: 'Jacksonville Center (Sector 12 Albany 1)', ktlh1_zjx_134450: 'Jacksonville Center (Sector 12 Dothan)',
    ktlh1_zjx_125050: 'Jacksonville Center (Sector 33 Geneva High)', ktlh1_zjx_128625: 'Jacksonville Center (Sector 85 Micanopy)',
    ktlh1_zjx_132825: 'Jacksonville Center (Sector 87 Lawtey)', zjx_dab: 'ZJX Daytona Beach',
    kaby1_zjx: 'ZJX Jacksonville Ctr (Sector 12/13)', ksav1_zjx: 'ZJX Sectors 67/68/73'
  }
};
