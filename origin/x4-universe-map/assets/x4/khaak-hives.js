/* Veanturverse, Kha'ak hive sectors for X4: Foundations.
   Base list extracted directly from the game's own MD scripts
   ($PotentialHiveStationSectors): the sectors where Kha'ak hive stations can
   spawn. Base game (md/khaak_activity.xml) defines 8 sectors; the Split
   Vendetta DLC (md/setup_dlc_split.xml) patches in a 9th, Open Market. The
   sector names below are the developers' own comments in those files. The
   game sets $HiveStationGateRange = 3, i.e. Kha'ak reach 3 gate jumps from a
   hive, so sectors MORE than 3 jumps away are safe. Verified against the
   installed X4 9.0 + all-DLC game files on 2026-07-17.

   Note: the Boron DLC (Kingdom End) can temporarily pull Heretic's End out of
   this list for 24h during a story beat, then puts it back, that's a
   transient story exception, not modeled here.

   Sanctuary of Darkness is added below on player reports (Reddit + Egosoft
   forum, several independent accounts of a hive there since 9.0), not from
   the extracted MD scripts, it doesn't appear in $PotentialHiveStationSectors
   in any base or DLC file checked. Flag for review if this turns out wrong.

   The "Kha'ak-safe" map filter auto-appears once this list is non-empty. */
window.X4_KHAAK_HIVES = [
  'Black Hole Sun V',    // cluster_06_sector002
  'Matrix #451',         // cluster_16_sector001
  'Company Regard',      // cluster_20_sector001
  'Antigone Memorial',   // cluster_28_sector001
  "Heretic's End",       // cluster_31_sector001
  'Lasting Vengeance',   // cluster_35_sector001
  'Pious Mists IV',      // cluster_37_sector001
  'Silent Witness XII',  // cluster_45_sector001
  'Open Market',         // cluster_419_sector001 (Split Vendetta DLC)
  'Sanctuary of Darkness', // cluster_605_sector001, player-reported, not in MD scripts
];
