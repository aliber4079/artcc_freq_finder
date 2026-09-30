// ZID (Indianapolis Center). LiveATC Indianapolis page, 2026-09-30.
// 6 of 7 frequencies match vNAS/CRC. Sector 97 isn't in CRC, but CRC has
// no ZID Ultra High positions at all (none of PERTI's 90-series
// superhigh sectors) - a gap in CRC, not a contradiction; LiveATC's
// "97 Ultra-High" matches PERTI's Superhigh 97 exactly.
module.exports = {
  center: 'ZID',
  displayName: 'Indianapolis Center',
  links: [
    ['Indianapolis Center (Sector 33 Muncie Low)', '124.525', 'kind9_zid_124525', 'Low', '33', 'Muncie'],
    ['Indianapolis Center (Sector 34 Shelbyville Low)', '119.550', 'kind9_zid_119550', 'Low', '34', 'Shelbyville'],
    // "Int/Hi" (intermediate/high) - PERTI has 75 only as High
    ['Indianapolis Center (Sector 75 Rushville Int/Hi)', '125.125', 'kind9_zid_125125', 'High', '75', 'Rushville'],
    ['Indy Center Sector 30 Columbus Low', '124.450', 'kzzv1_zid30', 'Low', '30', 'Columbus'],
    ['Indy Center Sector 77 University High', '125.075', 'kzzv1_zid77', 'High', '77', 'University'],
    ['Indy Center Sector 87 Appleton High', '132.825', 'kzzv1_zid87', 'High', '87', 'Appleton'],
    ['Indy Center Sector 97 Lockbourne Ultra-High', '133.775', 'kzzv1_zid97', 'Superhigh', '97', 'Lockbourne'],
    ['Indy Center Sector 87 Appleton High', '132.825', 'kzzv1_zid_87_97', 'High', '87', 'Appleton'],
    ['Indy Center Sector 97 Lockbourne Ultra-High', '133.775', 'kzzv1_zid_87_97', 'Superhigh', '97', 'Lockbourne']
  ],
  preferred: { 'ZID-H87': 'kzzv1_zid87', 'ZID-S97': 'kzzv1_zid97' },
  feedNames: {
    kind9_zid_124525: 'Indy Center (Sector 33)', kind9_zid_119550: 'Indy Center (Sector 34)',
    kind9_zid_125125: 'Indy Center (Sector 75)', kzzv1_zid30: 'ZID Sector 30 Columbus Low',
    kzzv1_zid77: 'ZID Sector 77 University High', kzzv1_zid87: 'ZID Sector 87 Appleton High',
    kzzv1_zid97: 'ZID Sector 97 Lockbourne UH', kzzv1_zid_87_97: 'ZID Sectors 87/87'
  }
};
