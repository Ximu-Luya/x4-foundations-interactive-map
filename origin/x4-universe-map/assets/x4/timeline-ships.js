/* Veanturverse Timeline-reward ships for X4: Foundations (Timelines DLC).
   These ships are unlocked as rewards from Timelines scenarios and appear in the
   live game ONLY AFTER the relevant Timeline mission is completed.

   Same single-source-of-truth pattern as derelicts.js. Fields per ship:
     slug   : unique id, kebab-case (used for deep-link ?tlship=<slug> + image name)
     tl     : Timeline reward number (TL1..TL9), shown as a small badge
     name   : ship name
     cls    : 'S' | 'M' | 'L'   (confirmed with the user)
     role   : ship role/type     (confirmed with the user)
     sector : EXACT sector name as in universe-data.js  (sourced: user screenshots)
     off    : in-sector map-pin offset [x, y] in universe units. +x = right, +y = down.
              Positions set from the user's hand-marked sector screenshots.
     req    : unlock condition    (sourced: Steam guide TL1..TL9)
     find   : where in the sector to look (sourced: user notes + screenshots + guide)
     claim  : how to claim it (all timeline ships: spacesuit claim)
     danger : true only where the guide flags a real hazard
     dangerNote : the hazard text
   Ship photo lives at assets/x4/<slug>-ship.jpg.

   One toggle (Derelict Ships) shows this overlay together with the derelicts. */
window.X4_TIMELINE_SHIPS = [
  {
    slug: 'xenon-b', tl: 'TL1', name: 'Xenon B', cls: 'M', role: 'Xenon Frigate',
    sector: 'Antigone Memorial', off: [-4600, -4900],
    req: 'Timelines reward, unlocked via "Attack On Antigone" (Terminus, Graph 2).',
    find: 'In the upper-left of the sector, around 267k out.',
    claim: 'Spacesuit claim.',
  },
  {
    slug: 'cutlass', tl: 'TL2', name: 'Cutlass', cls: 'S', role: 'Fighter',
    sector: "Heretic's End", off: [-2400, 2600],
    req: 'Timelines reward, unlocked via "Signal Strength" (Nodus, Graph 6).',
    find: 'Far south-west of the sector, slightly above the Y plane and outside the resource bubble. Around 404k to the Morningstar gate and 330k to the Watchful Gaze gate.',
    claim: 'Spacesuit claim.',
  },
  {
    slug: 'elite-sport', tl: 'TL3', name: 'Elite Sport', cls: 'S', role: 'Racer',
    sector: "CEO's Doubt", off: [1500, -5100],
    req: 'Timelines reward, unlocked via "Asteroid Dash" (Nodus, Graph 1).',
    find: 'In the upper-right area of the sector cluster.',
    claim: 'Spacesuit claim.',
  },
  {
    slug: 'xenon-f', tl: 'TL4', name: 'Xenon F', cls: 'M', role: 'Xenon Fighter',
    sector: "Nopileos' Fortune II", off: [-3000, 1400],
    req: 'Timelines reward, unlocked via "Impeded Extraction" (Nodus, Graph 1).',
    find: 'In the lower-left cluster, around 332k toward the Nopileos’ Fortune VI gate.',
    claim: 'Spacesuit claim.',
  },
  {
    slug: 'xenon-h', tl: 'TL5', name: 'Xenon H', cls: 'L', role: 'Xenon Destroyer',
    sector: "Tharka's Cascade XV", off: [-2200, 1200],
    req: 'Timelines reward, unlocked via "The Fade" (Terminus, Graph 1).',
    find: 'Left of centre, around 180k to the Hatikvah’s Choice gate and 258k to the Family Zhin gate.',
    claim: 'Spacesuit claim.',
    danger: true, dangerNote: 'In contested space with Xenon patrols nearby; difficulty depends on how attentive they are.',
  },
  {
    slug: 'kestrel-sport', tl: 'TL6', name: 'Kestrel Sport', cls: 'S', role: 'Racer',
    sector: "Freedom's Reach", off: [-5300, 400],
    req: 'Timelines reward, unlocked via "Station Circuit" (Nodus, Graph 3).',
    find: 'Left of centre, around 472k toward the Cardinal’s Redress gate. Watch for hidden Xenon asteroids nearby.',
    claim: 'Spacesuit claim.',
  },
  {
    slug: 'odachi', tl: 'TL7', name: 'Odachi', cls: 'M', role: 'Gunboat',
    sector: 'Getsu Fune', off: [1300, -8400], zoom: 3,
    req: 'Timelines reward, unlocked via "Flight of the Dragonfyre" (Terminus, Graph 6).',
    find: 'High up in the sector, clearly above the gates. Around 232k to the Savage Spur II gate, 272k to the Asteroid Belt gate and 382k to The Void gate. Random encounters can spawn nearby.',
    claim: 'Spacesuit claim.',
  },
  {
    slug: 'sapporo', tl: 'TL8', name: 'Sapporo', cls: 'L', role: 'Destroyer',
    sector: 'Mists of Artemis', off: [-2300, 5800],
    req: 'Timelines reward, unlocked via "Flight of the Dragonfyre" (Terminus, Graph 6).',
    find: 'In the lower half of the sector, below centre.',
    claim: 'Spacesuit claim.',
    danger: true, dangerNote: 'Sits near a Kha’ak hive, so clear the area or scout it remotely before approaching.',
  },
  {
    slug: 'theseus-sport', tl: 'TL9', name: 'Theseus Sport', cls: 'S', role: 'Racer',
    sector: "Moo-Kye's Revenge", off: [6200, 1500],
    req: 'Timelines reward, unlocked via "Spaceport Stride" (Nodus, Graph 2).',
    find: 'Eastern end of the sector, around 552k toward the Cardinal’s Domain gate. Watch for hidden Xenon asteroids.',
    claim: 'Spacesuit claim.',
  },
];
