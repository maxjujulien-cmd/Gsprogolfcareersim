/* ======== Moyennes par type de trou (par 3, 4, 5) ========
   Compteurs de carrière [coups par 3, trous par 3, coups par 4, trous par 4, coups par 5, trous par 5], mis à jour
   après chaque tournoi à partir des cartes trou par trou : sur le golfeur (g.pa, ou S.pk.pa pour le joueur en mode
   manuel) et pour tout le circuit (S.pa). Les cartes de plus de 3 saisons étant effacées, une ancienne partie repart
   des cartes encore gardées (S.paFrom = première saison comptée). */
function paAdd(o, pars, str) {
  for (let i = 0; i < str.length; i++) { const par = pars[i % 18], v = parseInt(str.charAt(i), 36); if (!(par >= 3 && par <= 5) || !(v > 0)) continue; const k = (par - 3) * 2; o[k] += v; o[k + 1]++; }
}
function paTournament(pars, lg) {
  if (S.pav !== 1) paBackfill();
  const C = S.pa || (S.pa = [0, 0, 0, 0, 0, 0]);
  lg.forEach(x => { if (!x || !x.h) return; Object.keys(x.h).forEach(k => {
    const id = +k, g = hcHolder(id), str = x.h[k]; if (!str) return;
    paAdd(C, pars, str); if (g) paAdd(g.pa || (g.pa = [0, 0, 0, 0, 0, 0]), pars, str);
  }); });
}
function paBackfill() {
  S.pa = [0, 0, 0, 0, 0, 0]; Object.values(S.G).forEach(g => { delete g.pa; }); if (S.pk) delete S.pk.pa;
  let from = null, missing = false;
  S.hist.forEach(H => H.t.forEach(t => {
    if (!t || !t.lg) return;
    const has = t.lg.some(x => x && x.h && Object.keys(x.h).length);
    if (!has) { if (from === null) missing = true; return; }
    if (from === null) from = H.s;
    const c0 = careerStart(0); t.lg.forEach(x => { if (!x || !x.h) return; Object.keys(x.h).forEach(k => { const g = +k === 0 && H.s <= c0 ? null : hcHolder(+k), str = x.h[k]; if (!str) return; paAdd(S.pa, t.pars, str); if (g) paAdd(g.pa || (g.pa = [0, 0, 0, 0, 0, 0]), t.pars, str); }); });
  }));
  S.paFrom = missing ? from : null; S.pav = 1;
}
function paHTML(o, startS) {
  if (!o || !(o[1] + o[3] + o[5])) return '';
  const f2 = x => x.toFixed(2).replace('.', ','), C = S.pa || o;
  const tiles = [0, 1, 2].map(k => {
    const n = o[k * 2 + 1], par = k + 3;
    if (!n) return '<div class="pat"><div class="pl">PAR ' + par + '</div><div class="pv mute">\u2013</div></div>';
    const v = o[k * 2] / n, d = v - par, ci = C[k * 2 + 1] ? C[k * 2] / C[k * 2 + 1] : null;
    return '<div class="pat"><div class="pl">PAR ' + par + '</div><div class="pv">' + f2(v) + '</div><div class="pd ' + (d > 0.005 ? 'bad' : 'good') + '">' + (d >= -0.005 ? '+' : '\u2212') + Math.abs(d).toFixed(2).replace('.', ',') + '</div>' + (ci != null ? '<div class="pc">Circuit : ' + f2(ci) + '</div>' : '') + '</div>';
  }).join('');
  const holes = o[1] + o[3] + o[5], late = S.paFrom != null && startS != null && startS < S.paFrom;
  return '<h2>Moyenne par type de trou</h2><div class="pa3">' + tiles + '</div><p class="small mute" style="margin:0 0 8px">' + (late ? 'Depuis ' + yr(S.paFrom) : 'Carri\u00e8re') + ' \u00b7 ' + holes.toLocaleString(LANG === 'en' ? 'en-US' : 'fr-CA') + ' trous jou\u00e9s. Sous la moyenne : l\u2019\u00e9cart avec le par, puis la moyenne de tout le circuit.</p>';
}
