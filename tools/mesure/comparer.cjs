// Compare plusieurs mesures : node tools/mesure/comparer.cjs nom1=fichier1.json nom2=fichier2.json ...
const fs = require('fs');
const m = a => a.reduce((x, y) => x + y, 0) / a.length, f1 = x => (x >= 0 ? '+' : '') + x.toFixed(1), f0 = x => String(Math.round(x));
const rows = process.argv.slice(2).map(a => { const [n, f] = a.split('='); const W = JSON.parse(fs.readFileSync(f));
  const T = W.flatMap(w => w.t).filter(x => x.l >= 0), cut = l => m(T.filter(x => x.l === l).map(x => x.cut));
  const gapW = W.map(w => { const t = w.t.filter(x => x.l >= 0); return m(t.filter(x => x.l === 3).map(x => x.cut)) - m(t.filter(x => x.l === 2).map(x => x.cut)); });
  const F = W.flatMap(w => w.fields), P = W.flatMap(w => w.prom).filter(x => x.to === 2);
  const t5 = l => { const t = T.filter(x => x.l === l); return 100 * t.filter(x => x.wrank <= 5).length / t.length; };
  const t2 = T.filter(x => x.l === 2), pn = t2.reduce((a, x) => a + x.pn, 0), pm = t2.reduce((a, x) => a + x.pm, 0);
  return [n, ...[0, 1, 2, 3].map(l => f1(cut(l))), f1(cut(1) - cut(0)), f1(cut(2) - cut(1)), f1(cut(3) - cut(2)) + ' (' + gapW.map(x => x.toFixed(1)).join('/') + ')',
    f0(m(F.map(x => x[3].p10))) + '/' + f0(m(F.map(x => x[3].p50))), f0(m(F.map(x => x[2].p50))), f0(t5(0)) + '%', f0(t5(3)) + '%', f0(100 * pm / pn) + '%', f0(100 * m(P.map(x => x.stay))) + '%']; });
const head = ['Essai', 'Cut L1', 'Cut L2', 'Cut L3', 'Cut L4', 'L1→L2', 'L2→L3', 'L3→L4 (par monde)', 'L4 10e/50e', 'L3 50e', 'Top5 L1', 'Top5 L4', 'Promus L3 coupures', 'Promus restés L3'];
console.log('| ' + head.join(' | ') + ' |\n|' + head.map(() => '---').join('|') + '|');
rows.forEach(r => console.log('| ' + r.join(' | ') + ' |'));
