/* Veanturverse — in-sector local highways, hand-traced from the in-game sector maps
   (the screenshots in /PREPS). Per sector NAME: the highway CENTRELINE as a polyline of
   [dx, dy] offsets from the sector centre, in universe units (same scale as the gate
   offsets; +x = right, +y = down). map.js draws each centreline as a DOUBLE lane (two
   parallel lines), matching the in-game super/local highways. Add sectors as they are traced. */
window.X4_HIGHWAYS = {
  // Nopileos' Fortune II — one double-lane highway: starts a short GAP above the lower gate
  // (gate sits ~[390,3430]) and runs up to the right, ENDING BELOW the Courier Vanguard.
  "Nopileos' Fortune II": [[610, 2860], [2200, -1300]],
};
