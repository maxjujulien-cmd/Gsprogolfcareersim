// Vedettes de la L1 : node tools/mesure/vedettes.cjs nom1=fichier1.json ...
// Par niveau : % de tournois gagnés, top 3, top 10, coupure ratée ; rang final en L1 (médiane, % dans le top 5 et le top 10).
const fs = require('fs'), q = (a, f) => { a = a.slice().sort((x, y) => x - y); return a.length ? a[Math.floor(f * (a.length - 1))] : '-'; };
const B = [[950, 1001, 'Gen 950+'], [900, 950, 'HoF 900-949'], [850, 900, 'Elite 850-899'], [800, 850, 'Elite 800-849'], [700, 800, 'Est. Pro 700-799']];
console.log('| Essai | Niveau | Départs | Victoires | Top 3 | Top 10 | Coupure ratée | Rang final médian | Top 5 saison | Top 10 saison |\n|---|---|---|---|---|---|---|---|---|---|');
for (const arg of process.argv.slice(2)) {
  const i = arg.lastIndexOf('='), nom = arg.slice(0, i), W = JSON.parse(fs.readFileSync(arg.slice(i + 1)));
  const T = W.flatMap(w => w.l1 || []).flat(), S = W.flatMap(w => w.l1s || []).flat();
  B.forEach(([lo, hi, n], k) => {
    const t = T.filter(x => x[0] >= lo && x[0] < hi), s = S.filter(x => x[0] >= lo && x[0] < hi), N = t.length || 1, pc = f => (100 * t.filter(f).length / N).toFixed(1) + ' %';
    console.log(`| ${k ? '' : nom} | ${n} | ${t.length} | ${pc(x => x[1] === 1)} | ${pc(x => x[1] >= 1 && x[1] <= 3)} | ${pc(x => x[1] >= 1 && x[1] <= 10)} | ${pc(x => x[1] === 0)} | ${q(s.map(x => x[1]), .5)} | ${s.length ? Math.round(100 * s.filter(x => x[1] <= 5).length / s.length) + ' %' : '-'} | ${s.length ? Math.round(100 * s.filter(x => x[1] <= 10).length / s.length) + ' %' : '-'} |`);
  });
}
