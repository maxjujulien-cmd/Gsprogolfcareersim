/* ============ v283 : RÉSULTATS PAR SAISON (profil › Résultats) ============
   Une ligne par saison (et par ligue si déplacé en cours de saison) avec le détail et les stats ; une flèche déroule
   tous les tournois de cette saison, avec chaque ronde (score et stats). L'année mène à la page Ligues de cette saison. */
const RSX_OPEN = new Set();
document.addEventListener('toggle', e => { const t = e.target; if (t && t.classList && t.classList.contains('rsd')) { if (t.open) RSX_OPEN.add(t.dataset.k); else RSX_OPEN.delete(t.dataset.k); } }, true);
const f1s = v => (v > 0 ? '+' : v < 0 ? '−' : '') + (LANG === 'en' ? Math.abs(v).toFixed(1) : Math.abs(v).toFixed(1).replace('.', ','));
function rsRounds(id, x) {   // stats de chaque ronde d'un tournoi : [{fw, gir, pu, pe}] (fw en %, ou null)
  const T = tGet(S.hist[x.s - 1], x.t); if (!T) return [];
  const res = x.fin ? T.lg && T.lg[0] : x.l === 4 ? T.rc : T.lg && T.lg[x.l], str = res && res.sx && res.sx[id]; if (!str) return [];
  const fo = T.pars ? T.pars.filter(p => p > 3).length : 14, sp = res.sp && res.sp[id], out = [];
  for (let k = 0; k * 5 < str.length; k++) { const d = skDec(str, k * 5); if (!d) continue; out.push({ fw: fo ? d[0] / fo * 100 : null, gir: d[1] / 18 * 100, pu: d[2], pe: sp && sp.charAt(k) ? parseInt(sp.charAt(k), 36) : null }); }
  return out;
}
/* ============ v333 : page Résultats — tuiles de carrière, graphique de progression, cartes de saison ============ */
const RS_LGA = new Map();
function rsLgAvg(s, l) {   // moyennes de la ligue l à la saison s (ronde moyenne et stats techniques), pour colorer celles du golfeur
  if (RS_LGA.S !== S) { RS_LGA.clear(); RS_LGA.S = S; }
  const k = s + '-' + l + '-' + (s === S.season ? S.t : 'e'); if (RS_LGA.has(k)) return RS_LGA.get(k);
  const H = S.hist[s - 1]; let out = null;
  if (H && l >= 0 && l < 4) {
    let rs = 0, rn = 0; H.t.forEach(t => { const R = t && t.lg && t.lg[l] && t.lg[l].rows; if (R) R.forEach(r => { if (r[2] != null) { rs += r[2]; rn++; } if (r[3] != null) { rs += r[3]; rn++; } }); });
    const ids = s === S.season ? S.L[l] : H.end && H.end.tables[l] ? H.end.tables[l].map(r => r[0]) : [];
    const acc = []; ids.forEach(id => { const g = id === 0 ? hcHolder(0) : S.G[id] || (S.old && S.old[id]); const a = g && g.sx && g.sx[s]; if (a) a.forEach((v, i) => { acc[i] = (acc[i] || 0) + (v || 0); }); });
    out = { rd: rn ? rs / rn : null, st: acc.length ? skStat(acc) : null };
  }
  RS_LGA.set(k, out); return out;
}
function rsRows(id, past, l) {   // les saisons du golfeur (passées + en cours), de la plus récente à la plus ancienne
  const all = golferHistory(id, false, true), rows = past.slice();
  if (l >= 0 && S.hist[S.season - 1] && all.some(x => x.s === S.season)) {
    const st = getSt(id); rows.push({ s: S.season, l, rank: seasonRank(l, id), pts: st.pts, cur: 1 });
    /* v392 : déplacé pendant la saison en cours → une ligne par ligue quittée (comme pour les saisons passées),
       avec son rang et ses points dans le classement de cette ligue, où il reste comme « fantôme » */
    const gm = typeof gmv === 'function' ? gmv(id) : null, mvs = gm && gm.mv ? (gm.mv.moves || [{ fromL: gm.mv.fromL, toL: l, type: gm.mv.type, reason: gm.mv.reason }]) : [];
    const seq = []; all.filter(x => x.s === S.season && !x.fin).sort((a, b) => a.t - b.t).forEach(x => { if (seq[seq.length - 1] !== x.l) seq.push(x.l); });
    seq.forEach((L, i) => {
      if (i === seq.length - 1 && L === l) return;   // le dernier tronçon est la ligue actuelle
      const nx = i + 1 < seq.length ? seq[i + 1] : l, R = rankAll(L), j = R.findIndex(z => z.id === id);
      rows.push({ s: S.season, l: L, rank: j >= 0 ? j + 1 : null, pts: j >= 0 ? R[j].pts : all.filter(x => x.s === S.season && x.l === L).reduce((a, x) => a + (x.pts || 0), 0),
        fld: S.L[L].length, mid: 1, up: nx < L, dn: nx > L, why: [((mvs.find(m => m.fromL === L && m.toL === nx) || {}).reason) || '', 'en cours de saison'] });
    });
  }
  rows.sort((a, b) => b.s - a.s || (a.mid ? 1 : 0) - (b.mid ? 1 : 0));
  rows.forEach(p => { p.part = all.some(x => x.s === p.s && !x.fin && x.l !== p.l); });   // v395 : saison partagée entre deux ligues
  rows.forEach(p => { if (p.fld != null) return; const H = S.hist[p.s - 1]; p.fld = p.cur ? S.L[p.l].length : H && H.end && H.end.tables[p.l] ? H.end.tables[p.l].length : null; });
  return rows;
}
const rsScore = p => p.l + (p.rank - 1) / Math.max(1, (p.fld || 150) - 1);   // 0 = 1er de la L1 ; plus bas = meilleur
function rsBestKey(rows) { const done = rows.filter(p => !p.cur && !p.mid && !p.part && p.rank);   // v395 : une saison partielle n’est jamais « meilleure saison »
  if (done.length < 2) return null; const b = done.reduce((m, p) => !m || rsScore(p) < rsScore(m) ? p : m, null); return b.s + '-' + b.l; }
