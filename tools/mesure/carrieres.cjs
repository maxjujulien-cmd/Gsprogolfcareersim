// Variété des carrières : node tools/mesure/carrieres.cjs nom1=fichier1.json nom2=fichier2.json ...
// Utilise les instantanés de début de saison (id, ligue 0-3, niveau, âge, profil de départ) du banc de mesure.
const fs = require('fs');
const m = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN, pct = (a, b) => b ? Math.round(100 * a / b) + ' %' : '-';
const q = (a, f) => { a = a.slice().sort((x, y) => x - y); return a[Math.floor(f * (a.length - 1))]; };
const out = [];
for (const arg of process.argv.slice(2)) {
  const [nom, f] = arg.split('='), W = JSON.parse(fs.readFileSync(f));
  const r = { nom, arr: [0, 0, 0, 0], n: 0, plat: [0, 0], late: 0, jumps: 0, seasons: 0, arrS: 0, peakA: [], reachL1: 0, reachL2: 0, longN: 0, pats: {}, pathsN: 0, profL: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], profTop: [[0, 0], [0, 0], [0, 0]] };
  for (const w of W) {
    const S = w.snap.map(sn => { const o = {}; sn.forEach(x => { o[x[0]] = x; }); return o; }), H = {};
    S.forEach((sn, s) => Object.values(sn).forEach(x => { (H[x[0]] = H[x[0]] || []).push([s, x[1], x[2], x[3], x[4]]); }));
    r.seasons += S.length - 2; r.arrS += S.length - 1;
    for (let s = 2; s < S.length; s++) for (const id in S[s]) { const a = S[s - 2][id]; if (a && S[s][id][2] - a[2] > 150) r.jumps++; }
    for (const id in H) {
      const h = H[id], arrived = h[0][0] > 0, done = h[h.length - 1][0] < S.length - 1;
      if (arrived) { r.n++; r.arr[h[0][1]]++; if (h[0][4] >= 0) r.profL[h[0][4]][h[0][1]]++; }
      // éclosion tardive : en L4 à 25 ans ou plus, puis en L1 plus tard
      const i4 = h.findIndex(x => x[1] === 3 && x[3] >= 25); if (i4 >= 0 && h.slice(i4).some(x => x[1] === 0)) r.late++;
      if (arrived && h.length >= 8) {
        r.longN++;
        const best = Math.min(...h.map(x => x[1])); if (best === 0) r.reachL1++; if (best <= 1) r.reachL2++;
        if (h[0][4] >= 0) { r.profTop[h[0][4]][1]++; if (best === 0) r.profTop[h[0][4]][0]++; }
        if (h[0][1] <= 2) { r.plat[1]++; if (best === h[0][1]) r.plat[0]++; }
        let pk = h[0]; h.forEach(x => { if (x[2] > pk[2]) pk = x; }); if (done) r.peakA.push(pk[3]);
        const path = h.map(x => 'L' + (x[1] + 1)).filter((x, i, a) => i === 0 || x !== a[i - 1]).join('→'); r.pats[path] = (r.pats[path] || 0) + 1; r.pathsN++;
      }
    }
  }
  out.push(r);
}
const ps = out[0] ? Object.keys(out[0]) : [];
const row = (lbl, f) => console.log('| ' + lbl + ' | ' + out.map(f).join(' | ') + ' |');
console.log('| Mesure | ' + out.map(r => r.nom).join(' | ') + ' |\n|---|' + out.map(() => '---').join('|') + '|');
row('Recrues placées par saison (L1 / L2 / L3 / L4)', r => r.arr.map(x => (x / r.arrS).toFixed(1)).join(' / '));
row('Recrues suivies au moins 8 saisons', r => r.longN);
row('… qui atteignent la L2 / la L1', r => pct(r.reachL2, r.longN) + ' / ' + pct(r.reachL1, r.longN));
row('Placées en L2 ou L3 qui ne montent jamais plus haut', r => pct(r.plat[0], r.plat[1]) + ' (' + r.plat[1] + ')');
row('Éclosions tardives (L4 à 25 ans ou plus → L1) par saison', r => (r.late / r.seasons).toFixed(2));
row('Bonds de plus de 150 points en 2 saisons, par saison', r => (r.jumps / r.seasons).toFixed(1));
row('Âge au sommet (carrières finies) : 10e / 50e / 90e', r => r.peakA.length ? q(r.peakA, 0.1) + ' / ' + q(r.peakA, 0.5) + ' / ' + q(r.peakA, 0.9) + ' (' + r.peakA.length + ')' : '-');
row('Chemins de carrière différents (8 saisons et plus)', r => Object.keys(r.pats).length);
row('Part du chemin le plus fréquent', r => { const e = Object.entries(r.pats).sort((a, b) => b[1] - a[1])[0]; return e ? e[0] + ' ' + pct(e[1], r.pathsN) : '-'; });
row('Recrues brutes / standard / prêtes : atteignent la L1', r => r.profTop.map(x => pct(x[0], x[1])).join(' / '));
row('Recrues prêtes : placées L2 / L3 / L4', r => r.profL[2].slice(1).join(' / '));
