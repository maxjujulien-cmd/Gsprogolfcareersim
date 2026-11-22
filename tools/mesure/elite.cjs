// Élite du circuit : node tools/mesure/elite.cjs nom1=fichier1.json ...
// Generational (950+) et Hall Of Famer (900-949) en même temps, nouveaux Generational par saison, âge au passage de 950.
const fs = require('fs'), m = a => a.reduce((x, y) => x + y, 0) / a.length, q = (a, f) => { a = a.slice().sort((x, y) => x - y); return a.length ? a[Math.floor(f * (a.length - 1))] : '-'; };
console.log('| Essai | Generational en même temps (moy. / min / max) | Hall Of Famer en même temps | Nouveaux Generational par saison | Âge au passage de 950 (10e / 50e / 90e) | Saisons sans aucun Generational |\n|---|---|---|---|---|---|');
for (const arg of process.argv.slice(2)) {
  const i = arg.lastIndexOf('='), nom = arg.slice(0, i), W = JSON.parse(fs.readFileSync(arg.slice(i + 1)));
  const g950 = [], g900 = [], ar = []; let seasons = 0;
  W.forEach(w => { const first = {}; w.snap.forEach((sn, s) => { g950.push(sn.filter(x => x[2] >= 950).length); g900.push(sn.filter(x => x[2] >= 900 && x[2] < 950).length); sn.forEach(x => { if (x[2] >= 950 && first[x[0]] == null) first[x[0]] = { s, a: x[3] }; }); }); seasons += w.snap.length - 1; Object.values(first).forEach(f => { if (f.s > 0) ar.push(f.a); }); });
  console.log(`| ${nom} | ${m(g950).toFixed(1)} / ${Math.min(...g950)} / ${Math.max(...g950)} | ${m(g900).toFixed(1)} | ${(ar.length / seasons).toFixed(2)} | ${q(ar, .1)} / ${q(ar, .5)} / ${q(ar, .9)} | ${Math.round(100 * g950.filter(x => x === 0).length / g950.length)} % |`);
}
