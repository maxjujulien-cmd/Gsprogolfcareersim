// Banc d'essai : fait tourner le moteur du jeu (page construite) et mesure coupures, niveaux, victoires, montées.
// Usage : npm run build, puis
//   node tools/mesure/mesurer.cjs dist/IndoorGolfCareer.html [mondes=3] [saisons=30] [réglages JSON, ex. {"gap":1.1}] > mesure.json
//   node tools/mesure/analyser.cjs mesure.json
// Chaque monde joue d'abord les 20 saisons cachées du jeu (non mesurées), puis les saisons demandées.
const { chromium } = require('playwright');
const path = require('path');
const PAGE = process.argv[2], WORLDS = +(process.argv[3] || 3), SEASONS = +(process.argv[4] || 30), CFGJSON = process.argv[5] || '{}';
(async () => {
  const b = await chromium.launch();
  const out = [];
  for (let w = 0; w < WORLDS; w++) {
    const p = await b.newPage();
    p.on('pageerror', e => console.error('pageerror', e.message));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto('file://' + path.resolve(PAGE), { waitUntil: 'load', timeout: 120000 });
    await p.waitForFunction(() => typeof newGame === 'function' && document.querySelector('#app')?.children.length > 0, null, { timeout: 60000 });
    const res = await p.evaluate(([SEASONS, cfgx]) => {
      const R = { t: [], prom: [], fields: [] };
      let rec = false, startL = null, prevStartL = null, promoted = {};
      const orig = simTournamentAI;
      simTournamentAI = function (model, grid, pars, ids, G, ctx, cutSize, index, one) {
        const r = orig.apply(this, arguments);
        if (rec) {
          const l = S.L.findIndex(L => L === ids); const lg = l >= 0 ? l : S.L.findIndex(L => L.length === ids.length && L[0] === ids[0]);
          const c = S.courses[S.t] || {};
          const r1 = {}; r.rows.forEach(x => { r1[x[0]] = x[2]; });
          const os = ids.map(id => G[id].o).sort((a, b) => b - a);
          const atCut = ids.filter(id => r1[id] === r.cut).map(id => G[id].o);
          const winner = r.rows[0][0], wo = G[winner].o, wrank = os.indexOf(wo) + 1;
          let pm = 0, pn = 0; ids.forEach(id => { if (promoted[id] === lg) { pn++; if (r1[id] <= r.cut) pm++; } });
          R.t.push({ l: lg, n: ids.length, cut: r.cut, wind: c.wind || 'none', mean: ids.reduce((a, id) => a + r1[id], 0) / ids.length,
            oCut: atCut.reduce((a, x) => a + x, 0) / atCut.length, o65: os[Math.min(64, os.length - 1)], oMed: os[Math.floor(os.length / 2)], oMin: os[os.length - 1], oMax: os[0], wrank, pm, pn });
        }
        return r;
      };
      const origSeason = presimSeason;
      let seasonNo = 0;
      presimSeason = function () {
        if (rec) {
          const cur = {}; S.L.forEach((L, l) => L.forEach(id => { cur[id] = l; }));
          promoted = {};
          if (startL) Object.keys(cur).forEach(id => { if (startL[id] != null && cur[id] === startL[id] - 1) promoted[id] = cur[id]; });
          if (prevStartL && startL) Object.keys(startL).forEach(id => { if (prevStartL[id] != null && startL[id] === prevStartL[id] - 1) R.prom.push({ to: startL[id], stay: cur[id] != null && cur[id] <= startL[id] ? 1 : 0, gone: cur[id] == null ? 1 : 0 }); });
          prevStartL = startL; startL = cur;
          R.fields.push(S.L.map(L => { const os = L.map(id => S.G[id].o).sort((a, b) => a - b); const q = f => os[Math.floor(f * (os.length - 1))]; return { n: L.length, p10: q(0.1), p50: q(0.5), p90: q(0.9) }; }));
        }
        return origSeason.apply(this, arguments);
      };
      newGame('Banc', 4, 'manual', 2000, SEASONS, false, true);
      Object.assign(S.cfg || (S.cfg = {}), cfgx); setCfg(S.cfg);
      const P = S.presim;
      while (P.left > 0) {
        presimSeason(); P.left--;
        if (P.w && P.n - P.left >= P.w) { worldReset(P.w); P.n -= P.w; P.w = 0; rec = true; }
      }
      return R;
    }, [SEASONS, JSON.parse(CFGJSON)]);
    out.push(res); await p.close();
    console.error('monde', w + 1, 'fini');
  }
  await b.close();
  process.stdout.write(JSON.stringify(out));
})();
