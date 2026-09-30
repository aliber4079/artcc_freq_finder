// ZTL (Atlanta Center). LiveATC Atlanta page, 2026-09-30. All 13
// frequencies match vNAS/CRC. "Ultra Low" (18, 48) is Atlanta's own term
// (CRC uses it too); PERTI has both as Low. "Ultra High" -> Superhigh.
module.exports = {
  center: 'ZTL',
  displayName: 'Atlanta Center',
  links: [
    ['Atlanta Center (Sector 09 TIROE Low)', '120.450', 'kcsg1_ztl_120450', 'Low', '09', 'TIROE'],
    ['Atlanta Center (Sector 10 LaGrange High)', '125.575', 'kcsg1_ztl_125575', 'High', '10', 'LaGrange'],
    ['Atlanta Center (Sector 02 Gunter Ultra High)', '126.825', 'khsv_ztl_126825', 'Superhigh', '02', 'Gunter'],
    ['Atlanta Center (Sector 22 Macon High)', '119.375', 'katl_ztl22', 'High', '22', 'Macon'],
    // LiveATC: "Montgomery Lake"; CRC: "Martin Lake" (same sector, same freq)
    ['Atlanta Center (Sector 8 Montgomery Lake Ultra High)', '125.875', 'kmgm1_ztl08', 'Superhigh', '08', 'Martin Lake'],
    ['Altanta Center (Sector 09 TIROE Low)', '120.450', 'ztl09', 'Low', '09', 'TIROE'],
    ['Atlanta Center (Sector 11 Monroeville High)', '128.025', 'kmgm1_ztl11', 'High', '11', 'Monroeville'],
    ['Atlanta Center (Sector 13 Montgomery Low)', '120.550', 'kmgm1_ztl13', 'Low', '13', 'Montgomery'],
    ['Atlanta Center (Sector 18 Commerce Ultra Low)', '134.800', 'kgvl1_ztl18', 'Low', '18', 'Commerce'],
    ['Atlanta Center (Sector 32 Spartanburg High)', '125.625', 'kgmu_ztl32', 'High', '32', 'Spartanburg'],
    ['Atlanta Center (Sector 29 LEEON/Low)', '128.800', 'kgso1_ztl29', 'Low', '29', 'LEEON'],
    ['Atlanta Center (Sector 29 LEEON/Low)', '128.800', 'kgso1_ztl2933', 'Low', '29', 'LEEON'],
    ['Atlanta Center (Sector 33 Charlotte/High)', '124.425', 'kgso1_ztl2933', 'High', '33', 'Charlotte'],
    ['Atlanta Center (Sector 33 Charlotte/High)', '124.425', 'kgso1_ztl33', 'High', '33', 'Charlotte'],
    ['Atlanta Center Sector 44 SHINE (Low)', '132.625', 'kavl2_ztl44', 'Low', '44', 'Shine'],
    ['Atlanta Center (Sector 48 Wilkes Low)', '125.150', 'khky2_ztl48', 'Low', '48', 'Wilkes']
  ],
  preferred: { 'ZTL-L09': 'kcsg1_ztl_120450', 'ZTL-L29': 'kgso1_ztl29', 'ZTL-H33': 'kgso1_ztl33' },
  icaoOverrides: { ztl09: 'katl', kgvl1_ztl18: 'katl', kgmu_ztl32: 'kgsp' },
  feedNames: {
    kcsg1_ztl_120450: 'Atlanta Center (Sector 09 Low)', kcsg1_ztl_125575: 'Atlanta Center (Sector 10 High)',
    khsv_ztl_126825: 'ZTL Atlanta Center (HSV/Sector 02)', katl_ztl22: 'ZTL Atlanta Center (Macon High)',
    kmgm1_ztl08: 'ZTL Atlanta Center (Sector 08)', ztl09: 'ZTL Atlanta Center (Sector 09)',
    kmgm1_ztl11: 'ZTL Atlanta Center (Sector 11)', kmgm1_ztl13: 'ZTL Atlanta Center (Sector 13)',
    kgvl1_ztl18: 'ZTL Atlanta Center (Sector 18)', kgmu_ztl32: 'ZTL Atlanta Center (Sector 32)',
    kgso1_ztl29: 'ZTL Sector 29', kgso1_ztl2933: 'ZTL Sector 29/33', kgso1_ztl33: 'ZTL Sector 33',
    kavl2_ztl44: 'ZTL Sector 44 (Shine Low)', khky2_ztl48: 'ZTL48 Wilkes Sector'
  }
};
