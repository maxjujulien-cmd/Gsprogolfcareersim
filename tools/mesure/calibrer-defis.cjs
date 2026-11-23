// Calibration des défis (table LVL, src/js/05-*.js) : node tools/mesure/calibrer-defis.cjs DECALAGE [1 = format une ronde] [mondes=2] > sortie.json
// Pour un décalage D (coups ajoutés aux golfeurs simulés) : index de tous les golfeurs par ligue en fin de simulation, et moyennes du gagnant, de la coupure (65e score de la ronde 1) et de la ronde moyenne.
// Utilisé le 23 novembre 2026 avec D = -6, 0, 6, 12, 20, 30 (deux rondes) et -6, 0, 12, 30 (une ronde). Repères : aspirant = 4e centile de la ligue, établi = 55e centile.
const { chromium } = require('playwright'); const path = require('path');
const D = +process.argv[2], ONE = process.argv[3] === '1', W = +(process.argv[4] || 2);
(async () => { const b = await chromium.launch(); const out = { D, one: ONE, idx: [[], [], [], []], win: [[], [], [], []], cut: [[], [], [], []], rnd: [[], [], [], []] };
  for (let w = 0; w < W; w++) { const p = await b.newPage(); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto('file://' + path.resolve('dist/IndoorGolfCareer.html'), { waitUntil: 'load' }); await p.waitForFunction(() => typeof newGame === 'function');
    const r = await p.evaluate(([D, ONE]) => { NOSAVE = true; const o = { win: [[], [], [], []], cut: [[], [], [], []], rnd: [[], [], [], []] }; let rec = false;
      const st = simTournamentAI; simTournamentAI = function (model, grid, pars, ids) { const res = st.apply(this, arguments); const l = S.L.findIndex(L => L === ids);
        if (rec && l >= 0) { const x = res.rows; o.win[l].push(x[0][2] + (x[0][3] || 0)); const r1 = x.map(y => y[2]).sort((a, b) => a - b); o.cut[l].push(r1[Math.min(64, r1.length - 1)]);
          x.forEach(y => { o.rnd[l].push(y[2]); if (y[3] != null) o.rnd[l].push(y[3]); }); } return res; };
      newGame('B', 4, 'manual', 2000, 12, ONE, true); S.cfg.lvl = D; setCfg(S.cfg); const P = S.presim;
      while (P.left > 0) { presimSeason(); P.left--; if (P.w && P.n - P.left >= P.w) { worldReset(P.w); P.n -= P.w; P.w = 0; rec = true; } }
      o.idx = S.L.map(L => L.map(id => S.G[id] && S.G[id].hc ? S.G[id].hc.x : null).filter(x => x != null));
      const m = a => a.reduce((s, v) => s + v, 0) / a.length; return { idx: o.idx, win: o.win.map(m), cut: o.cut.map(m), rnd: o.rnd.map(m) }; }, [D, ONE]);
    for (let l = 0; l < 4; l++) { out.idx[l].push(...r.idx[l]); out.win[l].push(r.win[l]); out.cut[l].push(r.cut[l]); out.rnd[l].push(r.rnd[l]); }
    await p.close(); }
  console.log(JSON.stringify(out)); await b.close(); })();
