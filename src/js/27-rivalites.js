/* ============ v263 : rivalités ============
   Une rivalité naît des moments importants entre deux golfeurs (dans la même ligue) :
   finir 1er et 2e (3 pts, +1 en prolongation, +1 en Majeur ou en Finale), être tous deux dans le top 5 d'un Majeur
   ou de la Finale (2 pts), ou tous deux dans le top 3 d'un tournoi (1 pt). Il faut 3 pts pour qu'elle naisse.
   Son intensité baisse avec le temps (×0,55 par saison) : brûlante, chaude, tiède, éteinte. */
const RIV = { born: 3, nmin: 2, dec: 0.55, hot: 6, warm: 3, luke: 1.2 };
function rivMomentW(a, b, tot, maj) {   // a, b : rangées [id, pos, r1, r2, ...] ; tot : r => total
  const p = a[1] || 0, q = b[1] || 0; if (!p || !q) return 0;
  if ((p === 1 && q === 2) || (p === 2 && q === 1)) return 3 + (tot(a) === tot(b) ? 1 : 0) + (maj ? 1 : 0);
  if (maj && p <= 5 && q <= 5) return 2;
  if (p <= 3 && q <= 3) return 1;
  return 0;
}
function rivalryData(id) {
  const c0 = careerStart(id), M = {}, tot = r => r[2] + (r[3] || 0);
  const scan = (t, s, ti, fin) => {
    for (let l = 0; l < (fin ? 1 : 4); l++) {
      const rows = t.lg && t.lg[l] && t.lg[l].rows; if (!rows) continue;
      const me = rows.find(r => r[0] === id); if (!me) continue;
      if (!me[1] || me[1] > 5) return;
      const maj = !!(fin || t.maj);
      rows.forEach(r => { if (r[0] === id) return; const w = rivMomentW(me, r, tot, maj); if (!w) return;
        const o = M[r[0]] || (M[r[0]] = { id: r[0], mo: [], cum: 0, w: 0, l: 0 });
        o.mo.push({ s, ti, l, fin, maj: !!t.maj, nm: t.name || '', my: me[1], op: r[1], tm: rows.filter(x => x[1] === me[1]).length > 1, to: rows.filter(x => x[1] === r[1]).length > 1, d: Math.abs(tot(me) - tot(r)), po: me[1] + r[1] === 3 && tot(me) === tot(r), w });
        if (me[1] < r[1]) o.w++; else if (r[1] < me[1]) o.l++;
        o.cum += w; if (!o.born && o.cum >= RIV.born && o.mo.length >= RIV.nmin) o.born = o.mo[o.mo.length - 1]; });
      return;
    }
  };
  S.hist.forEach(H => { if (H.s <= c0) return; (H.t || []).forEach((t, ti) => { if (t) scan(t, H.s, ti, 0); }); if (H.fin) scan(H.fin, H.s, N_TOURN, 1); });
  const ref = S.G[id] || id === 0 ? (S.last ? S.last.s : S.season) : (S.old && S.old[id] && S.old[id].s) || S.season;
  return Object.values(M).filter(o => o.born && nameOf(o.id)).map(o => {
    o.int = o.mo.reduce((a, m) => a + m.w * Math.pow(RIV.dec, Math.max(0, ref - m.s)), 0);
    o.last = o.mo[o.mo.length - 1].s;
    o.tier = o.int >= RIV.hot ? 3 : o.int >= RIV.warm ? 2 : o.int >= RIV.luke ? 1 : 0;
    return o; }).sort((a, b) => b.int - a.int || b.cum - a.cum);
}
function rivalryDataAll(id) { const k = [RIV.born, RIV.nmin]; RIV.born = 0.0001; RIV.nmin = 1; try { return rivalryData(id); } finally { RIV.born = k[0]; RIV.nmin = k[1]; } }
const RIV_LBL = ['éteinte', 'tiède', 'chaude', 'brûlante'];
function rivMomentHTML(m, id) {
  const tag = m.fin ? 'Finale' : m.maj ? 'Majeur' : 'T' + (m.ti + 1);
  const res = m.my < m.op ? 'w' : m.my > m.op ? 'l' : '';
  return '<div class="rvm"><span class="rvtag' + (m.fin || m.maj ? ' big' : '') + '">' + tag + '</span><span class="rvev">' + yr(m.s) + ' · <a href="#" data-a="tourn" data-s="' + m.s + '" data-t="' + m.ti + '" data-l="' + m.l + '">' + esc(m.nm) + '</a></span>' +
    '<span class="rvpos ' + res + '"><b>' + (m.tm ? 'T' : '') + m.my + '</b>–<b>' + (m.to ? 'T' : '') + m.op + '</b></span><span class="rvd">' + (m.po ? '<span>Prolongation</span>' : m.d ? '<span>à ' + plural(m.d, 'coup') + '</span>' : '<span>égalité</span>') + '</span></div>';
}
function rivalsHTML(id) {
  const R = rivalryData(id), A = golferH2H(id).filter(x => nameOf(x.id)), you = id === 0;
  if (!R.length && !A.length) return '';
  const last = n => esc((nameOf(n) || '').split(' ').slice(-1)[0]);
  let h = '<h2>Rivalités</h2><p class="small mute" style="margin:-4px 0 10px">Une rivalité naît des moments importants contre le même golfeur : finir 1er et 2e, être tous deux dans le top 5 d’un Majeur ou de la Finale, ou dans le top 3 d’un tournoi. Son intensité baisse avec le temps. Touche un rival pour voir vos moments.</p>';
  if (!R.length) h += '<p class="mute">Aucune rivalité pour l’instant : il faut quelques moments importants contre le même golfeur.</p>';
  else h += '<div class="rvlist">' + R.slice(0, 6).map((o, i) => {
    const pct = Math.max(4, Math.min(100, Math.round(o.int / 8 * 100)));
    const b = o.born ? '<p class="small mute" style="margin:0 0 6px"><span>Née</span>' + (LANG === 'en' ? ': ' : ' : ') + (o.born.fin ? '<span>Finale</span>' : o.born.maj ? '<span>Majeur</span>' : 'T' + (o.born.ti + 1)) + ' ' + yr(o.born.s) + ' · <span>' + plural(o.mo.length, 'moment') + '</span></p>' : '';
    const head = '<div class="rvmh"><span class="rvtag">Moment</span><span class="rvev"></span><span class="rvpos"><b>' + last(id) + '</b>–<b>' + last(o.id) + '</b></span><span class="rvd"></span></div>';
    return '<details class="rvi t' + o.tier + '"' + (i === 0 && o.tier ? ' open' : '') + '><summary><span class="rvn">' + flagOf(o.id, 22) + '<span class="rvnm">' + esc(nameOf(o.id)) + '</span></span>' +
      '<span class="rvsc"><span class="w">' + o.w + '</span> – <span class="l">' + o.l + '</span></span><span class="rvlab">' + RIV_LBL[o.tier] + '</span>' +
      '<span class="rvmeter"><i style="width:' + pct + '%"></i></span></summary><div class="rvbody">' + b + head + o.mo.slice().reverse().map(m => rivMomentHTML(m, id)).join('') +
      '<p style="margin:8px 0 0"><a href="#" data-a="golfer" data-id="' + o.id + '"><span>Voir le profil de</span> ' + esc(nameOf(o.id)) + '</a></p></div></details>';
  }).join('') + '</div>';
  if (A.length) h += detailsBox('Face-à-face : tous les adversaires', '<div style="margin-top:8px">' + h2hHTML(id, A, you) + '</div>');
  return h;
}
function h2hHTML(id, A, you) {
  const total = A.reduce((m, x) => Math.max(m, x.m), 0), minM = Math.max(10, Math.min(30, Math.round(total * 0.2)));
  const pool = A.filter(x => x.m >= minM), taken = new Set();
  const betes = pool.filter(x => x.l > x.w).sort((a, b) => b.l / b.m - a.l / a.m || b.m - a.m).slice(0, 3); betes.forEach(x => taken.add(x.id));
  const victs = pool.filter(x => x.w > x.l && !taken.has(x.id)).sort((a, b) => b.w / b.m - a.w / a.m || b.m - a.m).slice(0, 3);
  const link = x => '<a href="#" data-a="golfer" data-id="' + x.id + '">' + esc(nameOf(x.id)) + '</a>';
  const card = (lbl, xs, subFn, tone) => { const x = xs[0]; return '<div class="rvc ' + tone + '"><div class="rvl">' + lbl + '</div><div class="rvn">' + flagOf(x.id, 24) + link(x) + '</div><div class="rvs"><span class="w">' + x.w + '</span> – <span class="l">' + x.l + '</span></div><div class="rvsub">' + subFn(x) + '</div>' +
    xs.slice(1).map((y, i) => '<div class="rvmore"><span class="rvk">' + (i + 2) + '</span>' + flagOf(y.id, 18) + '<span class="rvmn">' + link(y) + '</span><span class="rvms"><span class="w">' + y.w + '</span>–<span class="l">' + y.l + '</span></span></div>').join('') + '</div>'; };
  let h = '<p class="small mute" style="margin:0 0 10px">Face-à-face : chaque tournoi joué dans la même ligue est un duel, gagné par celui qui finit devant l’autre.</p>';
  const cards = [];
  if (betes.length) cards.push(card(betes.length > 1 ? 'Bêtes noires' : 'Bête noire', betes, x => (you ? 't’a battu ' : 'l’a battu ') + Math.round(x.l / x.m * 100) + ' % du temps en ' + x.m + ' duels', 'be'));
  if (victs.length) cards.push(card(victs.length > 1 ? 'Souffre-douleurs' : 'Souffre-douleur', victs, x => 'battu ' + Math.round(x.w / x.m * 100) + ' % du temps en ' + x.m + ' duels', 'vi'));
  if (cards.length) h += '<div class="rvg">' + cards.join('') + '</div>';
  const freq = A.slice().sort((a, b) => b.m - a.m || b.w - a.w).slice(0, 6);
  h += '<h3>Adversaires les plus fréquents</h3><div class="scroll"><table class="plain rvt"><tr><th></th><th>Golfeur</th><th class="r">Duels</th><th class="r">Gagnés</th><th class="r">Perdus</th><th>Bilan</th></tr>' +
    freq.map(x => '<tr><td>' + flagOf(x.id, 20) + '</td><td>' + link(x) + '</td><td class="r">' + x.m + '</td><td class="r">' + x.w + '</td><td class="r">' + x.l + '</td><td><div class="rvbar" role="img" aria-label="' + x.w + ' gagnés, ' + x.l + ' perdus"><i style="width:' + (x.w + x.l ? Math.round(x.w / (x.w + x.l) * 100) : 50) + '%"></i></div></td></tr>').join('') + '</table></div>';
  return h;
}