function rsLegs(id, s) {   // v338 : la ligue du golfeur à chaque tournoi de la saison s → déplacements en cours de saison [{k, from, to}]
  const H = S.hist[s - 1], seq = [], out = []; if (!H) return out;
  H.t.forEach(t => { if (!t || !t.lg) return; for (let L = 0; L < 4; L++) if (t.lg[L] && t.lg[L].rows.some(r => r[0] === id)) { seq.push(L); break; } });
  for (let k = 1; k < seq.length; k++) if (seq[k] !== seq[k - 1]) out.push({ k, from: seq[k - 1], to: seq[k] });
  return out;
}
function rsChartHTML(rows, bestK, id) {   // rang de fin de saison, dans des bandes par ligue (L1 en haut)
  const P = rows.filter(p => !p.mid && p.rank && p.fld).slice().reverse(); if (P.length < 2) return '';
  const wide = isPC(), W = wide ? Math.round(Math.max(700, Math.min(1600, (window.innerWidth || 1300) - 300))) : 460, top = wide ? 22 : 14, bh = wide ? 50 : 44,   /* v348 : sur ordi, largeur réelle de la page (texte à taille normale) */ X0 = wide ? 80 : 58, X1 = W - 30, n = P.length, x = i => n === 1 ? (X0 + X1) / 2 : X0 + i * (X1 - X0) / (n - 1);
  const y = p => top + p.l * bh + 6 + (p.rank - 1) / Math.max(1, p.fld - 1) * (bh - 12);
  let s = '<svg viewBox="0 0 ' + W + ' ' + (top + 4 * bh + 26) + '" width="100%" role="img" aria-label="Rang de fin de saison, ligue par ligue" style="display:block">';
  for (let L = 0; L < 4; L++) s += '<rect x="' + (X0 - 14) + '" y="' + (top + L * bh) + '" width="' + (X1 - X0 + 28) + '" height="' + (bh - 2) + '" rx="6" fill="var(--lg' + (L + 1) + ')" fill-opacity=".09"/><text x="' + (X0 - 20) + '" y="' + (top + L * bh + bh / 2 + 4) + '" text-anchor="end" class="rscht">L' + (L + 1) + '</text>';
  // v338 : déplacements en cours de saison, placés entre les deux années selon le tournoi où ils sont arrivés
  const MV = P.map(p => id != null ? rsLegs(id, p.s) : []), gap = n > 1 ? (X1 - X0) / (n - 1) : 80, yr0 = (L, f) => top + L * bh + 6 + f * (bh - 12);
  const midR = (s0, L) => { const m = rows.find(q => q.mid && q.s === s0 && q.l === L && q.rank && q.fld); if (m) return (m.rank - 1) / Math.max(1, m.fld - 1); if (s0 === S.season) { const r = rankAll(L), i = r.findIndex(z => z.id === id); if (i >= 0) return i / Math.max(1, r.length - 1); } return null; };
  const nodes = [], arrows = [];
  P.forEach((p, i) => {
    const xi = x(i), xa = i > 0 ? x(i - 1) : Math.max(X0 - 10, xi - gap / 2);
    MV[i].forEach((m, j) => {
      const xm = xa + (m.k / N_TOURN) * (xi - xa), fr = midR(p.s, m.from), f0 = fr != null ? fr : (m.to < m.from ? 0.15 : 0.85), f1 = m.to < m.from ? 0.85 : 0.15;
      const ya = yr0(m.from, f0), yb = yr0(m.to, j === MV[i].length - 1 ? (p.rank - 1) / Math.max(1, p.fld - 1) * 0.5 + f1 * 0.5 : f1);
      nodes.push([xm, ya], [xm, yb]); arrows.push({ xm, ya, yb, up: m.to < m.from, k: m.k, from: m.from, to: m.to, s: p.s });
    });
    nodes.push([xi, y(p)]);
  });
  s += '<polyline fill="none" stroke="var(--mute)" stroke-opacity=".55" stroke-width="2" stroke-linejoin="round" points="' + nodes.map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ') + '"/>';
  arrows.forEach(a => {
    const c = a.up ? 'var(--good)' : 'var(--under)', d = a.up ? -1 : 1, tip = a.yb, tt = (a.up ? 'Monté' : 'Descendu') + ' en L' + (a.to + 1) + ' après le tournoi ' + a.k + ' (' + yr(a.s) + ')';
    s += '<g><title>' + tt + '</title><line x1="' + a.xm.toFixed(1) + '" y1="' + (a.ya + d * 6).toFixed(1) + '" x2="' + a.xm.toFixed(1) + '" y2="' + (tip - d * 7).toFixed(1) + '" stroke="' + c + '" stroke-width="2" stroke-dasharray="3 2"/>' +
      '<path d="M' + (a.xm - 5).toFixed(1) + ',' + (tip - d * 8).toFixed(1) + ' L' + a.xm.toFixed(1) + ',' + (tip - d * 1).toFixed(1) + ' L' + (a.xm + 5).toFixed(1) + ',' + (tip - d * 8).toFixed(1) + ' Z" fill="' + c + '"/>' +
      '<circle cx="' + a.xm.toFixed(1) + '" cy="' + a.ya.toFixed(1) + '" r="4.5" fill="var(--paper)" stroke="var(--lg' + (a.from + 1) + ')" stroke-width="2"/>' +
      '<text x="' + (a.xm + 7).toFixed(1) + '" y="' + (a.ya + 4).toFixed(1) + '" class="rscht rschk">T' + a.k + '</text></g>';
  });
  const step = Math.ceil(n / (wide ? 22 : 8)), lab = i => (wide && n <= 40) || n <= 10 || i === 0 || i === n - 1 || P[i].s + '-' + P[i].l === bestK;   // v348 : sur ordi, le rang à chaque saison
  P.forEach((p, i) => {
    const cx = x(i).toFixed(1), cy = y(p).toFixed(1), bk = p.s + '-' + p.l === bestK;
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (bk ? 7 : 6) + '" fill="var(--lg' + (p.l + 1) + ')" stroke="var(--paper)" stroke-width="2"' + (p.cur ? ' fill-opacity=".45" stroke-dasharray="3 2"' : '') + '><title>' + yr(p.s) + ' · L' + (p.l + 1) + ' · ' + ord(p.rank) + ' / ' + p.fld + (p.cur ? ' (en cours)' : '') + '</title></circle>';
    if (lab(i)) s += '<text x="' + cx + '" y="' + (wide && n > 18 && i % 2 ? +cy + 18 : +cy - 10).toFixed(1) + '" text-anchor="middle" class="rschv' + (p.cur ? ' cur' : '') + '">' + ord(p.rank) + (bk ? ' ★' : '') + '</text>';
    if (i % step === 0 || i === n - 1) s += '<text x="' + cx + '" y="' + (top + 4 * bh + 16) + '" text-anchor="middle" class="rscht">' + yr(p.s) + '</text>';
  });
  return '<div class="rsch"><h3>Progression</h3><p class="small mute">Rang de fin de saison, ligue par ligue (plus haut = meilleur)</p>' + s + '</svg><div class="rschl">' + [0, 1, 2, 3].map(L => '<span><i style="background:var(--lg' + (L + 1) + ')"></i>L' + (L + 1) + '</span>').join('') + (arrows.length ? '<span><span>\u25CB T4 = parti après le tournoi 4</span> · <b style="color:var(--good)">\u25B2</b><b style="color:var(--under)">\u25BC</b> <span>en cours de saison</span></span>' : '') + '<span>pointillé = saison en cours</span></div></div>';
}
function rsCareerHTML(id, by, cols, rows, bestK, earnAll) {
  const hall = golferHistory(id, false, true); if (!hall.length) return '';
  const w = hall.filter(x => x.pos === 1).length, t10 = hall.filter(x => x.pos > 0 && x.pos <= 10).length, made = hall.filter(x => x.pos > 0 && !x.mc).length, best = hall.filter(x => x.pos > 0).reduce((m, x) => m == null || x.pos < m ? x.pos : m, null);
  const tile = (v, k, c) => '<div' + (c ? ' class="' + c + '"' : '') + '><b>' + v + '</b><span>' + k + '</span></div>';
  let h = '<div class="rstl">' + tile(hall.length, hall.length > 1 ? 'tournois' : 'tournoi') + tile(w, w > 1 ? 'victoires' : 'victoire', w ? 'gd' : '') + tile(t10, 'top 10') +
    tile(Math.round(made / hall.length * 100) + ' %', 'coupures réussies') + tile(best ? ord(best) : '–', 'meilleur résultat') + tile(fmtMoney(earnAll), 'gains en carrière') + '</div>';
  const dash = '–';
  if (cols.length > 1) h += '<div class="scroll"><table class="plain rslt"><tr><th>Par ligue</th><th class="r">Tourn.</th><th class="r">V</th><th class="r">Top 10</th><th class="r rs20">Top 20</th><th class="r" title="Coupures ratées">CUT</th><th class="r" title="Meilleur résultat">Meilleur</th><th class="r" title="Meilleur rang de saison">Rang</th></tr>' +
    cols.map(L => { const b = by[L]; return '<tr><td><i class="rsdot" style="background:var(--lg' + (L + 1) + ')"></i>L' + (L + 1) + (isPC() ? ' · ' + LEAGUE_SHORT[L] : '') + '</td><td class="r">' + b.n + '</td><td class="r">' + b.w + '</td><td class="r">' + b.t10 + '</td><td class="r rs20">' + b.t20 + '</td><td class="r">' + b.mc + '</td><td class="r">' + (b.best === null ? dash : ord(b.best)) + '</td><td class="r">' + (b.rank === null ? dash : ord(b.rank)) + '</td></tr>'; }).join('') + '</table></div>';
  // records personnels
  const rec = [], pill = (k, v) => rec.push('<div><span>' + k + '</span> <b>' + v + '</b></div>');
  const BS = golferBestScores(id); if (BS.rounds[0]) pill('Meilleure ronde', BS.rounds[0].st + ' (' + fmt(BS.rounds[0].v) + ')');
  let run = 0, mx = 0; hall.forEach(x => { if (x.pos > 0 && !x.mc) { run++; if (run > mx) mx = run; } else run = 0; }); if (mx >= 2) pill('Plus longue série de coupures', mx);
  const mj = hall.filter(x => !x.fin && x.l === 0 && (() => { const t = S.hist[x.s - 1] && S.hist[x.s - 1].t[x.t]; return t && t.maj; })());
  if (mj.length) { const bm = mj.filter(x => x.pos > 0).reduce((m, x) => m == null || x.pos < m ? x.pos : m, null); pill('Meilleur Majeur', bm ? ord(bm) : 'CUT'); }
  const fn = hall.filter(x => x.fin); if (fn.length) pill('Meilleure Finale', ord(fn.reduce((m, x) => Math.min(m, x.pos || 99), 99)));
  if (cols.length === 1) { const b = by[cols[0]]; pill('Top 20', b.t20); if (b.rank !== null) pill('Meilleur rang de saison', ord(b.rank)); }
  else { const done = rows.filter(p => !p.cur && !p.mid && p.rank); if (done.length) { const b = done.reduce((m, p) => !m || rsScore(p) < rsScore(m) ? p : m, null); pill('Meilleure saison', ord(b.rank) + ' L' + (b.l + 1) + ' · ' + yr(b.s)); } }
  if (rec.length) h += '<div class="rsrec">' + rec.join('') + '</div>';
  return h;
}
function rsProjHTML(id, l) {   // saison en cours : où en est le golfeur par rapport aux lignes
  const list = displayRank(l).filter(r => !r.gh); markZones(list, l, 'up', 'dn', null);
  const i = list.findIndex(r => r.id === id); if (i < 0) return '';
  const me = list[i], rk = i + 1, d = v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v) + ' pts', out = [];
  if (l === 0 && finOn() && S.t < N_TOURN) out.push(rk <= FIN.n ? '<span class="rsok">Dans le top ' + FIN.n + ' de la Finale pour l’instant</span>' : '<span class="rsko">' + d(me.pts - list[FIN.n - 1].pts) + ' du ' + ord(FIN.n) + ' (Finale)</span>');
  if (me.zone === 'up') out.push('<span class="rsok">▲ Zone de promotion pour l’instant</span>');
  if (me.zone === 'dn') { const fd = list.findIndex(r => r.zone === 'dn'); if (fd > 0) out.push('<span class="rsko">⚠ <span>Zone de relégation · ' + d(me.pts - list[fd - 1].pts) + ' du maintien</span></span>'); }
  return out.length ? '<div class="rspj">' + out.join(' <span class="mute">·</span> ') + '</div>' : '';
}
function seasonsHTML(id, past, l) {
  const all = golferHistory(id, false, true), hh = id === 0 ? hcHolder(0) : S.G[id] || (S.old && S.old[id]);
  const rows = rsRows(id, past, l), bestK = rsBestKey(rows);
  if (!rows.length) return '';
  const statOf = s => { const a = hh && hh.sx && hh.sx[s]; return a ? skStat(a) : null; };
  const chip = (lab, v, c) => '<span class="rsc' + (c ? ' ' + c : '') + '"><b>' + v + '</b>' + lab + '</span>';
  let h = '<h2>Saison par saison</h2><p class="small mute" style="margin:-4px 0 8px">Touche l’année pour voir la ligue de cette saison, ou la flèche pour voir tous les tournois et les rondes.</p><div class="rsx">';
  rows.forEach(p => {
    const T = all.filter(x => x.s === p.s && (x.fin ? p.l === 0 && !p.mid : x.l === p.l)), reg = T.filter(x => !x.fin);
    const moved = all.some(x => x.s === p.s && !x.fin && x.l !== p.l);   // v394 : saison partagée entre deux ligues → astérisque et nombre de tournois
    const w = T.filter(x => x.pos === 1).length, t10 = T.filter(x => x.pos > 0 && x.pos <= 10).length, mc = T.filter(x => x.mc).length, earn = T.reduce((a, x) => a + (x.pay || 0), 0);
    const rds = []; T.forEach(x => { if (x.r1 != null) rds.push(x.r1); if (x.r2 != null) rds.push(x.r2); });
    const avg = rds.length ? rds.reduce((a, b) => a + b, 0) / rds.length : null, best = T.filter(x => x.pos > 0).reduce((m, x) => m == null || x.pos < m ? x.pos : m, null);
    const fld = p.fld, st = statOf(p.s), k = id + '-' + p.s + '-' + p.l + (p.mid ? 'm' : ''), isB = !p.mid && p.s + '-' + p.l === bestK, LA = rsLgAvg(p.s, p.l);
    const yl = '<a href="#" class="rsy" data-a="lgseason" data-s="' + p.s + '" data-l="' + p.l + '" title="Voir la ligue cette saison-là">' + yr(p.s) + '</a>';
    const wy = (p.why || []).filter(Boolean), tipA = wy.length && PAST_TIP !== 'txt' ? ' tip" tabindex="0" data-tip="' + esc(wy.join(', ')) : '';
    const mvB = p.up || p.dn ? '<span class="rsb ' + (p.up ? 'up' : 'dn') + tipA + '">' + '<span>' + (p.up ? '\u25B2 Promu' : '\u25BC Rel\u00e9gu\u00e9') + '</span>' + (wy[1] ? ' · <span>' + esc(wy[1]) + '</span>' : '') + '</span>' : '';
    const head = '<div class="rsh">' + yl + '<span class="rsl">L' + (p.l + 1) + ' · ' + LEAGUE_SHORT[p.l] + '</span>' +
      (p.cur ? '<span class="rsb cur"><span>En cours</span> · ' + Math.min(S.t, N_TOURN) + '/' + N_TOURN + '</span>' : '') + (p.mid && !mvB ? '<span class="rsb cur">Avant son déplacement</span>' : '') + (isB ? '<span class="rsb best">\u2605 <span>Meilleure saison</span></span>' : '') + (w ? '<span class="rsb win">' + w + ' <span>' + (w > 1 ? 'victoires' : 'victoire') + '</span></span>' : '') + mvB +
      '<span class="rsr">' + (p.rank == null ? '–' : '<b>' + ord(p.rank) + '</b>' + (moved ? '<sup class="rsast">*</sup>' : '') + (fld ? ' <span class="mute">/ ' + fld + '</span>' : '')) + ' <span class="rsarr" aria-hidden="true">▸</span>' +
      (moved ? '<span class="rsn">* <span>' + reg.length + '</span> <span>' + (reg.length > 1 ? 'tournois dans cette ligue' : 'tournoi dans cette ligue') + '</span></span>' : '') + '</span></div>';
    const vs = (v, a, hi, m) => v == null || a == null ? '' : (hi ? v - a : a - v) >= m ? 'g' : (hi ? a - v : v - a) >= m ? 'b' : '';
    const chips = '<div class="rscs">' + chip('pts', p.partial ? '(' + p.pts + ')' : p.pts) + chip('tourn.', reg.length + (T.length > reg.length ? '+F' : '')) + chip('top 10', t10) + chip('coupures ratées', mc, mc ? 'bd' : '') +
      (best ? chip('meilleur', ord(best)) : '') + (earn ? chip('gains', fmtMoney(earn)) : '') + '</div>';
    const now = p.cur && !p.mid ? Math.min(S.t, N_TOURN) : 0;
    const pills = T.length || now ? '<div class="rsps">' + T.map(x => '<a href="#" class="rsp' + (x.pos === 1 ? ' w' : x.pos > 0 && x.pos <= 10 ? ' t' : x.pos === 0 || (!x.pts && !x.fin && x.l !== 4) ? ' c' : '') + (x.fin ? ' f' : '') + '" data-a="tourn" data-s="' + x.s + '" data-t="' + x.t + '" data-l="' + (x.fin ? 0 : x.l) + '" data-m="res" data-fid="' + id + '" title="' + esc(x.name) + '">' + (x.fin ? 'F\u00b7' : '') + (x.pos === 0 ? 'CUT' : x.pos) + '</a>').join('') +
      (now ? range(now + 1, N_TOURN).map(i => '<span class="rsp o">' + i + '</span>').join('') : '') + '</div>' : '';
    const LS = LA && LA.st, tc = (lab, v, c) => '<span class="rsc' + (c ? ' ' + c : '') + '"><b>' + v + '</b>' + lab + '</span>';
    const tech = avg != null || (st && st.n) ? '<div class="rstech">' + (avg != null ? tc('moy. ronde', f1s(avg), vs(avg, LA && LA.rd, false, 0.4)) : '') +
      (st && st.n ? tc('fairways', fmtPct(st.fw), vs(st.fw, LS && LS.fw, true, 2.5)) + tc('GIR', fmtPct(st.gir), vs(st.gir, LS && LS.gir, true, 2.5)) + tc('putts', fmtPu(st.pu), vs(st.pu, LS && LS.pu, false, 0.25)) + (st.scr != null ? tc('sauv.', fmtPct(st.scr), vs(st.scr, LS && LS.scr, true, 4)) : '') : '') + '</div>' : '';
    const proj = p.cur && !p.mid ? rsProjHTML(id, p.l) : '';
    const rl = (x, m, txt) => '<a href="#" class="rlk" data-a="tourn" data-s="' + x.s + '" data-t="' + x.t + '" data-l="' + (x.fin ? 0 : x.l) + '" data-m="' + m + '" data-fid="' + id + '">' + txt + '</a>';
    const td = (v, c) => '<td class="r' + (c ? ' ' + c : '') + '">' + v + '</td>';
    const body = '<div class="scroll"><table class="plain rst"><tr><th>Tournoi</th><th class="r">Pos</th><th class="r">Score</th><th class="r">Pts</th><th class="r">Gains</th><th class="r">Fairways</th><th class="r">GIR</th><th class="r">Putts</th><th class="r">Pén.</th></tr>' +
      T.map(x => {
        const tot = x.r2 != null ? x.r1 + x.r2 : x.r1, R = rsRounds(id, x), A = R.length ? R.reduce((a, r) => ({ fw: a.fw + (r.fw || 0), gir: a.gir + r.gir, pu: a.pu + r.pu, pe: a.pe + (r.pe || 0) }), { fw: 0, gir: 0, pu: 0, pe: 0 }) : null, n = R.length;
        let r = '<tr class="rstt"><td>' + rl(x, 'res', (x.fin ? '🏁 ' : '') + esc(x.name)) + '</td>' + td(x.pos === 0 ? 'CUT' : x.pos) + td(tot == null ? '–' : fmt(tot), cls(tot)) + td(x.pts) + td(x.pay ? fmtMoney(x.pay) : '–') +
          (A ? td(fmtPct(A.fw / n)) + td(fmtPct(A.gir / n)) + td(fmtPu(A.pu / n)) + td(fmtPu(A.pe / n)) : td('–') + td('–') + td('–') + td('–')) + '</tr>';
        [x.r1, x.r2].forEach((sc, i) => { if (sc == null) return; const q = R[i];
          r += '<tr class="rsrd"><td>' + rl(x, 'c' + (i + 1), 'Ronde ' + (i + 1)) + '</td><td></td>' + td(fmt(sc), cls(sc)) + '<td></td><td></td>' + (q ? td(fmtPct(q.fw)) + td(fmtPct(q.gir)) + td(q.pu) + td(q.pe == null ? '–' : q.pe) : '<td></td><td></td><td></td><td></td>') + '</tr>'; });
        return r;
      }).join('') + '</table></div>';
    h += '<details class="rsd' + (isB ? ' best' : '') + '" style="--rsc:var(--lg' + (p.l + 1) + ')" data-k="' + k + '"' + (RSX_OPEN.has(k) ? ' open' : '') + '><summary>' + head + chips + pills + proj + tech + '</summary>' + (T.length ? body : '<p class="small mute">Aucun tournoi.</p>') + pastWhyRow(p).replace(/<\/?t[rd][^>]*>/g, '') + '</details>';
  });
  return h + '</div><p class="small mute rsnote">Stats techniques : vert = mieux que la moyenne de la ligue, rouge = moins bien. Pastilles : or = victoire, vert = top 10, rouge = coupure ratée.</p>';
}
let PTAB = 'ov';
