/* Veanturverse, X4 Universe Map engine
   Renders window.X4_UNIVERSE into an interactive pan/zoom SVG.
   Three visual styles: hex (default), constellation, territory. */
(function () {
  const U = window.X4_UNIVERSE;
  if (!U) { console.error('X4_UNIVERSE data missing'); return; }
  const SVGNS = 'http://www.w3.org/2000/svg';

  // ---- normalise coordinates into a compact local space ----
  const xs = U.sectors.map(s => s.x), ys = U.sectors.map(s => s.y);
  const minx = Math.min(...xs), maxx = Math.max(...xs);
  const miny = Math.min(...ys), maxy = Math.max(...ys);
  const K = 0.01; // universe units -> local units
  const sectors = U.sectors.map(s => ({
    ...s,
    lx: (s.x - minx) * K,
    ly: (s.y - miny) * K,
    lr: s.r * K,
    hexLocal: s.hex.map(p => [p[0] * K, p[1] * K]),
  }));
  const WORLD_W = (maxx - minx) * K, WORLD_H = (maxy - miny) * K;

  // neighbours
  const neighbours = sectors.map(() => []);
  U.edges.forEach(e => {
    neighbours[e.a].push({ id: e.b, type: e.type });
    neighbours[e.b].push({ id: e.a, type: e.type });
  });

  const fac = U.factions;
  const facColor = code => (fac[code] || fac.UNO).color;

  // ---- DOM refs ----
  const root = document.getElementById('mapRoot');
  const svg = document.getElementById('mapSvg');
  const gView = document.getElementById('gViewport');
  const gEdges = document.getElementById('gEdges');
  const gHex = document.getElementById('gHex');
  const gNode = document.getElementById('gNode');
  const gLabel = document.getElementById('gLabel');

  // ---- build elements ----
  function hexPath(s) {
    return s.hexLocal.map((p, i) => (i ? 'L' : 'M') + (s.lx + p[0]).toFixed(1) + ' ' + (s.ly + p[1]).toFixed(1)).join(' ') + ' Z';
  }

  // edges (drawn gate-to-gate, anchored at each sector's real in-game jump-gate position)
  function gateLocal(sec, off) { return off ? [sec.lx + off[0] * K, sec.ly + off[1] * K] : [sec.lx, sec.ly]; }
  // superhighway lane: a gently bowed quadratic curve between the two sectors
  function shPath(p, q) {
    const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
    const dx = q[0] - p[0], dy = q[1] - p[1];
    const len = Math.hypot(dx, dy) || 1;
    const arc = Math.min(len * 0.16, 13);          // arc height, capped so long lanes stay gentle
    const cx = mx - dy / len * arc, cy = my + dx / len * arc;
    return 'M' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) +
           ' Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + q[0].toFixed(1) + ' ' + q[1].toFixed(1);
  }
  const edgeEls = U.edges.map(e => {
    const a = sectors[e.a], b = sectors[e.b];
    const ga = gateLocal(a, e.ga), gb = gateLocal(b, e.gb);
    let ln;
    if (e.type === 'hw') {
      // superhighways render as curved glowing lanes (a <path>, not a straight line)
      ln = document.createElementNS(SVGNS, 'path');
      ln.setAttribute('d', shPath(ga, gb));
      ln.setAttribute('class', 'edge edge-hw');
    } else {
      ln = document.createElementNS(SVGNS, 'line');
      ln.setAttribute('x1', ga[0].toFixed(1)); ln.setAttribute('y1', ga[1].toFixed(1));
      ln.setAttribute('x2', gb[0].toFixed(1)); ln.setAttribute('y2', gb[1].toFixed(1));
      ln.setAttribute('class', 'edge edge-gate');
    }
    ln.dataset.a = e.a; ln.dataset.b = e.b;
    ln._gp = {}; ln._gp[e.a] = ga; ln._gp[e.b] = gb;
    ln._hw = e.type === 'hw';
    gEdges.appendChild(ln);
    return ln;
  });
  // lookup edge element by sector pair, + pool for intra-sector route bridges
  const edgeByKey = {};
  edgeEls.forEach(ln => { const a = +ln.dataset.a, b = +ln.dataset.b; edgeByKey[Math.min(a, b) + '_' + Math.max(a, b)] = ln; });
  let routeBridges = [];

  // gate dots: a small marker at every real jump-gate position
  U.edges.forEach(e => {
    const a = sectors[e.a], b = sectors[e.b];
    [[gateLocal(a, e.ga), e.type], [gateLocal(b, e.gb), e.type]].forEach(([p, t]) => {
      const d = document.createElementNS(SVGNS, 'circle');
      d.setAttribute('cx', p[0].toFixed(1)); d.setAttribute('cy', p[1].toFixed(1));
      d.setAttribute('r', t === 'hw' ? '2.1' : '2.7');
      d.setAttribute('class', 'gate-dot' + (t === 'hw' ? ' hw' : ''));
      gEdges.appendChild(d);
    });
  });

  // hexes + nodes + labels
  const hexEls = [], nodeEls = [], labelEls = [];
  sectors.forEach((s, i) => {
    const col = facColor(s.f);

    const path = document.createElementNS(SVGNS, 'path');
    path.setAttribute('d', hexPath(s));
    path.setAttribute('class', 'hex');
    path.style.setProperty('--fc', col);
    path.dataset.id = i;
    gHex.appendChild(path);
    hexEls.push(path);

    const node = document.createElementNS(SVGNS, 'circle');
    node.setAttribute('cx', s.lx.toFixed(1)); node.setAttribute('cy', s.ly.toFixed(1));
    node.setAttribute('r', Math.max(4, s.lr * 0.18).toFixed(1));
    node.setAttribute('class', 'node');
    node.style.setProperty('--fc', col);
    node.dataset.id = i;
    gNode.appendChild(node);
    nodeEls.push(node);

    const label = document.createElementNS(SVGNS, 'text');
    label.setAttribute('x', s.lx.toFixed(1));
    label.setAttribute('y', (s.ly - s.lr * 0.58).toFixed(1));
    label.setAttribute('class', 'label');
    label.textContent = s.name;
    label.dataset.id = i;
    gLabel.appendChild(label);
    labelEls.push(label);
  });

  // in-sector local highways, hand-traced centrelines (X4_HIGHWAYS, by sector name),
  // each drawn as a double lane (two parallel lines) like the in-game highways
  const HWY = window.X4_HIGHWAYS || {};
  if (Object.keys(HWY).length) {
    const gHw = document.createElementNS(SVGNS, 'g');
    gHw.setAttribute('id', 'gHighways');
    gView.insertBefore(gHw, gNode); // above hex fills, below nodes/labels
    const lanePath = pts => 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
    Object.keys(HWY).forEach(nm => {
      const sid = sectors.findIndex(s => s.name === nm);
      if (sid < 0) return;
      const c = HWY[nm] || [];
      if (c.length < 2) return;
      const s = sectors[sid];
      // perpendicular to the overall direction -> two parallel lanes
      const dx = c[c.length - 1][0] - c[0][0], dy = c[c.length - 1][1] - c[0][1], L = Math.hypot(dx, dy) || 1;
      const px = -dy / L, py = dx / L, gap = 25;
      [gap, -gap].forEach(d => {
        const lane = c.map(p => [s.lx + (p[0] + px * d) * K, s.ly + (p[1] + py * d) * K]);
        const path = document.createElementNS(SVGNS, 'path');
        path.setAttribute('d', lanePath(lane));
        path.setAttribute('class', 'hw-local');
        gHw.appendChild(path);
      });
    });
  }

  // station markers, fixed NPC anchor stations, X4-style icon badges (extracted/redrawn from the game map)
  const STN_TYPES = window.X4_STATION_TYPES || {};
  const STN_DATA = window.X4_STATIONS || {};
  const STN_PRIO = { SY: 1, WH: 2, HQ: 2, EQ: 3, TR: 4, PB: 4 }; // which icon represents a sector at medium zoom
  const STN_BADGE = '<polygon points="5,1 11,1 14.5,7 11,13 5,13 1.5,7" fill="#0a0e1a" stroke="currentColor" stroke-width="0.9"/>';
  const STN_GLYPH = {
    SY: '<polyline points="6,7.6 8,6.6 10,7.6 8,3.6 6,7.6" fill="currentColor" stroke="currentColor" stroke-width="0.4" stroke-linejoin="round"/><rect x="5.2" y="9" width="5.6" height="1.25" fill="currentColor"/><rect x="5.2" y="10.6" width="5.6" height="1.25" fill="currentColor"/>',
    WH: '<polyline points="5.6,9 8,8 10.4,9 8,4.2 5.6,9" fill="currentColor" stroke="currentColor" stroke-width="0.4" stroke-linejoin="round"/><rect x="5.6" y="10.2" width="4.8" height="1.2" fill="currentColor"/>',
    EQ: '<path d="M 4 9 C 6 7, 8 9, 6 11" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M 10 3 C 8 5, 10 7, 12 5" fill="none" stroke="currentColor" stroke-width="1.2"/><line x1="6" y1="9" x2="10" y2="5" stroke="currentColor" stroke-width="1.6"/>',
    TR: '<text x="7" y="11.4" font-size="12" font-family="Sans-Serif" font-style="italic" font-weight="bold" fill="currentColor" text-anchor="middle">C</text><text x="8.7" y="8.5" font-size="4.8" font-family="Sans-Serif" font-style="italic" font-weight="bold" fill="currentColor" text-anchor="middle">R</text>',
    HQ: '<polygon points="8,3 9.05,6.15 12.4,6.15 9.7,8.25 10.7,11.5 8,9.5 5.3,11.5 6.3,8.25 3.6,6.15 6.95,6.15" fill="currentColor"/>',
    PB: '<line x1="5" y1="11" x2="10.6" y2="3.4" stroke="currentColor" stroke-width="1"/><line x1="11" y1="11" x2="5.4" y2="3.4" stroke="currentColor" stroke-width="1"/><line x1="4.6" y1="7.7" x2="7.7" y2="10.2" stroke="currentColor" stroke-width="1"/><line x1="11.4" y1="7.7" x2="8.3" y2="10.2" stroke="currentColor" stroke-width="1"/>',
  };
  function makeIcon(code, color, cx, cy, w) {
    const sc = w / 16;
    const g = document.createElementNS(SVGNS, 'g');
    g.setAttribute('transform', `translate(${(cx - 8 * sc).toFixed(1)} ${(cy - 7 * sc).toFixed(1)}) scale(${sc.toFixed(3)})`);
    g.setAttribute('class', 'stn-ico');
    g.style.color = color;
    g.innerHTML = STN_BADGE + (STN_GLYPH[code] || '');
    return g;
  }
  const gStations = document.createElementNS(SVGNS, 'g');
  gStations.setAttribute('id', 'gStations');
  gView.appendChild(gStations);
  const STN_POS = window.X4_STATION_POS || {};
  sectors.forEach((s) => {
    const codes = STN_DATA[s.name];
    if (!codes || !codes.length) return;
    const w1 = Math.max(9, s.lr * 0.34), w = Math.max(7, s.lr * 0.27);
    const pos = STN_POS[s.name];

    if (pos && pos.length) {
      // real in-sector positions (reconciled against the community map SVG)
      // primary single icon (medium zoom): highest-priority station, drawn at its true spot
      const prim = pos.slice().sort((a, b) => (STN_PRIO[a[0]] || 9) - (STN_PRIO[b[0]] || 9))[0];
      const gOne = document.createElementNS(SVGNS, 'g'); gOne.setAttribute('class', 'stn-one');
      gOne.appendChild(makeIcon(prim[0], (STN_TYPES[prim[0]] || {}).color || '#8aa', s.lx + prim[1] * K, s.ly + prim[2] * K, w1));
      gStations.appendChild(gOne);
      // every station at its real position (close zoom)
      const gAll = document.createElementNS(SVGNS, 'g'); gAll.setAttribute('class', 'stn-all');
      pos.forEach(([code, dx, dy]) => gAll.appendChild(makeIcon(code, (STN_TYPES[code] || {}).color || '#8aa', s.lx + dx * K, s.ly + dy * K, w)));
      gStations.appendChild(gAll);
      return;
    }

    // fallback: centred badge row near the hex's lower edge
    const cy = s.ly + s.lr * 0.46;
    const prim = codes.slice().sort((a, b) => (STN_PRIO[a] || 9) - (STN_PRIO[b] || 9))[0];
    const gOne = document.createElementNS(SVGNS, 'g'); gOne.setAttribute('class', 'stn-one');
    gOne.appendChild(makeIcon(prim, (STN_TYPES[prim] || {}).color || '#8aa', s.lx, cy, w1));
    gStations.appendChild(gOne);
    const gAll = document.createElementNS(SVGNS, 'g'); gAll.setAttribute('class', 'stn-all');
    const gap = w * 0.26, rowW = codes.length * w + (codes.length - 1) * gap, x0 = s.lx - rowW / 2 + w / 2;
    codes.forEach((code, k) => gAll.appendChild(makeIcon(code, (STN_TYPES[code] || {}).color || '#8aa', x0 + k * (w + gap), cy, w)));
    gStations.appendChild(gAll);
  });

  // cluster labels (own layer, shown when zoomed out)
  const gCluster = document.createElementNS(SVGNS, 'g');
  gCluster.setAttribute('id', 'gCluster');
  gView.appendChild(gCluster);
  const clusterEls = (U.clusters || []).map(c => {
    const t = document.createElementNS(SVGNS, 'text');
    t.setAttribute('x', ((c.x - minx) * K).toFixed(1));
    t.setAttribute('y', ((c.y - miny) * K).toFixed(1));
    t.setAttribute('class', 'clabel');
    t.style.setProperty('--fc', facColor(c.f));
    t.textContent = c.name;
    gCluster.appendChild(t);
    return t;
  });

  // transparent hit targets (on top) so clicks/hover always register
  const hitEls = sectors.map((s, i) => {
    const c = document.createElementNS(SVGNS, 'circle');
    c.setAttribute('cx', s.lx.toFixed(1)); c.setAttribute('cy', s.ly.toFixed(1));
    c.setAttribute('r', Math.max(s.lr * 0.9, 22).toFixed(1));
    c.setAttribute('class', 'hit');
    c.dataset.id = i;
    gView.appendChild(c);
    return c;
  });

  // ---- derelict / free-ship lens ----
  const pinsHost = document.getElementById('mapPins');
  const clsRank = { S: 1, M: 2, L: 3 };
  const derelicts = (window.X4_DERELICTS || [])
    .map(d => ({ ...d, sectorId: sectors.findIndex(s => s.name === d.sector) }))
    .filter(d => d.sectorId >= 0);
  const bySlug = {}; derelicts.forEach(d => bySlug[d.slug] = d);
  const derelictBySector = {};
  derelicts.forEach(d => { (derelictBySector[d.sectorId] = derelictBySector[d.sectorId] || []).push(d); });

  const pinEls = Object.keys(derelictBySector).map(k => {
    const sid = +k, ships = derelictBySector[sid];
    const danger = ships.some(s => s.danger);
    const top = ships.slice().sort((a, b) => clsRank[b.cls] - clsRank[a.cls])[0];
    const el = document.createElement('button');
    el.className = 'pin' + (danger ? ' danger' : '') + (ships.some(s => s.prize) ? ' prize' : '');
    el.innerHTML = `<span class="pin-cls">${top.cls}</span>`
      + (ships.length > 1 ? `<span class="pin-count">${ships.length}</span>` : '')
      + (danger ? '<span class="pin-warn">\u26a0</span>' : '');
    el.title = ships.map(s => s.name).join(' \u00b7 ') + ' \u2014 ' + sectors[sid].name;
    el.onclick = () => activateSector(sid);
    pinsHost.appendChild(el);
    return { el, sectorId: sid, off: top.off || [0, 0] };
  });

  let lensShips = false, lensTimeline = false;
  const lensBtn = document.getElementById('lensShips');
  const lensTlBtn = document.getElementById('lensTimeline');
  function refreshLenses() {
    root.classList.toggle('lens-on', lensShips);
    root.classList.toggle('lens-tl-on', lensTimeline);
    if (lensBtn) { lensBtn.classList.toggle('active', lensShips); lensBtn.setAttribute('aria-pressed', lensShips ? 'true' : 'false'); }
    updatePins();
  }
  // ONE toggle reveals BOTH overlays: derelict ships + timeline-reward ships
  // (both checklists stacked in #shipsPanels, both pin colours on the map at once)
  function setLens(on) { lensShips = on; lensTimeline = on; refreshLenses(); }
  function setTimelineLens(on) { setLens(on); } // kept for the ?tlship= deep link
  if (lensBtn) lensBtn.onclick = () => setLens(!lensShips);

  function positionPins(arr) {
    arr.forEach(p => {
      const s = sectors[p.sectorId];
      const ox = p.off ? p.off[0] * K : 0, oy = p.off ? p.off[1] * K : 0;
      const sx = (s.lx + ox) * scale + tx, sy = (s.ly + oy) * scale + ty;
      if (sx < -30 || sx > vw + 30 || sy < -30 || sy > vh + 30) { p.el.style.display = 'none'; return; }
      p.el.style.display = 'flex';
      p.el.style.left = sx.toFixed(1) + 'px';
      p.el.style.top = sy.toFixed(1) + 'px';
    });
  }
  function updatePins() {
    if (lensShips) positionPins(pinEls);
    if (lensTimeline) positionPins(timelinePinEls);
  }

  // ---- "found" checklist (local-only, no account; persisted in localStorage) ----
  const FOUND_KEY = 'vv_x4_found';
  let foundSet = new Set();
  try { foundSet = new Set(JSON.parse(localStorage.getItem(FOUND_KEY) || '[]')); } catch (e) {}
  function isFound(slug) { return foundSet.has(slug); }
  function saveFound() { try { localStorage.setItem(FOUND_KEY, JSON.stringify([...foundSet])); } catch (e) {} }
  function toggleFound(slug) { if (foundSet.has(slug)) foundSet.delete(slug); else foundSet.add(slug); saveFound(); onFoundChange(); }
  function clearFound() { foundSet.clear(); saveFound(); onFoundChange(); }
  function updatePinFound() {
    pinEls.forEach(p => { const sh = derelictBySector[p.sectorId] || []; p.el.classList.toggle('found', sh.length > 0 && sh.every(s => isFound(s.slug))); });
  }
  function onFoundChange() { renderShipsIndex(); if (selected != null) renderPanel(); updatePinFound(); }

  // ships index + found progress (shown when derelict lens on)
  const idxHost = document.getElementById('shipsIndex');
  function renderShipsIndex() {
    if (!idxHost) return;
    const foundN = derelicts.reduce((n, d) => n + (isFound(d.slug) ? 1 : 0), 0);
    idxHost.innerHTML = `<div class="si-h"><span>Derelict ships \u00b7 <span class="si-prog">${foundN}/${derelicts.length} found</span></span>${foundN ? '<button class="si-reset" data-reset-found>Reset</button>' : ''}</div>` +
      derelicts.slice().sort((a, b) => clsRank[b.cls] - clsRank[a.cls]).map(d => {
        const f = isFound(d.slug);
        return `<button class="si-row${f ? ' found' : ''}" data-slug="${d.slug}">
          <span class="si-cls cls-${d.cls}${d.danger ? ' danger' : ''}">${d.cls}</span>
          <span class="si-info"><span class="si-name">${esc(d.name)}</span><span class="si-sec">${esc(d.sector)}</span></span>
          ${d.danger ? '<span class="si-warn">\u26a0</span>' : ''}
          <span class="si-check" data-found="${d.slug}" role="checkbox" aria-checked="${f}" title="Mark as found">${f ? '\u2713' : ''}</span>
        </button>`;
      }).join('');
    idxHost.querySelectorAll('.si-row').forEach(r => r.onclick = (e) => {
      const chk = e.target.closest('[data-found]');
      if (chk) { toggleFound(chk.dataset.found); return; }
      const d = bySlug[r.dataset.slug]; if (d) selectSector(d.sectorId);
    });
    const rb = idxHost.querySelector('[data-reset-found]');
    if (rb) rb.onclick = (e) => { e.stopPropagation(); if (confirm('Reset all \u201cfound\u201d markers for a new save?')) clearFound(); };
  }
  renderShipsIndex();
  updatePinFound();

  // ---- timeline-reward ships (mirrors derelicts; own violet lens, only shows when data exists) ----
  const pinsTlHost = document.getElementById('mapPinsTl');
  const timelineShips = (window.X4_TIMELINE_SHIPS || [])
    .map(d => ({ ...d, sectorId: sectors.findIndex(s => s.name === d.sector) }))
    .filter(d => d.sectorId >= 0);
  const bySlugTl = {}; timelineShips.forEach(d => bySlugTl[d.slug] = d);
  const timelineBySector = {};
  timelineShips.forEach(d => { (timelineBySector[d.sectorId] = timelineBySector[d.sectorId] || []).push(d); });
  const timelinePinEls = Object.keys(timelineBySector).map(k => {
    const sid = +k, ships = timelineBySector[sid];
    const danger = ships.some(s => s.danger);
    const top = ships.slice().sort((a, b) => clsRank[b.cls] - clsRank[a.cls])[0];
    const el = document.createElement('button');
    el.className = 'pin tl' + (danger ? ' danger' : '');
    el.innerHTML = `<span class="pin-cls">${top.cls}</span>`
      + (ships.length > 1 ? `<span class="pin-count">${ships.length}</span>` : '')
      + (danger ? '<span class="pin-warn">⚠</span>' : '');
    el.title = ships.map(s => (s.tl ? s.tl + ' ' : '') + s.name).join(' · ') + ' · ' + sectors[sid].name + ' (Timeline)';
    el.onclick = () => { if (top.zoom != null && !routeMode) { selectSector(sid, false); flyTo(sid, true, top.zoom); } else activateSector(sid); };
    if (pinsTlHost) pinsTlHost.appendChild(el);
    return { el, sectorId: sid, off: top.off || [0, 0] };
  });

  // ---- timeline "found" checklist (independent store + progress, mirrors derelicts) ----
  const FOUND_TL_KEY = 'vv_x4_tl_found';
  let foundTlSet = new Set();
  try { foundTlSet = new Set(JSON.parse(localStorage.getItem(FOUND_TL_KEY) || '[]')); } catch (e) {}
  function isFoundTl(slug) { return foundTlSet.has(slug); }
  function saveFoundTl() { try { localStorage.setItem(FOUND_TL_KEY, JSON.stringify([...foundTlSet])); } catch (e) {} }
  function toggleFoundTl(slug) { if (foundTlSet.has(slug)) foundTlSet.delete(slug); else foundTlSet.add(slug); saveFoundTl(); onFoundTlChange(); }
  function clearFoundTl() { foundTlSet.clear(); saveFoundTl(); onFoundTlChange(); }
  function updatePinFoundTl() {
    timelinePinEls.forEach(p => { const sh = timelineBySector[p.sectorId] || []; p.el.classList.toggle('found', sh.length > 0 && sh.every(s => isFoundTl(s.slug))); });
  }
  function onFoundTlChange() { renderTimelineIndex(); if (selected != null) renderPanel(); updatePinFoundTl(); }

  // timeline ships index + found progress (second checklist, docked under the derelict one)
  const idxTlHost = document.getElementById('timelineIndex');
  function renderTimelineIndex() {
    if (!idxTlHost || !timelineShips.length) return;
    const foundN = timelineShips.reduce((n, d) => n + (isFoundTl(d.slug) ? 1 : 0), 0);
    idxTlHost.innerHTML = `<div class="si-h"><span>Derelict timeline ships · <span class="si-prog">${foundN}/${timelineShips.length} found</span></span>${foundN ? '<button class="si-reset" data-reset-tl>Reset</button>' : ''}</div>` +
      timelineShips.slice().sort((a, b) => clsRank[b.cls] - clsRank[a.cls]).map(d => {
        const f = isFoundTl(d.slug);
        return `<button class="si-row${f ? ' found' : ''}" data-slug="${d.slug}">
          <span class="si-cls cls-${d.cls}${d.danger ? ' danger' : ''}">${d.cls}</span>
          <span class="si-info"><span class="si-name">${esc(d.name)}</span><span class="si-sec">${d.tl ? esc(d.tl) + ' · ' : ''}${esc(d.sector)}</span></span>
          ${d.danger ? '<span class="si-warn">⚠</span>' : ''}
          <span class="si-check" data-found-tl="${d.slug}" role="checkbox" aria-checked="${f}" title="Mark as found">${f ? '✓' : ''}</span>
        </button>`;
      }).join('');
    idxTlHost.querySelectorAll('.si-row').forEach(r => r.onclick = (e) => {
      const chk = e.target.closest('[data-found-tl]');
      if (chk) { toggleFoundTl(chk.dataset.foundTl); return; }
      const d = bySlugTl[r.dataset.slug]; if (!d) return; if (d.zoom != null) { selectSector(d.sectorId, false); flyTo(d.sectorId, true, d.zoom); } else selectSector(d.sectorId);
    });
    const rb = idxTlHost.querySelector('[data-reset-tl]');
    if (rb) rb.onclick = (e) => { e.stopPropagation(); if (confirm('Reset all timeline-ship “found” markers?')) clearFoundTl(); };
  }
  renderTimelineIndex();
  updatePinFoundTl();

  // ---- Kha'ak-safe overlay (highlight sectors >3 gate jumps from any hard-coded Kha'ak hive) ----
  // 'hw' edges link sub-sectors of the same in-game macro sector (e.g. Black Hole Sun IV/V,
  // Grand Exchange I/III/IV) - no jump gate between them, so they don't count as a jump for
  // the game's own $HiveStationGateRange check. Union those sub-sectors into one node first,
  // then BFS only over real 'gate' edges, or distances come out one jump too safe.
  const khaakHives = (window.X4_KHAAK_HIVES || [])
    .map(name => sectors.findIndex(s => s.name === name))
    .filter(id => id >= 0);
  const khaakDist = (() => {
    const parent = sectors.map((_, i) => i);
    const find = i => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
    const union = (a, b) => { a = find(a); b = find(b); if (a !== b) parent[b] = a; };
    U.edges.forEach(e => { if (e.type === 'hw') union(e.a, e.b); });

    const groupNeighbours = new Map();
    U.edges.forEach(e => {
      if (e.type !== 'gate') return;
      const a = find(e.a), b = find(e.b);
      if (a === b) return;
      if (!groupNeighbours.has(a)) groupNeighbours.set(a, new Set());
      if (!groupNeighbours.has(b)) groupNeighbours.set(b, new Set());
      groupNeighbours.get(a).add(b);
      groupNeighbours.get(b).add(a);
    });

    const groupDist = new Map();
    const q = [];
    khaakHives.forEach(h => { const g = find(h); if (!groupDist.has(g)) { groupDist.set(g, 0); q.push(g); } });
    for (let head = 0; head < q.length; head++) {
      const u = q[head], du = groupDist.get(u);
      for (const v of (groupNeighbours.get(u) || [])) if (!groupDist.has(v) || groupDist.get(v) > du + 1) { groupDist.set(v, du + 1); q.push(v); }
    }
    return sectors.map((_, i) => { const d = groupDist.get(find(i)); return d === undefined ? Infinity : d; });
  })();
  const khaakSafeCount = khaakHives.length ? sectors.reduce((n, s, i) => n + (khaakDist[i] > 3 ? 1 : 0), 0) : 0;
  let khaakMode = false;
  const khaakBtn = document.getElementById('lensKhaak');
  const khaakNote = document.getElementById('khaakNote');
  if (khaakBtn && khaakHives.length) khaakBtn.removeAttribute('hidden');
  if (khaakNote && khaakHives.length) khaakNote.innerHTML = `<b>Kha'ak-safe sectors</b>, <span class="kn-n">${khaakSafeCount}</span> sectors lie more than 3 jumps from any of the ${khaakHives.length} Kha'ak hive sectors, so Kha'ak raids can't reach stations built there. <span class="kn-legend"><i class="kn-k kn-safe"></i>safe<i class="kn-k kn-near"></i>&le;3 jumps<i class="kn-k kn-hive"></i>hive</span>`;
  function setKhaak(on) {
    khaakMode = on;
    if (on) { terraformMode = false; root.classList.remove('terra-on'); if (terraBtn) { terraBtn.classList.remove('active'); terraBtn.setAttribute('aria-pressed', 'false'); } factionFilter = null; stationFilter.clear(); stationFilterUpdate(); document.querySelectorAll('.leg').forEach(x => x.classList.remove('active')); }
    root.classList.toggle('khaak-on', on);
    if (khaakBtn) { khaakBtn.classList.toggle('active', on); khaakBtn.setAttribute('aria-pressed', on ? 'true' : 'false'); }
    refreshEmphasis();
  }
  if (khaakBtn) khaakBtn.onclick = () => setKhaak(!khaakMode);

  // ---- Terraforming overlay (highlight terraformable planet sectors; Cradle of Humanity) ----
  const terraformSet = new Set((window.X4_TERRAFORM_SECTORS || []).map(n => sectors.findIndex(s => s.name === n)).filter(i => i >= 0));
  let terraformMode = false;
  const terraBtn = document.getElementById('lensTerraform');
  const terraNote = document.getElementById('terraformNote');
  if (terraBtn && terraformSet.size) terraBtn.removeAttribute('hidden');
  if (terraNote && terraformSet.size) terraNote.innerHTML = `<b>Terraforming sectors</b>, <span class="tn-n">${terraformSet.size}</span> sectors across the terraformable clusters (Cradle of Humanity and Kingdom End DLCs). Relocate your HQ to one of these clusters to run a terraforming project.`;
  function setTerraform(on) {
    terraformMode = on;
    if (on) {
      khaakMode = false; root.classList.remove('khaak-on');
      if (khaakBtn) { khaakBtn.classList.remove('active'); khaakBtn.setAttribute('aria-pressed', 'false'); }
      factionFilter = null; stationFilter.clear(); stationFilterUpdate(); document.querySelectorAll('.leg').forEach(x => x.classList.remove('active'));
    }
    root.classList.toggle('terra-on', on);
    if (terraBtn) { terraBtn.classList.toggle('active', on); terraBtn.setAttribute('aria-pressed', on ? 'true' : 'false'); }
    refreshEmphasis();
  }
  if (terraBtn) terraBtn.onclick = () => setTerraform(!terraformMode);

  // ---- view transform (pan / zoom) ----
  let scale = 1, tx = 0, ty = 0;
  let vw = 0, vh = 0, clpx = 9;
  function measure() { const r = svg.getBoundingClientRect(); vw = r.width; vh = r.height; }
  function apply() {
    gView.setAttribute('transform', `translate(${tx} ${ty}) scale(${scale})`);
    // keep labels & strokes readable at any zoom; cluster labels shrink when zoomed out
    clpx = Math.max(7.5, Math.min(11, 7.5 + (scale - 0.18) * 11));
    root.style.setProperty('--z', scale);
    root.style.setProperty('--clpx', clpx.toFixed(2) + 'px');
    root.classList.toggle('st1', scale >= STN_T1 && scale < STN_T2);
    root.classList.toggle('st2', scale >= STN_T2);
    updateLabelVisibility();
    updatePins();
  }
  function fit(pad = 0.08) {
    measure();
    const s = Math.min(vw / WORLD_W, vh / WORLD_H) * (1 - pad);
    scale = s;
    tx = (vw - WORLD_W * s) / 2;
    ty = (vh - WORLD_H * s) / 2;
    apply();
  }
  function zoomAt(cx, cy, factor) {
    const ns = Math.min(8, Math.max(0.18, scale * factor));
    const k = ns / scale;
    tx = cx - (cx - tx) * k;
    ty = cy - (cy - ty) * k;
    scale = ns;
    apply();
  }

  const SECTOR_T = 0.5; // at/above this zoom show sectors; below show clusters
  const STN_T1 = 0.16; // single representative icon, visible already at the full overview
  const STN_T2 = 0.62; // show the full station icon row when zoomed closer
  // estimated on-screen label width (constant px because font counter-scales with zoom)
  function estW(txt, perChar) { return txt.length * perChar + 10; }
  function declutter(items) {
    // items: [{el, sx, sy, w, h, force}] sorted by priority desc; greedily place non-overlapping
    const placed = [];
    for (const it of items) {
      if (it.force) { it.el.classList.add('show'); placed.push(it); continue; }
      if (it.sx < -40 || it.sx > vw + 40 || it.sy < -20 || it.sy > vh + 20) { it.el.classList.remove('show'); continue; }
      const x0 = it.sx - it.w / 2, x1 = it.sx + it.w / 2, y0 = it.sy - it.h / 2, y1 = it.sy + it.h / 2;
      let ok = true;
      for (const p of placed) {
        if (x0 < p.sx + p.w / 2 && x1 > p.sx - p.w / 2 && y0 < p.sy + p.h / 2 && y1 > p.sy - p.h / 2) { ok = false; break; }
      }
      it.el.classList.toggle('show', ok);
      if (ok) placed.push(it);
    }
  }
  function updateLabelVisibility() {
    const showSectors = scale >= SECTOR_T;
    const nb = selected != null ? new Set(neighbours[selected].map(n => n.id)) : null;
    const rset = routePath ? new Set(routePath) : null;
    if (stationFilter.size) {
      // station filter active: show ONLY the names of matching sectors (any zoom)
      clusterEls.forEach(t => t.classList.remove('show'));
      labelEls.forEach((l, i) => {
        const m = (STN_DATA[sectors[i].name] || []).some(c => stationFilter.has(c));
        l.classList.toggle('show', m);
        l.classList.toggle('match', m);
      });
      return;
    }
    labelEls.forEach(l => l.classList.remove('match'));
    if (showSectors) {
      clusterEls.forEach(t => t.classList.remove('show'));
      const items = sectors.map((s, i) => ({
        el: labelEls[i], sx: s.lx * scale + tx, sy: (s.ly - s.lr * 0.58) * scale + ty,
        w: estW(s.name, 6.2), h: 14,
        force: selected === i || (nb && nb.has(i)) || (rset && rset.has(i)),
        pr: (selected === i ? 1e9 : (rset && rset.has(i)) ? 5e8 : nb && nb.has(i) ? 1e8 : s.lr),
      })).sort((a, b) => b.pr - a.pr);
      declutter(items);
    } else {
      labelEls.forEach((l, i) => {
        const f = selected === i || (nb && nb.has(i)) || (rset && rset.has(i));
        l.classList.toggle('show', !!f);
      });
      const items = clusterEls.map((el, i) => {
        const c = U.clusters[i];
        const dim = factionFilter && c.f !== factionFilter;
        el.classList.toggle('dim', !!dim);
        return { el, sx: (c.x - minx) * K * scale + tx, sy: (c.y - miny) * K * scale + ty,
          w: estW(c.name, clpx * 0.74), h: clpx + 4, force: false, pr: c.n * 100 + (c.f !== 'UNO' ? 10 : 0) - c.name.length * 0.1 };
      }).sort((a, b) => b.pr - a.pr);
      declutter(items);
    }
  }

  // ---- pointer interaction ----
  let dragging = false, moved = false, px = 0, py = 0, downX = 0, downY = 0;
  svg.addEventListener('pointerdown', e => {
    dragging = true; moved = false;
    px = downX = e.clientX; py = downY = e.clientY;
    // NOTE: do NOT capture here, capturing on pointerdown redirects the
    // click to the <svg> and breaks per-sector hit clicks. Capture lazily once a drag starts.
  });
  svg.addEventListener('pointermove', e => {
    if (!dragging) return;
    if (!moved) {
      if (Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) <= 3) return;
      moved = true;
      try { svg.setPointerCapture(e.pointerId); } catch (_) {}
      px = e.clientX; py = e.clientY;
    }
    const dx = e.clientX - px, dy = e.clientY - py;
    tx += dx; ty += dy; px = e.clientX; py = e.clientY;
    gView.setAttribute('transform', `translate(${tx} ${ty}) scale(${scale})`);
    updatePins();
  });
  svg.addEventListener('pointerup', e => { dragging = false; try { svg.releasePointerCapture(e.pointerId); } catch (_) {} updateLabelVisibility(); });
  svg.addEventListener('wheel', e => {
    e.preventDefault();
    const r = svg.getBoundingClientRect();
    zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.16 : 1 / 1.16);
  }, { passive: false });

  // hover + click via hit targets
  hitEls.forEach(h => {
    const id = +h.dataset.id;
    h.addEventListener('pointerenter', () => setHover(id));
    h.addEventListener('pointerleave', () => setHover(null));
    h.addEventListener('click', e => { if (!moved) activateSector(id); });
  });

  // ---- selection / hover state ----
  let selected = null, hovered = null, factionFilter = null;
  let stationFilter = new Set();
  let stationFilterUpdate = () => {};
  // ---- routing state ----
  let routeMode = false, routeStart = null, routeDest = null, routePath = null;

  // ---- hover-info + click-centering options ----
  const coarsePointer = !!(window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches);
  const hoverInfoEnabled = !coarsePointer;   // hover preview always on (auto-off only on touch)
  let centerOnClick = true;
  const hoverInfoEl = document.getElementById('hoverInfo');
  let lastPx = 0, lastPy = 0;

  function setHover(id) {
    hovered = id;
    hexEls.forEach((el, i) => el.classList.toggle('hover', i === id));
    nodeEls.forEach((el, i) => el.classList.toggle('hover', i === id));
    if (id != null) {
      labelEls[id].classList.add('show');
      svg.style.cursor = 'pointer';
      showHoverInfo(id);
    } else {
      svg.style.cursor = 'grab';
      updateLabelVisibility();
      hideHoverInfo();
    }
  }
  function showHoverInfo(id) {
    if (!hoverInfoEl || !hoverInfoEnabled) return;
    const s = sectors[id], f = fac[s.f] || fac.UNO, gates = neighbours[id].length;
    const der = (derelictBySector[id] || []).length, tl = (timelineBySector[id] || []).length;
    let ctx = '';
    if (khaakMode) { const d = khaakDist[id]; ctx = d === 0 ? '<span class="hi-x">⬡ Kha\'ak hive</span>' : (d > 3 ? '<span class="hi-ok">⬡ Kha\'ak-safe · ' + d + ' jumps</span>' : '<span class="hi-warn">⬡ ' + d + ' jump' + (d === 1 ? '' : 's') + ' from a hive</span>'); }
    else if (terraformMode && terraformSet.has(id)) ctx = '<span class="hi-tf">⊕ Terraformable</span>';
    hoverInfoEl.innerHTML =
      '<div class="hi-name">' + esc(s.name) + '</div>' +
      '<div class="hi-fac"><span class="hi-dot" style="background:' + f.color + '"></span>' + esc(f.short) + ' · ' + gates + ' gate' + (gates === 1 ? '' : 's') + '</div>' +
      (der ? '<div class="hi-tag der">◆ ' + der + ' derelict' + (der === 1 ? '' : 's') + '</div>' : '') +
      (tl ? '<div class="hi-tag tl">✦ ' + tl + ' timeline ship' + (tl === 1 ? '' : 's') + '</div>' : '') +
      (ctx ? '<div class="hi-tag">' + ctx + '</div>' : '') +
      ((STN_DATA[s.name] && STN_DATA[s.name].length) ? '<div class="hi-stn"><div class="hi-stn-h">Stations</div>' + stationRows(s.name) + '</div>' : '') +
      ((window.X4_SECTOR_RESOURCES || {})[s.name] ? '<div class="hi-rsc">' + resourceRows(id) + '</div>' : '');
    hoverInfoEl.classList.add('show');
    positionHoverInfo();
  }
  function hideHoverInfo() { if (hoverInfoEl) hoverInfoEl.classList.remove('show'); }
  function positionHoverInfo() {
    if (!hoverInfoEl || !hoverInfoEl.classList.contains('show')) return;
    const pad = 16, w = hoverInfoEl.offsetWidth, h = hoverInfoEl.offsetHeight;
    let x = lastPx + pad, y = lastPy + pad;
    if (x + w > vw - 6) x = lastPx - w - pad;
    if (y + h > vh - 6) y = lastPy - h - pad;
    hoverInfoEl.style.left = Math.max(6, x) + 'px';
    hoverInfoEl.style.top = Math.max(6, y) + 'px';
  }

  // ---- minable resources -> golden 5-star rows (panel + tooltip) ----
  const RSC_NAMES = { ore: 'Ore', silicon: 'Silicon', ice: 'Ice', nividium: 'Nividium', hydrogen: 'Hydrogen', helium: 'Helium', methane: 'Methane', rawscrap: 'Scrap', rawkhaakscrap: 'Kha\'ak Scrap' };
  const RSC_ORDER = ['ore', 'silicon', 'ice', 'nividium', 'hydrogen', 'helium', 'methane', 'rawscrap', 'rawkhaakscrap'];
  function resourceRows(id) {
    const r = (window.X4_SECTOR_RESOURCES || {})[sectors[id].name];
    if (!r) return null;
    return RSC_ORDER.filter(k => r[k]).map(k =>
      `<div class="rsc-row"><span class="rsc-name">${RSC_NAMES[k]}</span><span class="stars" style="--p:${r[k]}%" title="${r[k]}%"><i></i></span></div>`
    ).join('');
  }

  // ---- NPC anchor stations -> coloured type chips in the hover popup ----
  function stationRows(name) {
    const codes = STN_DATA[name];
    if (!codes || !codes.length) return '';
    return [...new Set(codes)].map(c => {
      const t = STN_TYPES[c] || {};
      return '<span class="stn-chip" style="color:' + (t.color || '#8aa') + '" title="' + esc(t.sub || '') + '">' +
        '<svg class="stn-ic" viewBox="0 0 16 14" aria-hidden="true">' + STN_BADGE + (STN_GLYPH[c] || '') + '</svg>' +
        '<span class="stn-nm">' + esc(t.name || c) + '</span></span>';
    }).join('');
  }

  function refreshEmphasis() {
    const nb = selected != null ? new Set(neighbours[selected].map(n => n.id)) : null;
    const rset = routePath ? new Set(routePath) : null;
    const redges = new Map(); // key -> fromNode (earlier node along the path)
    if (routePath) for (let i = 0; i + 1 < routePath.length; i++) { const a = routePath[i], b = routePath[i + 1]; redges.set(Math.min(a, b) + '-' + Math.max(a, b), a); }
    sectors.forEach((s, i) => {
      let dim = false, sel = false, adj = false;
      if (rset) {
        const on = rset.has(i);
        dim = !on;
        hexEls[i].classList.remove('stn-match', 'khaak-safe', 'khaak-hive', 'khaak-near', 'terra');
        hexEls[i].classList.toggle('route', on && i !== routeStart && i !== routeDest);
        hexEls[i].classList.toggle('route-start', i === routeStart);
        hexEls[i].classList.toggle('route-dest', i === routeDest);
        hexEls[i].classList.toggle('route-danger', on && s.f === 'XEN' && i !== routeStart && i !== routeDest);
        nodeEls[i].classList.toggle('route-start', i === routeStart);
        nodeEls[i].classList.toggle('route-dest', i === routeDest);
      } else if (khaakMode) {
        const dst = khaakDist[i], hive = dst === 0, safe = dst > 3;
        sel = i === selected;
        dim = !safe && !sel;
        hexEls[i].classList.remove('stn-match', 'route', 'route-start', 'route-dest', 'route-danger', 'terra');
        hexEls[i].classList.toggle('khaak-safe', safe);
        hexEls[i].classList.toggle('khaak-hive', hive);
        hexEls[i].classList.toggle('khaak-near', !safe && !hive);
        nodeEls[i].classList.remove('route-start', 'route-dest');
      } else if (terraformMode) {
        const tf = terraformSet.has(i);
        sel = i === selected;
        dim = !tf && !sel;
        hexEls[i].classList.remove('stn-match', 'route', 'route-start', 'route-dest', 'route-danger', 'khaak-safe', 'khaak-hive', 'khaak-near');
        hexEls[i].classList.toggle('terra', tf);
        nodeEls[i].classList.remove('route-start', 'route-dest');
      } else {
        const sfActive = stationFilter.size > 0;
        const hasStn = sfActive && (STN_DATA[s.name] || []).some(c => stationFilter.has(c));
        const inFaction = !factionFilter || s.f === factionFilter;
        sel = i === selected; adj = !!(nb && nb.has(i));
        if (sfActive) dim = !hasStn && !sel;
        else dim = (factionFilter && !inFaction) || (selected != null && !sel && !adj && !factionFilter);
        hexEls[i].classList.toggle('stn-match', !!hasStn);
        hexEls[i].classList.remove('route', 'route-start', 'route-dest', 'route-danger', 'khaak-safe', 'khaak-hive', 'khaak-near', 'terra');
        nodeEls[i].classList.remove('route-start', 'route-dest');
      }
      hexEls[i].classList.toggle('dim', dim);
      hexEls[i].classList.toggle('sel', sel);
      hexEls[i].classList.toggle('adj', adj);
      nodeEls[i].classList.toggle('dim', dim);
      nodeEls[i].classList.toggle('sel', sel);
      nodeEls[i].classList.toggle('adj', adj);
      labelEls[i].classList.toggle('dim', dim);
    });
    edgeEls.forEach(ln => {
      const a = +ln.dataset.a, b = +ln.dataset.b;
      if (rset) {
        const key = Math.min(a, b) + '-' + Math.max(a, b);
        const on = redges.has(key);
        ln.classList.toggle('route', on);
        ln.classList.toggle('hot', false);
        ln.classList.toggle('dim', !on);
        ln.style.animationDirection = '';
        if (!ln._hw) {
          if (on) {
            // draw the line from->to so the dash march always flows start -> destination
            const from = redges.get(key), to = from === a ? b : a;
            const fp = ln._gp[from], tp = ln._gp[to];
            ln.setAttribute('x1', fp[0].toFixed(1)); ln.setAttribute('y1', fp[1].toFixed(1));
            ln.setAttribute('x2', tp[0].toFixed(1)); ln.setAttribute('y2', tp[1].toFixed(1));
          } else {
            const pa = ln._gp[a], pb = ln._gp[b];
            ln.setAttribute('x1', pa[0].toFixed(1)); ln.setAttribute('y1', pa[1].toFixed(1));
            ln.setAttribute('x2', pb[0].toFixed(1)); ln.setAttribute('y2', pb[1].toFixed(1));
          }
        }
      } else {
        ln.classList.remove('route');
        ln.style.animationDirection = '';
        if (!ln._hw) {
          const pa = ln._gp[a], pb = ln._gp[b];
          ln.setAttribute('x1', pa[0].toFixed(1)); ln.setAttribute('y1', pa[1].toFixed(1));
          ln.setAttribute('x2', pb[0].toFixed(1)); ln.setAttribute('y2', pb[1].toFixed(1));
        }
        const hot = selected != null && (a === selected || b === selected);
        ln.classList.toggle('hot', hot);
        const dim = (selected != null && !hot) || (factionFilter && !(sectors[a].f === factionFilter && sectors[b].f === factionFilter)) || stationFilter.size > 0;
        ln.classList.toggle('dim', dim);
      }
    });
    // intra-sector route bridges: connect each intermediate sector's entry gate to its exit gate
    routeBridges.forEach(l => l.remove()); routeBridges = [];
    if (routePath && routePath.length > 2) {
      for (let i = 1; i < routePath.length - 1; i++) {
        const prev = routePath[i - 1], cur = routePath[i], next = routePath[i + 1];
        const e1 = edgeByKey[Math.min(prev, cur) + '_' + Math.max(prev, cur)];
        const e2 = edgeByKey[Math.min(cur, next) + '_' + Math.max(cur, next)];
        if (!e1 || !e2) continue;
        const entry = e1._gp[cur], exit = e2._gp[cur];
        const bl = document.createElementNS(SVGNS, 'line');
        bl.setAttribute('x1', entry[0].toFixed(1)); bl.setAttribute('y1', entry[1].toFixed(1));
        bl.setAttribute('x2', exit[0].toFixed(1)); bl.setAttribute('y2', exit[1].toFixed(1));
        bl.setAttribute('class', 'edge route');
        gEdges.appendChild(bl); routeBridges.push(bl);
      }
    }
    // final leg: if the destination sector has a derelict, run the route from its entry gate to the wreck
    if (routePath && routePath.length >= 2) {
      const dest = routePath[routePath.length - 1], prev = routePath[routePath.length - 2];
      const eLast = edgeByKey[Math.min(prev, dest) + '_' + Math.max(prev, dest)];
      const d = (derelictBySector[dest] || [])[0];
      if (eLast && d && d.off) {
        const entry = eLast._gp[dest], sd = sectors[dest];
        const bl = document.createElementNS(SVGNS, 'line');
        bl.setAttribute('x1', entry[0].toFixed(1)); bl.setAttribute('y1', entry[1].toFixed(1));
        bl.setAttribute('x2', (sd.lx + d.off[0] * K).toFixed(1)); bl.setAttribute('y2', (sd.ly + d.off[1] * K).toFixed(1));
        bl.setAttribute('class', 'edge route');
        gEdges.appendChild(bl); routeBridges.push(bl);
      }
    }
    updateLabelVisibility();
  }

  // ---- ship-image lightbox (click a dossier thumbnail to see the full picture) ----
  const lightbox = document.getElementById('imgLightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('img') : null;
  const lightboxCap = lightbox ? lightbox.querySelector('.lb-cap') : null;
  function openLightbox(src, cap) {
    if (!lightbox) return;
    lightboxImg.src = src;
    lightboxImg.alt = cap || '';
    lightboxCap.textContent = cap || '';
    lightbox.classList.add('open');
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightboxImg.removeAttribute('src');
  }
  if (lightbox) {
    lightbox.addEventListener('click', e => { if (e.target === lightbox || e.target.closest('.lb-close')) closeLightbox(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox(); });
  }

  // ---- detail panel ----
  const panel = document.getElementById('mapPanel');
  function selectSector(id, center = true) {
    if (routeDest != null && id !== routeDest) resetRouteState();
    selected = id;
    renderPanel();
    panel.classList.add('open');
    refreshEmphasis();
    if (center) flyTo(id, false);
  }

  function buildRouteBox(id) {
    if (routeDest === id && routePath) {
      const jumps = routePath.length - 1;
      const xen = routePath.filter((p, i) => sectors[p].f === 'XEN' && i !== 0).length;
      const steps = routePath.map((p, i) => {
        const sc = sectors[p];
        const isXen = sc.f === 'XEN' && i !== 0;
        let tag = '';
        if (i > 0) {
          const nbm = neighbours[routePath[i - 1]].find(n => n.id === p);
          tag = nbm && nbm.type === 'hw' ? '<span class="pnl-hw">SH</span>' : '<span class="pnl-gt">GATE</span>';
        }
        const role = i === 0 ? 'start' : (i === routePath.length - 1 ? 'dest' : '');
        return `<li class="rstep ${role}${isXen ? ' xen' : ''}" data-fly="${p}">
          <span class="rstep-n">${i === 0 ? '◉' : i}</span>
          <span class="rstep-name">${esc(sc.name)}</span>
          ${isXen ? '<span class="rstep-x">⚠ Xenon</span>' : tag}</li>`;
      }).join('');
      return `
        <div class="pnl-route">
          <div class="pnl-route-h"><span>&#8627; Route</span><span class="pnl-route-jumps">${jumps} jump${jumps === 1 ? '' : 's'}</span></div>
          <div class="pnl-route-sub">From <b>${esc(sectors[routeStart].name)}</b>${xen ? ` &middot; <span class="rx">&#9888; crosses ${xen} Xenon sector${xen === 1 ? '' : 's'}</span>` : ''}</div>
          <ol class="pnl-route-steps">${steps}</ol>
          <div class="pnl-route-actions">
            <button class="pnl-route-btn" data-route-start>Change start</button>
            <button class="pnl-route-btn ghost" data-route-clear>Clear</button>
          </div>
        </div>`;
    }
    if (routeDest === id && routeStart != null && !routePath) {
      return `<div class="pnl-route">
        <div class="pnl-route-sub rx">&#9888; No gate route found from ${esc(sectors[routeStart].name)}.</div>
        <div class="pnl-route-actions"><button class="pnl-route-btn" data-route-start>Try another start</button><button class="pnl-route-btn ghost" data-route-clear>Clear</button></div>
      </div>`;
    }
    if (routeDest === id && routeMode) {
      return `<div class="pnl-route picking">
        <div class="pnl-route-sub">&#9678; Click your <b>start system</b> on the map&hellip;</div>
        <div class="pnl-route-actions"><button class="pnl-route-btn ghost" data-route-cancel>Cancel</button></div>
      </div>`;
    }
    return `<div class="pnl-route"><button class="pnl-route-btn full" data-route-start>&#9656; Plan a route here</button></div>`;
  }

  function renderPanel() {
    const id = selected;
    const s = sectors[id];
    const f = fac[s.f] || fac.UNO;
    const conns = neighbours[id]
      .map(n => ({ name: sectors[n.id].name, id: n.id, type: n.type, f: sectors[n.id].f }))
      .sort((a, b) => a.name.localeCompare(b.name));
    const ships = derelictBySector[id] || [];
    const tlShips = timelineBySector[id] || [];
    const stnCodes = (window.X4_STATIONS || {})[s.name] || [];
    const stationsHtml = stnCodes.length ? `
      <div class="pnl-conn-h">Stations <span class="pnl-h2">// always spawn here</span></div>
      <div class="pnl-stations">
        ${stnCodes.map(code => { const t = (window.X4_STATION_TYPES || {})[code] || { name: code, sub: '', color: '#8aa' }; return `
          <div class="pnl-stn"><span class="pnl-stn-ico" style="color:${t.color}"><svg viewBox="0 0 16 14">${STN_BADGE}${STN_GLYPH[code] || ''}</svg></span><span class="pnl-stn-n">${esc(t.name)}</span><span class="pnl-stn-s">${esc(t.sub)}</span></div>`; }).join('')}
      </div>` : '';
    const shipsHtml = ships.length ? `
      <div class="pnl-ships-h">◆ Derelict ships here · ${ships.length}</div>
      <div class="pnl-ships">
        ${ships.map(d => `
          <div class="pnl-ship${d.danger ? ' danger' : ''}${isFound(d.slug) ? ' found' : ''}">
            <img class="pnl-ship-img" src="../assets/x4/${d.slug}-ship.jpg" alt="${esc(d.name)}" loading="lazy" />
            <div class="pnl-ship-body">
              <div class="pnl-ship-top"><span class="si-cls cls-${d.cls}${d.danger ? ' danger' : ''}">${d.cls}</span><span class="pnl-ship-name">${esc(d.name)}</span></div>
              <div class="pnl-ship-role">${esc(d.role)}${d.coords ? ' · <span class="mono">' + esc(d.coords) + '</span>' : ''}</div>
              <div class="pnl-ship-find">${esc(d.find)}</div>
              ${d.danger ? `<div class="pnl-ship-warn">⚠ ${esc(d.dangerNote || '')}</div>` : ''}
              <a class="pnl-ship-link" href="x4-derelict-ships.html#ship-${d.slug}">Open full guide &rarr;</a>
              <button class="pnl-found${isFound(d.slug) ? ' on' : ''}" data-found="${d.slug}">${isFound(d.slug) ? '✓ Found' : 'Mark as found'}</button>
            </div>
          </div>`).join('')}
      </div>` : '';
    const tlHtml = tlShips.length ? `
      <div class="pnl-tl-h">✦ Derelict timeline ships here · ${tlShips.length}</div>
      <div class="pnl-tl-note">⏳ Appears in-game only after the matching Timeline mission is completed.</div>
      <div class="pnl-tl">
        ${tlShips.map(d => `
          <div class="pnl-tl-ship${d.danger ? ' danger' : ''}${isFoundTl(d.slug) ? ' found' : ''}">
            <img class="pnl-ship-img" src="../assets/x4/${d.slug}-ship.jpg" alt="${esc(d.name)}" loading="lazy" />
            <div class="pnl-ship-body">
              <div class="pnl-tl-top">${d.tl ? `<span class="pnl-tl-num">${esc(d.tl)}</span>` : ''}<span class="si-cls cls-${d.cls}${d.danger ? ' danger' : ''}">${d.cls}</span><span class="pnl-tl-name">${esc(d.name)}</span></div>
              ${(d.role || d.coords) ? `<div class="pnl-tl-role">${esc(d.role || '')}${(d.role && d.coords) ? ' · ' : ''}${d.coords ? '<span class="mono">' + esc(d.coords) + '</span>' : ''}</div>` : ''}
              ${d.req ? `<div class="pnl-tl-req"><b>Unlock:</b> ${esc(d.req)}</div>` : ''}
              ${d.find ? `<div class="pnl-tl-find">${esc(d.find)}</div>` : ''}
              ${d.claim ? `<div class="pnl-tl-find">${esc(d.claim)}</div>` : ''}
              ${d.danger ? `<div class="pnl-ship-warn">⚠ ${esc(d.dangerNote || '')}</div>` : ''}
              <a class="pnl-ship-link" style="color:#c4a5f7" href="x4-derelict-ships.html#ship-${d.slug}">Open full guide &rarr;</a>
              <button class="pnl-found${isFoundTl(d.slug) ? ' on' : ''}" data-found-tl="${d.slug}">${isFoundTl(d.slug) ? '✓ Found' : 'Mark as found'}</button>
            </div>
          </div>`).join('')}
      </div>` : '';
    panel.innerHTML = `
      <button class="pnl-close" aria-label="Close" data-close>&times;</button>
      <div class="pnl-kicker">Sector // #${String(id).padStart(3,'0')}</div>
      <h3 class="pnl-name">${esc(s.name)}</h3>
      <div class="pnl-fac"><span class="pnl-dot" style="background:${f.color}"></span>${esc(f.name)}</div>
      <div class="pnl-meta">
        <div><span class="pnl-lbl">Owner</span><span>${esc(f.short)}</span></div>
        <div><span class="pnl-lbl">Gate links</span><span>${conns.length}</span></div>
      </div>
      <div class="pnl-rsc-h">Minable resources</div>
      ${(() => { const rows = resourceRows(id); return rows ? `<div class="pnl-rsc">${rows}</div>` : '<div class="rsc-none">None in this sector</div>'; })()}
      ${stationsHtml}
      ${shipsHtml}
      ${tlHtml}
      ${buildRouteBox(id)}
      <div class="pnl-conn-h">Connections</div>
      <ul class="pnl-conn">
        ${conns.map(c => `<li data-go="${c.id}"><span class="pnl-dot sm" style="background:${facColor(c.f)}"></span><span class="pnl-cn">${esc(c.name)}</span>${c.type==='hw'?'<span class="pnl-hw">SH</span>':'<span class="pnl-gt">GATE</span>'}</li>`).join('')}
      </ul>`;
    panel.querySelector('[data-close]').onclick = clearSelection;
    panel.querySelectorAll('[data-go]').forEach(li => li.onclick = () => { const t = +li.dataset.go; selectSector(t); flyTo(t); });
    panel.querySelectorAll('[data-fly]').forEach(li => li.onclick = () => flyTo(+li.dataset.fly));
    panel.querySelectorAll('.pnl-ship-img').forEach(im => im.onclick = (e) => { e.stopPropagation(); openLightbox(im.src, im.alt); });
    panel.querySelectorAll('[data-found]').forEach(b => b.onclick = (e) => { e.stopPropagation(); toggleFound(b.dataset.found); });
    panel.querySelectorAll('[data-found-tl]').forEach(b => b.onclick = (e) => { e.stopPropagation(); toggleFoundTl(b.dataset.foundTl); });
    const rs = panel.querySelector('[data-route-start]'); if (rs) rs.onclick = () => beginRoute(id);
    const rc = panel.querySelector('[data-route-cancel]'); if (rc) rc.onclick = cancelRoute;
    const rcl = panel.querySelector('[data-route-clear]'); if (rcl) rcl.onclick = clearRoute;
  }

  // ---- routing ----
  function findPath(start, dest) {
    if (start === dest) return [start];
    const prev = new Array(sectors.length).fill(-1);
    const seen = new Array(sectors.length).fill(false);
    const q = [start]; seen[start] = true;
    while (q.length) {
      const u = q.shift();
      if (u === dest) break;
      for (const n of neighbours[u]) if (!seen[n.id]) { seen[n.id] = true; prev[n.id] = u; q.push(n.id); }
    }
    if (!seen[dest]) return null;
    const path = []; let c = dest; while (c !== -1) { path.unshift(c); c = prev[c]; }
    return path;
  }
  function resetRouteState() { routeMode = false; routeStart = null; routeDest = null; routePath = null; root.classList.remove('route-picking'); }
  function activateSector(id) { if (routeMode) setRouteStart(id); else selectSector(id, centerOnClick); }
  function beginRoute(id) { routeMode = true; routeDest = id; routeStart = null; routePath = null; root.classList.add('route-picking'); renderPanel(); }
  function cancelRoute() { routeMode = false; root.classList.remove('route-picking'); renderPanel(); }
  function clearRoute() { resetRouteState(); renderPanel(); refreshEmphasis(); }
  function setRouteStart(id) {
    if (!routeMode) return;
    routeStart = id; routeMode = false; root.classList.remove('route-picking');
    routePath = findPath(id, routeDest);
    renderPanel(); refreshEmphasis();
    if (routePath && routePath.length > 1) fitBounds(routePath);
  }
  // plot a route between any two sectors by id (used by the toolbar planner + deep links)
  function planRoute(startId, destId) {
    if (startId == null || destId == null || startId === destId) return null;
    routeMode = false; root.classList.remove('route-picking');
    routeStart = startId; routeDest = destId;
    routePath = findPath(startId, destId);
    selected = destId;
    renderPanel(); panel.classList.add('open'); refreshEmphasis();
    if (routePath && routePath.length > 1) fitBounds(routePath); else flyTo(destId, false);
    return routePath;
  }
  function fitBounds(ids) {
    const lxs = ids.map(i => sectors[i].lx), lys = ids.map(i => sectors[i].ly);
    const minX = Math.min(...lxs), maxX = Math.max(...lxs), minY = Math.min(...lys), maxY = Math.max(...lys);
    const w = Math.max(maxX - minX, 160), h = Math.max(maxY - minY, 160);
    let sc = Math.min(vw / w, vh / h) * (1 - 0.24);
    sc = Math.max(0.32, Math.min(1.1, sc));
    scale = sc;
    tx = vw / 2 - ((minX + maxX) / 2) * scale;
    ty = vh / 2 - ((minY + maxY) / 2) * scale;
    if (vw > 900) tx -= 150;
    apply();
  }

  function clearSelection() {
    selected = null; resetRouteState(); panel.classList.remove('open'); refreshEmphasis();
  }
  function flyTo(id, zoom = true, zoomLevel) {
    const s = sectors[id];
    const target = zoomLevel != null ? zoomLevel : (zoom ? Math.max(scale, 1.4) : scale);
    scale = target;
    tx = vw / 2 - s.lx * scale;
    ty = vh / 2 - s.ly * scale;
    // nudge left to make room for panel on wide screens
    if (vw > 900) tx -= 150;
    apply();
  }

  function esc(t) { return String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  // background click clears
  svg.addEventListener('click', e => { if (e.target === svg && !moved) { if (routeMode) cancelRoute(); else clearSelection(); } });

  // ---- style switch ----
  let style = 'hex';
  function setStyle(name) {
    style = name;
    root.dataset.style = name;
    document.querySelectorAll('[data-style-btn]').forEach(b => b.classList.toggle('active', b.dataset.styleBtn === name));
  }

  // ---- faction legend ----
  function buildLegend() {
    const counts = {};
    sectors.forEach(s => counts[s.f] = (counts[s.f] || 0) + 1);
    const order = Object.keys(fac).filter(c => counts[c]);
    const host = document.getElementById('mapLegend');
    host.innerHTML = order.map(c => `
      <button class="leg" data-fac="${c}">
        <span class="leg-dot" style="background:${fac[c].color}"></span>
        <span class="leg-name">${esc(fac[c].short)}</span>
      </button>`).join('');
    host.querySelectorAll('.leg').forEach(b => b.onclick = () => {
      const c = b.dataset.fac;
      if (khaakMode) setKhaak(false); if (terraformMode) setTerraform(false);
      factionFilter = factionFilter === c ? null : c;
      if (factionFilter) { stationFilter.clear(); stationFilterUpdate(); }
      host.querySelectorAll('.leg').forEach(x => x.classList.toggle('active', x.dataset.fac === factionFilter));
      refreshEmphasis();
    });
  }

  // ---- station finder (filter sectors by fixed-station type) ----
  function buildStationFinder() {
    const host = document.getElementById('stationFinder');
    if (!host) return;
    const counts = {};
    Object.values(STN_DATA).forEach(arr => arr.forEach(c => counts[c] = (counts[c] || 0) + 1));
    const order = ['SY', 'WH', 'EQ', 'TR', 'HQ', 'PB'].filter(c => STN_TYPES[c]);
    host.innerHTML = `<div class="sf-h"><span>Find a station</span><span class="sf-clear" data-clear>Clear</span></div>
      <div class="sf-chips">${order.map(c => { const t = STN_TYPES[c]; const lbl = t.name.replace(' Station', '').replace(' Dock', ''); return `
        <button class="sf-chip" data-stn="${c}" style="--sc:${t.color}" title="${esc(t.name)}, ${counts[c] || 0} sectors">
          <span class="sf-ico"><svg viewBox="0 0 16 14">${STN_BADGE}${STN_GLYPH[c] || ''}</svg></span>
          <span class="sf-lbl">${esc(lbl)}</span>
        </button>`; }).join('')}</div>
      <div class="sf-count"></div>`;
    const countEl = host.querySelector('.sf-count');
    const clearEl = host.querySelector('[data-clear]');
    function update() {
      host.querySelectorAll('.sf-chip').forEach(b => b.classList.toggle('active', stationFilter.has(b.dataset.stn)));
      clearEl.classList.toggle('show', stationFilter.size > 0);
      if (stationFilter.size) {
        const n = sectors.filter(s => (STN_DATA[s.name] || []).some(c => stationFilter.has(c))).length;
        const names = [...stationFilter].map(c => STN_TYPES[c].name).join(' / ');
        countEl.textContent = `${n} system${n === 1 ? '' : 's'} · ${names}`;
      } else countEl.textContent = '';
      refreshEmphasis();
    }
    stationFilterUpdate = update;
    host.querySelectorAll('.sf-chip').forEach(b => b.onclick = () => {
      const c = b.dataset.stn;
      if (khaakMode) setKhaak(false); if (terraformMode) setTerraform(false);
      if (stationFilter.has(c)) stationFilter.delete(c); else stationFilter.add(c);
      if (stationFilter.size) { factionFilter = null; document.querySelectorAll('.leg').forEach(x => x.classList.remove('active')); }
      update();
      if (stationFilter.size) fit();
    });
    clearEl.onclick = () => { stationFilter.clear(); update(); };
  }

  // ---- controls ----
  document.getElementById('zoomIn').onclick = () => zoomAt(vw / 2, vh / 2, 1.3);
  document.getElementById('zoomOut').onclick = () => zoomAt(vw / 2, vh / 2, 1 / 1.3);
  document.getElementById('zoomFit').onclick = () => { if (khaakMode) setKhaak(false); if (terraformMode) setTerraform(false); clearSelection(); factionFilter = null; stationFilter.clear(); stationFilterUpdate(); document.querySelectorAll('.leg').forEach(x => x.classList.remove('active')); refreshEmphasis(); fit(); };
  document.querySelectorAll('[data-style-btn]').forEach(b => b.onclick = () => setStyle(b.dataset.styleBtn));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && routeMode) cancelRoute(); });

  // hover-info tooltip follows the pointer (always on; touch auto-disables it)
  svg.addEventListener('pointermove', e => {
    const r = root.getBoundingClientRect();
    lastPx = e.clientX - r.left; lastPy = e.clientY - r.top;
    if (hovered != null) positionHoverInfo();
  });
  const optCenter = document.getElementById('optCenter');
  if (optCenter) { optCenter.checked = centerOnClick; optCenter.onchange = () => { centerOnClick = optCenter.checked; }; }

  // search
  const search = document.getElementById('mapSearch');
  const results = document.getElementById('searchResults');
  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      if (!q) { results.classList.remove('show'); return; }
      const hits = sectors.map((s, i) => ({ s, i })).filter(o => o.s.name.toLowerCase().includes(q)).slice(0, 8);
      results.innerHTML = hits.map(o => `<li data-go="${o.i}"><span class="pnl-dot sm" style="background:${facColor(o.s.f)}"></span>${esc(o.s.name)}</li>`).join('') || '<li class="no">No match</li>';
      results.classList.add('show');
      results.querySelectorAll('[data-go]').forEach(li => li.onclick = () => { const id = +li.dataset.go; selectSector(id); flyTo(id); results.classList.remove('show'); search.value = sectors[id].name; });
    });
    search.addEventListener('blur', () => setTimeout(() => results.classList.remove('show'), 180));
  }

  // route planner (toolbar: pick a start + destination by name, route through ALL sectors)
  (function routePlannerUI() {
    const btn = document.getElementById('routePlanBtn');
    const box = document.getElementById('routePlanner');
    if (!btn || !box) return;
    const fromIn = document.getElementById('rpFrom'), toIn = document.getElementById('rpTo');
    const fromRes = document.getElementById('rpFromResults'), toRes = document.getElementById('rpToResults');
    const msg = document.getElementById('rpMsg');
    let fromId = null, toId = null;
    function setMsg(t, cls) { msg.textContent = t || ''; msg.className = 'rp-msg' + (cls ? ' ' + cls : ''); }
    function openBox(on) {
      box.classList.toggle('show', on);
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) fromIn.focus();
    }
    btn.onclick = () => openBox(!box.classList.contains('show'));
    function bindPicker(input, resEl, setId) {
      input.addEventListener('input', () => {
        setId(null);
        const q = input.value.trim().toLowerCase();
        if (!q) { resEl.classList.remove('show'); return; }
        const hits = sectors.map((s, i) => ({ s, i })).filter(o => o.s.name.toLowerCase().includes(q)).slice(0, 8);
        resEl.innerHTML = hits.map(o => `<li data-id="${o.i}"><span class="pnl-dot sm" style="background:${facColor(o.s.f)}"></span>${esc(o.s.name)}</li>`).join('') || '<li class="no">No match</li>';
        resEl.classList.add('show');
        resEl.querySelectorAll('[data-id]').forEach(li => li.onclick = () => { const id = +li.dataset.id; setId(id); input.value = sectors[id].name; resEl.classList.remove('show'); });
      });
      input.addEventListener('blur', () => setTimeout(() => resEl.classList.remove('show'), 180));
    }
    bindPicker(fromIn, fromRes, id => { fromId = id; });
    bindPicker(toIn, toRes, id => { toId = id; });
    document.getElementById('rpGo').onclick = () => {
      if (fromId == null || toId == null) return setMsg('Pick both a start and a destination.', 'warn');
      if (fromId === toId) return setMsg('Start and destination are the same sector.', 'warn');
      const path = planRoute(fromId, toId);
      if (!path) setMsg('No gate route exists between these two sectors.', 'warn');
      else { const j = path.length - 1; setMsg(j + ' jump' + (j === 1 ? '' : 's') + ' · route plotted.', 'ok'); }
    };
    document.getElementById('rpClear').onclick = () => {
      fromId = null; toId = null; fromIn.value = ''; toIn.value = ''; setMsg('');
      clearRoute();
    };
  })();

  // ---- init ----
  setStyle('hex');
  buildLegend();
  buildStationFinder();
  function syncFinderWidth() {
    const t = document.querySelector('.mt-title'), f = document.getElementById('stationFinder');
    if (t && f) f.style.width = Math.round(t.getBoundingClientRect().width) + 'px';
  }
  syncFinderWidth();
  window.addEventListener('resize', () => { measure(); apply(); syncFinderWidth(); });
  function init() { measure(); if (selected == null) fit(); else apply(); refreshEmphasis(); root.classList.add('ready'); }
  init();                                   // DOM is ready (script at end of body)
  requestAnimationFrame(() => { init(); syncFinderWidth(); }); // re-fit & align once layout settles
  window.addEventListener('load', () => { measure(); if (selected == null) fit(); else apply(); syncFinderWidth(); });

  // deep link: ?ship=<slug>  or  ?sector=<Name>
  (function deepLink() {
    const p = new URLSearchParams(location.search);
    const sh = p.get('ship'), se = p.get('sector'), tl = p.get('tlship');
    const rf = p.get('from'), rt = p.get('to');
    const byName = n => sectors.findIndex(s => s.name.toLowerCase() === String(n).toLowerCase());
    if (rf && rt) { const a = byName(rf), b = byName(rt); if (a >= 0 && b >= 0) planRoute(a, b); }
    else if (sh && bySlug[sh]) { setLens(true); const id = bySlug[sh].sectorId; selectSector(id); flyTo(id, true); }
    else if (tl && bySlugTl[tl]) { setTimelineLens(true); const d = bySlugTl[tl]; selectSector(d.sectorId, false); flyTo(d.sectorId, true, d.zoom); }
    else if (se) { const id = byName(se); if (id >= 0) { selectSector(id); flyTo(id, true); } }
  })();

  // deep link handled in init section above

  // expose minimal api
  window.X4Map = {
    selectSector, fit, setStyle, setLens, setKhaak, setTerraform, planRoute,
    route: (fromName, toName) => {
      const a = sectors.findIndex(s => s.name.toLowerCase() === String(fromName).toLowerCase());
      const b = sectors.findIndex(s => s.name.toLowerCase() === String(toName).toLowerCase());
      return (a >= 0 && b >= 0) ? planRoute(a, b) : null;
    },
  };
})();
