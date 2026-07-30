/* Veanturverse — Terraformable sectors for X4: Foundations.

   AUTHORITATIVE — verified on 2026-06-29 against the actual game files, extracted to
   D:\GameDev\Veanturverse\x4-extract\ (X4 9.0).

   The active terraform clusters are the ones signalled by the cue
   `Signal_Terraforming_Cues` in base08__md__terraforming.xml. That cue activates
   exactly 7 base clusters; the Boron / Kingdom End DLC (boron_ext03__md__terraforming.xml)
   adds an 8th (Ocean of Fantasy). Sector display names are from universe.json.

   The 8 terraform clusters and the sectors of each that exist on our map:
     cluster_02  Eighteen Billion    -> Eighteen Billion
     cluster_03  Memory of Profit    -> Memory of Profit IX, X
     cluster_06  Black Hole Sun      -> Black Hole Sun IV, V
     cluster_21  Scale Plate Green   -> Scale Plate Green I, VII
     cluster_26  Atiya's Misfortune  -> Atiya's Misfortune I, III
     cluster_48  Getsu Fune          -> Getsu Fune
     cluster_49  Frontier Edge       -> Frontier Edge
     cluster_604 Ocean of Fantasy    -> Ocean of Fantasy   (Boron DLC)

   Terraforming applies per cluster (it does not matter which sector of the cluster you
   work from), so every sector of each cluster is listed.

   NOT terraformable, deliberately excluded:
     - Tharka's Cascade (cluster_32): a Xenon-terraforming cue exists in the files, but
       its activation is COMMENTED OUT in Signal_Terraforming_Cues
       (<!--<signal_cue cue="Terraforming_Xenon_TharkasCascade"/>-->), so it is disabled
       in the current game. A player report flagged this and was correct. (It may have
       been active in an earlier patch or be enabled by a mod.)
     - Emperor's Pride (cluster_424): same kind of disabled Xenon-terraforming cue,
       added by the Split DLC, also never signalled.

   IMPORTANT: every name must match a sector name in universe.json EXACTLY, or the map
   silently drops it (map.js: sectors.findIndex(s => s.name === n)). After editing, open
   tools/validate.html to check names and per-cluster coverage.

   The "Terraforming" map filter auto-appears once this list is non-empty. */
window.X4_TERRAFORM_SECTORS = [
  'Eighteen Billion',
  'Memory of Profit IX',
  'Memory of Profit X',
  'Black Hole Sun IV',
  'Black Hole Sun V',
  'Scale Plate Green I',
  'Scale Plate Green VII',
  "Atiya's Misfortune I",
  "Atiya's Misfortune III",
  'Getsu Fune',
  'Frontier Edge',
  'Ocean of Fantasy',
];
