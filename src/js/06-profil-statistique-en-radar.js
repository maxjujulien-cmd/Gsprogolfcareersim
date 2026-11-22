/* ============ PROFIL STATISTIQUE EN RADAR (v221) ============
   Cinq axes : handicap, fairways, GIR, putts, pénalités. Chaque point est un centile (100 = le meilleur, 50 = la médiane),
   par rapport à la ligue du golfeur (bleu) et à tous les golfeurs actifs (orange). Stats de la saison (dès 4 rondes, sinon la précédente). */
const RAD_AX = [['Handicap', 'hc', 1], ['Fairways', 'fw', 0], ['GIR', 'gir', 0], ['Putts', 'pu', 1], ['Pénalités', 'pe', 1]];
function radVals(h) { if (!h) return null; const y = skSeasonOf(h), st = y != null ? skStat(h.sx[y]) : null; const o = { hc: h.hc && h.hc.x != null ? h.hc.x : null }; if (st && st.n >= 4) { o.fw = st.fw; o.gir = st.gir; o.pu = st.pu; o.pe = st.pe; } return o; }
function radPop(ids) { return ids.map(i => radVals(i === 0 ? hcHolder(0) : S.G[i])).filter(Boolean); }
function radPct(v, pop, k, asc) { const xs = pop.map(o => o[k]).filter(x => x != null); if (v == null || xs.length < 5) return null; let w = 0, e = 0; xs.forEach(x => { if (asc ? x > v : x < v) w++; else if (x === v) e++; }); return Math.round((w + 0.5 * (e - 1)) / Math.max(1, xs.length - 1) * 100); }
function radarHTML(id) {
  if (!skOn()) return '';
  const h = id === 0 ? hcHolder(0) : S.G[id], me = radVals(h), l = leagueOf(id); if (!me || l < 0) return '';
  const hasSt = me.gir != null;
  if (!hasSt) return id === 0 && S.mode !== 'sim' ? '<div class="block radblk"><h3>Profil statistique</h3><p class="small mute" style="margin:0">Coche « Noter mes stats » pendant tes rondes : après 4 rondes notées, ton profil se compare à ta ligue et à tout le circuit.</p></div>' : '';
  const popL = radPop(S.L[l]), popA = radPop(Object.values(S.G).map(g => g.id).concat(S.G[0] ? [] : [0]));
  const pL = RAD_AX.map(a => radPct(me[a[1]], popL, a[1], a[2])), pA = RAD_AX.map(a => radPct(me[a[1]], popA, a[1], a[2]));
  const W = 300, H = 270, cx = W / 2, cy = 142, R = 92, n = RAD_AX.length, ang = i => -Math.PI / 2 + i * 2 * Math.PI / n;
  const pt = (i, p) => [cx + Math.cos(ang(i)) * R * Math.max(0.04, (p == null ? 0 : p) / 100), cy + Math.sin(ang(i)) * R * Math.max(0.04, (p == null ? 0 : p) / 100)];
  const ring = f => RAD_AX.map((a, i) => { const q = [cx + Math.cos(ang(i)) * R * f, cy + Math.sin(ang(i)) * R * f]; return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' ');
  const fmtV = (k, v) => v == null ? '–' : k === 'hc' ? fmtHI(v) : k === 'fw' || k === 'gir' ? fmtPct(v) : fmtPu(v);
  let g = '<svg class="radar" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Profil statistique en radar : ' + RAD_AX.map((a, i) => a[0] + ' ' + (pL[i] == null ? '' : pL[i] + 'e centile')).join(', ') + '">';
  [1, 0.75, 0.5, 0.25].forEach(f => { g += '<polygon points="' + ring(f) + '" class="rg' + (f === 0.5 ? ' mid' : '') + '"/>'; });
  RAD_AX.forEach((a, i) => { const q = [cx + Math.cos(ang(i)) * R, cy + Math.sin(ang(i)) * R]; g += '<line x1="' + cx + '" y1="' + cy + '" x2="' + q[0].toFixed(1) + '" y2="' + q[1].toFixed(1) + '" class="ra"/>'; });
  [[pA, 'all'], [pL, 'lg']].forEach(([P, c]) => {
    g += '<polygon points="' + P.map((p, i) => pt(i, p).map(v => v.toFixed(1)).join(',')).join(' ') + '" class="rp ' + c + '"/>';
    P.forEach((p, i) => { if (p == null) return; const q = pt(i, p); g += '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="4.5" class="rd ' + c + '"><title>' + RAD_AX[i][0] + ' : ' + p + 'e centile ' + (c === 'lg' ? 'en Ligue ' + (l + 1) : 'chez tous les golfeurs actifs') + '</title></circle>'; });
  });
  RAD_AX.forEach((a, i) => {
    const q = [cx + Math.cos(ang(i)) * (R + 18), cy + Math.sin(ang(i)) * (R + 18)], anc = Math.abs(q[0] - cx) < 8 ? 'middle' : q[0] < cx ? 'end' : 'start', dy = q[1] < cy - 10 ? -6 : q[1] > cy + 10 ? 10 : 2;
    g += '<text x="' + q[0].toFixed(1) + '" y="' + (q[1] + dy).toFixed(1) + '" text-anchor="' + anc + '" class="rl">' + a[0] + '</text><text x="' + q[0].toFixed(1) + '" y="' + (q[1] + dy + 14).toFixed(1) + '" text-anchor="' + anc + '" class="rv">' + fmtV(a[1], me[a[1]]) + '</text>';
  });
  g += '</svg>';
  const leg = '<div class="radleg"><span><i class="lg1"></i>Ligue ' + (l + 1) + '</span><span><i class="lg2"></i>Tous les golfeurs actifs</span></div>';
  const tbl = '<table class="plain radt"><tr><th></th><th class="r">Valeur</th><th class="r">L' + (l + 1) + '</th><th class="r">Circuit</th></tr>' + RAD_AX.map((a, i) => '<tr><td>' + a[0] + '</td><td class="r">' + fmtV(a[1], me[a[1]]) + '</td><td class="r">' + (pL[i] == null ? '–' : pL[i]) + '</td><td class="r">' + (pA[i] == null ? '–' : pA[i]) + '</td></tr>').join('') + '</table>';
  return '<div class="block radblk"><h3>Profil statistique</h3>' + g + leg + '<details class="dl"><summary>Centiles en détail</summary>' + tbl + '</details><p class="small mute" style="margin:6px 0 0">Centile : 100 = le meilleur, 50 = la médiane (anneau pointillé). <a href="#" data-a="ptab" data-v="stats">Toutes les stats ›</a></p></div>';
}
/* stats d'un tournoi (une ligue) : chaque golfeur, total des rondes jouées */
function tStatsHTML(res, T) {
  if (!res.sx || !T.pars) return '<p class="mute">Les statistiques de jeu n’existent que pour les tournois joués depuis la v220.</p>';
  const fo = T.pars.filter(p => p > 3).length, so = S.ui.tss || 'pos', cnt = {}; res.rows.forEach(r => { cnt[r[1]] = (cnt[r[1]] || 0) + 1; });
  let rows = res.rows.map((r, i) => { const str = res.sx[r[0]]; if (!str) return null; const n = Math.floor(str.length / 5); let a = [0, 0, 0, 0, 0]; for (let k = 0; k < n; k++) { const d = skDec(str, k * 5); if (d) d.forEach((v, j) => a[j] += v); }
    const sp = res.sp && res.sp[r[0]], pe = sp ? sp.split('').reduce((z, ch) => z + parseInt(ch, 36), 0) / sp.length : null;
    return { id: r[0], i, pos: r[1] === 0 ? 'CUT' : (cnt[r[1]] > 1 ? 'T' : '') + r[1], n, fw: a[0] / (fo * n) * 100, gir: a[1] / (18 * n) * 100, pu: a[2] / n, scr: 18 * n - a[1] ? a[3] / (18 * n - a[1]) * 100 : null, pe }; }).filter(Boolean);
  const key = { fw: r => -r.fw, gir: r => -r.gir, pu: r => r.pu, scr: r => -(r.scr || 0), pe: r => r.pe == null ? 99 : r.pe, pos: r => r.i }[so] || (r => r.i);
  rows.sort((a, b) => key(a) - key(b) || a.i - b.i);
  const ldr = (f, asc) => { const b = rows.filter(r => r.n === Math.max.apply(null, rows.map(z => z.n))).slice().sort((p, q) => asc ? f(p) - f(q) : f(q) - f(p))[0]; return b; };
  let x = chipRow([['pos', 'Position'], ['fw', 'Fairways'], ['gir', 'GIR'], ['pu', 'Putts'], ['scr', 'Sauvetages'], ['pe', 'Pénalités']], so, 'tss');
  x += '<div class="scroll"><table class="plain tstats"><tr><th>Pos</th><th>Golfeur</th><th class="r">Fairways</th><th class="r">GIR</th><th class="r">Putts</th><th class="r c5">Sauv.</th><th class="r">Pén.</th></tr>' +
    rows.map(r => '<tr' + (r.id === 0 ? ' class="hin"' : '') + '><td>' + r.pos + '</td><td class="tsn2"><a href="#" data-a="golfer" data-id="' + r.id + '">' + esc(isPC() ? nameOf(r.id) : shortNm(nameOf(r.id))) + '</a></td><td class="r">' + fmtPct(r.fw) + '</td><td class="r">' + fmtPct(r.gir) + '</td><td class="r">' + fmtPu(r.pu) + '</td><td class="r c5">' + fmtPct(r.scr) + '</td><td class="r">' + fmtPu(r.pe) + '</td></tr>').join('') + '</table></div>';
  return x;
}
/* effets sur la cible de la ronde : vent, longueur du terrain, ronde 1 ou finale */
function talRT(g, ctx, r) {
  if (!g || !g.tr || !g.tr.length || !talOn()) return 0;
  const f = condFactor(g); let a = 0;
  g.tr.forEach(t => { const s = t.n ? -1 : 1, L = t.lv;
    if (t.k === 'wind' && ctx.windBump) a -= s * 0.10 * L * (ctx.windBump[r] || 0) * f;
    else if (t.k === 'long' && ctx.distDelta) a -= s * 0.20 * L * ctx.distDelta * f;
    else if (t.k === 'prec' && ctx.distDelta) a += s * 0.20 * L * ctx.distDelta * f;
    else if (t.k === 'fast' && r === 0) a -= s * 0.20 * L;
    else if (t.k === 'close' && r === 1) a -= s * 0.20 * L; });
  return a;
}
/* effets trou par trou : décalage sur un type de trou (même effet en coups quel que soit le niveau), sauveur */
function talHoleMods(model, pars, delta, g) {
  if (!g || !g.tr || !g.tr.length || !talOn()) return null;
  let sh = null, scr = 0; const n = { 3: 0, 4: 0, 5: 0 }; pars.forEach(p => { n[p]++; });
  g.tr.forEach(t => { const s = t.n ? -1 : 1;
    if (t.k === 'p3' || t.k === 'p4' || t.k === 'p5') { const p = +t.k[1]; if (!n[p]) return; const m = model[p], i = clamp(Math.round((delta - m.G0) / m.ST), 0, m.N - 2), sl = (m.E[i + 1] - m.E[i]) / m.ST || 1; sh = sh || { 3: 0, 4: 0, 5: 0 }; sh[p] += -s * (TAL_RND[t.lv] / n[p]) / sl; }
    else if (t.k === 'scr' && !t.n) { let dx = 0; pars.forEach(p => { const m = model[p], k2 = m.rels.indexOf(2); if (k2 > 0) dx += 1 - Phi(m.tau[k2 - 1] - delta); }); scr = Math.min(0.7, 0.15 * t.lv / Math.max(0.3, dx)); } });
  return sh || scr ? { sh, scr } : null;
}
/* fin de saison : révélation, progression, déclin */
function talSeason(g) {
  if (!g || g.id === 0) return null;
  if (!g.tr) talRoll(g, g.cs || 0);
  const a = g.a || 25, s = S.season, out = [];
  g.tr.forEach(t => {
    t.sn = (t.sn || 0) + 1; const known = t.rv != null;
    if (!t.n) {
      if (a <= 29 && t.lv < 3 && Math.random() < 0.07) { t.lv++; t.h.push([s, t.lv]); if (!known) t.rv = s; out.push({ w: known ? 'up' : 'disc', t }); return; }
      if (a >= 34 && Math.random() < 0.12) { t.lv--; t.h.push([s, t.lv]); if (known) out.push({ w: t.lv ? 'down' : 'gone', t }); return; }
    } else if (Math.random() < 0.06) { t.lv--; t.h.push([s, t.lv]); if (known) out.push({ w: t.lv ? 'better' : 'fixed', t }); return; }
    if (!known && t.sn >= TAL_REV[t.lv]) { t.rv = s; out.push({ w: 'disc', t }); }
  });
  g.tr = g.tr.filter(t => t.lv > 0);
  if (!g.tr.some(t => !t.n) && a >= 22 && a <= 32 && Math.random() < 0.015) g.tr.push({ k: talPick(g.tr.map(t => t.k)), lv: 1, n: 0, sn: 0, rv: null, h: [] });
  return out.length ? out.map(e => ({ w: e.w, k: e.t.k, lv: e.t.lv, neg: e.t.n })) : null;
}
/* textes */
const TAL_LBL = { p3: ['Spécialiste des par 3', 'Faible sur les par 3'], p4: ['Machine à par 4', 'Faible sur les par 4'], p5: ['Spécialiste des par 5', 'Faible sur les par 5'],
  wind: ['Joueur de vent', 'Déteste le vent'], long: ['Cogneur', 'Mal à l’aise sur les longs terrains'], prec: ['Joueur de précision', 'Mal à l’aise sur les terrains courts'],
  scr: ['Sauveur', 'Sauveur'], fast: ['Partant rapide', 'Démarre lentement'], close: ['Finisseur', 'Faiblit en ronde finale'] };
const talLbl = t => TAL_LBL[t.k][t.n ? 1 : 0];
const talLvName = t => t.n ? (t.lv >= 2 ? 'Défaut marqué' : 'Défaut léger') : ['', 'Bronze', 'Argent', 'Or'][t.lv];
const talNum = v => (Math.round(v * 100) / 100).toString().replace('.', ',');
function talShort(t) {
  const L = t.lv, sg = t.n ? '+' : '−', x = talNum(TAL_RND[L]);
  switch (t.k) {
    case 'p3': case 'p4': case 'p5': return sg + x + ' coup par ronde sur les par ' + t.k[1];
    case 'wind': return t.n ? 'le vent lui coûte ' + (10 * L) + ' % de plus' : 'le vent lui coûte ' + (10 * L) + ' % de moins';
    case 'long': return t.n ? 'perd des coups quand le terrain est long' : 'gagne des coups quand le terrain est long';
    case 'prec': return t.n ? 'perd des coups quand le terrain est court' : 'gagne des coups quand le terrain est court';
    case 'scr': return 'évite les gros scores : −' + x + ' coup par ronde';
    case 'fast': return sg + talNum(0.2 * L) + ' coup en ronde 1';
    case 'close': return sg + talNum(0.2 * L) + ' coup en ronde finale';
  }
  return '';
}
function talDesc(t) {
  const L = t.lv;
  const base = { p3: 'Ses fers sont redoutables sur les par 3.', p4: 'Une constance rare sur les par 4.', p5: 'Il attaque les par 5 en deux coups : plus d’aigles et de birdies.',
    wind: 'Le vent le dérange moins que les autres : plus ça souffle, plus il gagne du terrain.', long: 'Sa longueur l’avantage sur les longs terrains ; sur les courts, il perd un peu de cet avantage.',
    prec: 'Sa précision paie sur les terrains courts ; sur les longs, il souffre un peu.', scr: 'Il sauve des pars impossibles : moins de doubles bogeys.',
    fast: 'Il part toujours fort en ronde 1.', close: 'Il se transcende en ronde finale.' }[t.k];
  const neg = { p3: 'Les par 3 lui coûtent des coups.', p4: 'Les par 4 lui coûtent des coups.', p5: 'Il gaspille ses occasions sur les par 5.', wind: 'Le vent le dérange plus que les autres.',
    long: 'Il manque de longueur : les longs terrains le pénalisent.', prec: 'Il manque de précision : les terrains courts ne l’avantagent pas.', fast: 'Il démarre lentement en ronde 1.', close: 'Il faiblit souvent en ronde finale.' }[t.k];
  return (t.n ? neg : base) + ' ' + talLvName(t) + ' : ' + talShort(t) + '.';
}
function talHist(t) {
  const parts = [];
  if (t.rv === -1) parts.push('connu avant ton arrivée'); else if (t.rv != null) parts.push('découvert en ' + yr(t.rv));
  (t.h || []).forEach(x => { if (t.rv != null && t.rv !== -1 && x[0] === t.rv && t.h[0] === x) return; parts.push((t.n ? (x[1] ? 'atténué en ' : 'corrigé en ') : (x[1] ? ['', 'bronze', 'argent', 'or'][x[1]] + ' en ' : 'disparu en ')) + yr(x[0])); });
  return parts.length ? ' Historique : ' + parts.join(' · ') + '.' : '';
}
const talDots = t => t.n ? '' : '<span class="lv">' + [1, 2, 3].map(i => '<i' + (i <= t.lv ? ' class="on"' : '') + '></i>').join('') + '</span>';
function talPill(t) {
  if (t.rv == null) { const tip = 'Trait caché : les dépisteurs soupçonnent quelque chose, mais rien n’est encore confirmé. Un talent fort se révèle plus vite.'; return '<span class="tal unk" tabindex="0" role="button" data-mw="' + esc(tip) + '" aria-label="' + esc(tip) + '"><span class="ti">?</span><span>Trait caché<small>Pas encore révélé</small></span></span>'; }
  const cls = t.n ? 'neg' : ['', 'br', 'ag', 'au'][t.lv], tip = talDesc(t) + talHist(t);
  return '<span class="tal ' + cls + '" tabindex="0" role="button" data-mw="' + esc(tip) + '" aria-label="' + esc(talLbl(t) + '. ' + tip) + '"><span class="ti">' + (t.n ? '−' : TAL_ICO[t.k]) + '</span><span>' + talLbl(t) + talDots(t) + '<small>' + talLvName(t) + ' · ' + talShort(t) + '</small></span></span>';
}
/* ton talent à toi : calculé sur tes vraies cartes (aucun effet sur tes scores) */
function talMine() {
  if (S.mode === 'sim') return null;
  const g = hcHolder(0), o = g && g.pa, C = S.pa; if (!o || !C) return { few: 1 };
  if (o[1] + o[3] + o[5] < 180) return { few: 1 };
  const d = [0, 1, 2].map(k => o[k * 2 + 1] >= 40 && C[k * 2 + 1] ? o[k * 2] / o[k * 2 + 1] - C[k * 2] / C[k * 2 + 1] : null);
  let sw = 0, sn = 0; d.forEach((x, k) => { if (x != null) { sw += x * o[k * 2 + 1]; sn += o[k * 2 + 1]; } });
  if (!sn) return { few: 1 };
  const D = sw / sn, out = [];
  d.forEach((x, k) => { if (x == null) return; const r = x - D, par = k + 3;
    const lv = r <= -0.14 ? 3 : r <= -0.10 ? 2 : r <= -0.06 ? 1 : 0, nv = r >= 0.10 ? 2 : r >= 0.06 ? 1 : 0;
    if (lv) out.push({ k: 'p' + par, lv, n: 0, r }); else if (nv) out.push({ k: 'p' + par, lv: nv, n: 1, r }); });
  out.sort((a, b) => a.r - b.r);
  return { list: out };
}
function talMinePill(t) {
  const cls = t.n ? 'neg' : ['', 'br', 'ag', 'au'][t.lv], gap = Math.abs(t.r).toFixed(2).replace('.', ',');
  const tip = 'Sur les par ' + t.k[1] + ', tu joues ' + gap + ' coup par trou ' + (t.n ? 'moins bien' : 'mieux') + ' que d’habitude, en comparant tes cartes à la moyenne du circuit.';
  return '<span class="tal ' + cls + '" tabindex="0" role="button" data-mw="' + esc(tip) + '" aria-label="' + esc(tip) + '"><span class="ti">' + (t.n ? '−' : TAL_ICO[t.k]) + '</span><span>' + talLbl(t) + talDots(t) + '<small>' + talLvName(t) + ' · ' + (t.n ? '+' : '−') + gap + ' coup par trou</small></span></span>';
}
function talBlock(id) {
  if (!talOn()) return '';
  if (id === 0) {
    const m = talMine(); if (!m) return '';
    const body = m.few ? '<p class="small mute" style="margin:0">Joue encore quelques rondes : tes talents se dessinent à partir de tes vraies cartes (au moins 10 rondes).</p>'
      : m.list.length ? '<div class="talrow">' + m.list.map(talMinePill).join('') + '</div>' : '<p class="small mute" style="margin:0">Aucune force ni faiblesse marquée selon tes cartes : un jeu bien équilibré.</p>';
    return '<div class="block talblk"><h3>Talents</h3>' + body + '<p class="small mute talnote">Selon tes vraies cartes, par type de trou. Aucun effet sur tes scores.</p></div>';
  }
  const g = S.G[id]; if (!g || !g.tr || !g.tr.length) return '';
  const tr = g.tr.slice().sort((a, b) => ((a.rv == null) - (b.rv == null)) || (a.n - b.n) || (b.lv - a.lv));
  return '<div class="block talblk"><h3>Talents</h3><div class="talrow">' + tr.map(talPill).join('') + '</div>' + (tr.some(t => t.rv == null) ? '<p class="small mute talnote">Les traits cachés se révèlent avec les saisons : un talent fort se voit plus vite.</p>' : '') + '</div>';
}
function talNews(e) {
  const t = { k: e.k, lv: e.lv, n: e.neg }, nm = nameOf(e.id);
  if (e.w === 'up') return '📈 ' + nm + ' progresse : ' + talLbl(t).toLowerCase().replace(/^./, c => c.toUpperCase()) + ' passe au niveau ' + talLvName(t).toLowerCase() + '.';
  return '🔍 ' + nm + (t.n ? ' : les dépisteurs relèvent un point faible, ' + talLbl(t).toLowerCase() + '.' : ' : les dépisteurs lui découvrent un talent, ' + talLbl(t).toLowerCase() + ' (' + talLvName(t).toLowerCase() + ').');
}

