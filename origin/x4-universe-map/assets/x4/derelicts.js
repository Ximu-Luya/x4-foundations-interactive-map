/* Veanturverse, Derelict / free-ship locations for X4: Foundations.
   Single source of truth shared by the universe map. Keep `sector` exactly
   matching a sector name in universe-data.js. In-game positions are fixed
   (they do not move between patches).
   Images live at assets/x4/<slug>-ship.jpg and <slug>-location.jpg.
   `off`: in-sector map-pin offset [x, y] in universe units (same scale as the
   edge gate offsets), eyeballed from the in-game sector screenshots so the pin
   shows the rough direction to the wreck. +x = right, +y = down (so up / +z is
   negative y). Direction is read from the screenshots; distance is approximate.
   Guide anchor: x4-derelict-ships.html#ship-<slug> */
window.X4_DERELICTS = [
  {
    slug: 'elite-vanguard', name: 'Elite Vanguard', cls: 'S', role: 'Interceptor',
    sector: 'Grand Exchange I', coords: 'x −332k · z 380k · y 24k', off: [-2700, -3600],
    find: '422k from the Grand Exchange IV accelerator, 362k from the Grand Exchange III accelerator. Sits 24k above the ecliptic, in the asteroid field.',
    claim: 'Spacesuit claim, small hull.', danger: false,
  },
  {
    slug: 'perseus-vanguard', name: 'Perseus Vanguard', cls: 'S', role: 'Fighter',
    sector: 'Silent Witness XII', coords: 'x 56k · z 95k · y 0k', off: [-600, -3800],
    find: '234k from the Silent Witness XI accelerator, 183k from the SCA Pirate Base. On the ecliptic.',
    claim: 'Spacesuit claim, small hull.', danger: false,
  },
  {
    slug: 'courier-vanguard', name: 'Courier Vanguard', cls: 'S', role: 'Courier',
    sector: "Nopileos' Fortune II", coords: 'x 977k · z 1,175k · y 3k', off: [2600, -2300],
    find: '300k from the highway exit, in the same direction.',
    claim: 'Spacesuit claim, small hull.', danger: false,
  },
  {
    slug: 'osprey-vanguard', name: 'Osprey Vanguard', cls: 'M', role: 'Frigate',
    sector: 'Company Regard', coords: 'x −147k · z −185k · y 0k', off: [-3600, 4900],
    find: '76.5k to the Scale Plate Green gate, 324.7k to the Turquoise Sea gate, 171.8k to the highway.',
    claim: 'Spacesuit claim, medium hull.', danger: false,
  },
  {
    slug: 'drill-vanguard', name: 'Drill Vanguard', cls: 'M', role: 'Miner',
    sector: 'The Void', coords: '', off: [-3100, -2700],
    find: '392k from the Antigone Memorial gate, 508k from the Second Contact II Flashpoint gate.',
    claim: 'Spacesuit claim, medium hull.', danger: false,
  },
  {
    slug: 'odysseus-vanguard', name: 'Odysseus Vanguard', cls: 'L', role: 'Destroyer',
    sector: 'Faulty Logic VII', coords: 'x −165k · z 146k · y 0k', off: [-2700, -2900],
    find: '313k to the Faulty Logic I superhighway, 266k to the Atiya’s Misfortune III gate.',
    claim: 'Spacewalk to the bridge and claim, spawns fully equipped (4.0 HF2).', danger: false,
    prize: true,
  },
];
