/* ============ CLASSE DE RECRUES (repêchage de l'intersaison) ============
   Les recrues arrivées à la fin de la saison s (H.end.x.rk) forment la « Classe de yr(s+1) ». Classées par les
   dépisteurs (potentiel estimé g.p), avec un rapport tiré des vrais traits cachés, une comparaison et une certitude.
   Le phénomène n'y est jamais signalé. Recrue de l'année : meilleure saison d'une classe, un an plus tard (H.end.roy). */
const hashN = (id, k) => { let x = (id * 2654435761 + k * 40503) >>> 0; x ^= x >>> 13; return (x >>> 0) % 1000; };
function rcStars(i, n) { const q = n > 1 ? i / n : 0; return q < 0.06 ? 5 : q < 0.2 ? 4 : q < 0.5 ? 3 : q < 0.8 ? 2 : 1; }   // étoiles relatives à la classe (rang des dépisteurs)
function rcStarsHTML(n, big) { return '<span class="stars' + (big ? ' big' : '') + '" aria-label="' + n + ' étoiles sur 5">' + '★'.repeat(n) + '<span>' + '★'.repeat(5 - n) + '</span></span>'; }
/* v335 : jugement des dépisteurs, d'après ce qu'ils voient seulement (potentiel perçu, niveau, âge, régularité ; jamais le plafond caché).
   Poids tirés d'une simulation de 26 000 recrues (6 mondes × 75 saisons) : pe = chance de s'établir en L1 (3 saisons ou plus), ps = chance de devenir une vedette (top 10 de la L1 ou victoire en L1). */
const RC_WE = [-7.99, 3.588, 3.651, 8.664, -1.202, 0.179, -0.419], RC_WS = [-8.417, 2.651, 4.632, 5.482, -1.016, 0.729, -0.333];
function rcOdds(g) {
  const p = (g.p || 0) / 1000, o = (g.o || 0) / 1000, a = ((g.a || 19) - 19) / 3, v = Math.log(g.v0 || g.v || 1), f = [1, p, p * p, o, a, v, o * a];
  const z = W => 1 / (1 + Math.exp(-W.reduce((t, w, i) => t + w * f[i], 0)));
  return { pe: z(RC_WE), ps: z(RC_WS) };
}
function rcScout(g) { const q = rcOdds(g); return q.pe + 0.5 * q.ps + 0.35 * clamp(((g.o || 0) - 450) / 300, 0, 1); }   // chance L1 + un peu de plafond + déjà prêt
function rcCert(g) { const pe = rcOdds(g).pe; return pe >= 0.8 ? ['sure', 'Valeur sûre'] : pe >= 0.52 ? ['solid', 'Solide pari'] : pe >= 0.2 ? ['mid', 'Bon pari'] : pe >= 0.034 ? ['risk', 'Pari risqué'] : ['lotto', 'Billet de loterie']; }
function rcReport(g) {
  const v = g.v0 || g.v || 1, cl = g.cl || 0, out = [], pick = (arr, k) => arr[hashN(g.id, k) % arr.length];
  if (g.p >= 820) out.push(pick(['Un talent qui saute aux yeux.', 'Le genre de recrue qu’on voit rarement passer.', 'Tous les dépisteurs ont noté son nom.'], 1));
  if (v <= 0.82) out.push(pick(['Très régulier, rarement spectaculaire.', 'Une machine à faire des pars : il fait toutes ses coupures.'], 2));
  else if (v >= 1.3) out.push(pick(['Imprévisible : capable d’un 64 comme d’un 80 la même semaine.', 'Des montagnes russes : brillant un jour, perdu le lendemain.'], 2));
  if (cl >= 1) out.push(pick(['Un sang-froid de vétéran quand ça compte.', 'Il aime les fins de tournoi serrées.'], 3));
  else if (cl <= -1) out.push(pick(['Encore fragile sous la pression.', 'Il lui reste à apprendre à finir le travail.'], 3));
  if (g.lb) out.push('Développement lent, mais les dépisteurs croient à une éclosion tardive.');
  if (g.a <= 18) out.push(pick(['Très jeune et encore brut : il peut devenir n’importe quoi.', 'Le plus brut des diamants : tout reste à faire.'], 4));
  else if (g.a >= 24) out.push(pick(['Déjà mature : ce que vous voyez est presque ce que vous aurez.', 'Il arrive tard, mais prêt à jouer tout de suite.'], 4));
  if (!out.length) out.push(pick(['Un profil complet, sans grande faiblesse.', 'Solide partout, excellent nulle part.', 'Un travailleur : il progresse chaque saison.'], 5));
  return out.slice(0, 2).join(' ');
}
function rcCompare(g, exclude) {
  const c = Object.values(S.G).filter(o => o.id !== g.id && !exclude.has(o.id) && o.a >= 26 && Math.abs(Math.max(o.op || 0, o.o) - g.p) <= 45);
  if (!c.length) return null;
  return c[hashN(g.id, 7) % c.length];
}
/* v282 : toutes les cuvées, par année (Historique › Cuvées) et navigation d'une année à l'autre */
function rcYears() { const out = []; for (let s = 1; s < S.season; s++) { try { if (rcPres(s).length) out.push(s); } catch (e) { } } return out; }
function rcNavHTML(s) {
  const ys = rcYears(); if (ys.length < 2) return '';
  const i = ys.indexOf(s), pv = i > 0 ? ys[i - 1] : null, nx = i >= 0 && i < ys.length - 1 ? ys[i + 1] : null;
  return '<div class="rcnav"><button class="btn sec sm" data-a="rcgo" data-s="' + (pv == null ? '' : pv) + '"' + (pv == null ? ' disabled' : '') + ' aria-label="Cuvée précédente">‹</button>' +
    '<select data-c="rcyr" aria-label="Choisir une cuvée">' + ys.slice().reverse().map(y => '<option value="' + y + '"' + (y === s ? ' selected' : '') + '>' + yr(y + 1) + '</option>').join('') + '</select>' +
    '<button class="btn sec sm" data-a="rcgo" data-s="' + (nx == null ? '' : nx) + '"' + (nx == null ? ' disabled' : '') + ' aria-label="Cuvée suivante">›</button></div>';
}
function rcTopOf(s) {
  const ids = rcPres(s), P0 = g => g.rc && g.rc.s === s ? g.rc.p0 : g.p, rk = g => g.rc && g.rc.s === s ? g.rc.r : 999;
  const L = ids.map(id => S.G[id] || (S.old && S.old[id] ? Object.assign({ id }, S.old[id]) : null)).filter(g => g && P0(g) != null).sort((a, b) => rk(a) - rk(b) || P0(b) - P0(a) || a.id - b.id);
  return { n: ids.length, top: L[0] || null, p0: L[0] ? P0(L[0]) : null };
}
function vRcIndex() {
  const ys = rcYears().reverse();
  if (!ys.length) return '<p class="mute">Aucune cuvée pour l’instant : la première arrive à la fin de ta première saison.</p>';
  return '<p class="small mute" style="margin:6px 0 10px">Chaque cuvée de recrues, de la plus récente à la plus ancienne. Touche une année pour voir la classe au complet.</p><div class="block rcidx">' + ys.map(s => {
    const T = rcTopOf(s), rin = !!rcEntry(s), rs = rin ? s + 2 : s, roy = S.hist[rs - 1] && S.hist[rs - 1].end && S.hist[rs - 1].end.roy;
    return '<a href="#" class="rcix" data-a="rclass" data-s="' + s + '"><div class="rcixy"><b>' + yr(s + 1) + '</b><span class="small mute">' + T.n + ' recrue' + (T.n > 1 ? 's' : '') + '</span></div><div class="rcixb">' +
      (T.top ? '<div class="small"><span class="mute">Joyau :</span> ' + flagVisual(T.top.nat, 14) + ' <b>' + esc(nameOf(T.top.id)) + '</b> <span class="mute">· ' + POTS[scale(POTS, T.p0)][1] + '</span></div>' : '') +
      (roy ? '<div class="small"><span class="mute">Recrue de l’année :</span> 🏆 <b>' + esc(nameOf(roy.id)) + '</b></div>' : '') + '</div><span class="rcixa" aria-hidden="true">›</span></a>';
  }).join('') + '</div>';
}
function rcEntry(s) { const E = S.hist[s - 1] && S.hist[s - 1].end; return E && E.x && E.x.rn ? E.x.rn : null; }
function rcPres(s) { return rcEntry(s) || rcClass(s); }   // v252 : cuvée présentée (entrée en classe de recrues, sinon arrivée directe en ligue)
function rcClass(s) { const E = S.hist[s - 1] && S.hist[s - 1].end; return E && E.x && E.x.rk ? E.x.rk.map(r => r[0]).filter(id => id !== 0) : []; }
/* Cuvée jugée par rapport aux AUTRES cuvées, pas sur l'échelle absolue des potentiels : la moyenne du potentiel perçu des
   10 meilleures recrues est comparée aux quantiles d'environ 300 cuvées simulées (v188 : 10 %, 30 %, 50 %, 70 %, 90 %).
   Résultat attendu : 10 % Exceptionnelle, 20 % Au-dessus de la moyenne, 40 % Dans la moyenne, 20 % Sous la moyenne, 10 % Faible. */
const RC_Q = [767, 801, 824, 846, 869];   // v191 : recalculés (ROOK.ptS = 1,15, dépisteurs prudents)
function rcScore(list, P0) { P0 = P0 || (g => g.p); const t = list.map(P0).filter(v => v != null).sort((a, b) => b - a).slice(0, 10); return t.length ? avg(t) : null; }
function rcVerdict(list, P0) { const m = rcScore(list, P0); if (m == null) return 'Aucune'; return m >= RC_Q[4] ? 'Exceptionnelle' : m >= RC_Q[3] ? 'Au-dessus de la moyenne' : m >= RC_Q[1] ? 'Dans la moyenne' : m >= RC_Q[0] ? 'Sous la moyenne' : 'Faible'; }
function rcClassScore(s) {   // potentiel perçu à l'arrivée (photo g.rc si elle existe) pour la cuvée de l'intersaison s
  const L = rcPres(s).map(id => S.G[id] || (S.old && S.old[id])).filter(Boolean);
  return rcScore(L, g => g.rc && g.rc.s === s ? g.rc.p0 : g.p);
}
function rcRankLine(s) {   // rang de la cuvée parmi celles de la partie
  const all = []; for (let k = 1; k < S.season; k++) { const v = rcClassScore(k); if (v != null) all.push([k, v]); }
  if (all.length < 2) return '';
  const r = all.slice().sort((a, b) => b[1] - a[1]).findIndex(x => x[0] === s) + 1;
  return r ? (r === 1 ? 'la meilleure' : r === all.length ? 'la plus faible' : ord(r)) + ' de tes ' + all.length + ' cuvées' : '';
}
function rcRoyPick(s) {   // fin de la saison s : meilleure saison de la classe arrivée pour la saison s
  const ids = new Set(rcClass(s - 1)); if (!ids.size) return null;
  const W = [8, 4, 2, 1]; let best = null;
  [0, 1, 2, 3].forEach(l => rankAll(l).forEach(r => { if (!ids.has(r.id) || r.gh) return; const v = r.pts * W[l] + r.w * 120; if (!best || v > best.v) best = { id: r.id, v, l, pts: r.pts, w: r.w }; }));
  return best;
}
/* Photo de la perception des dépisteurs à l'arrivée (g.rc), prise une seule fois à l'intersaison : le potentiel estimé
   évolue ensuite, mais la page de la classe et le profil gardent ce qu'on pensait au départ. */
function rcSnap(s) {
  const list = rcPres(s).map(id => S.G[id]).filter(g => g && g.p != null && !g.rc).map(g => ({ g, k: rcScout(g) * Math.exp(gauss() * 0.2) })).sort((a, b) => b.k - a.k || a.g.id - b.g.id).map(x => x.g), used = new Set();   // v335 : jugement des dépisteurs, avec leur part d'erreur
  const n = list.length;
  list.forEach((g, i) => { const c = rcCompare(g, used); if (c) used.add(c.id); g.rc = { s, r: i + 1, n, p0: Math.round(g.p), o0: Math.round(g.o), a0: g.a, st: rcStars(i, n), ce: rcCert(g)[0], rp: rcReport(g), cmp: c ? c.id : null }; });
}
const RC_CERT = { sure: 'Valeur sûre', solid: 'Solide pari', mid: 'Bon pari', risk: 'Pari risqué', lotto: 'Billet de loterie' };
function rcOf(id) {   // perception à l'arrivée : la photo si elle existe, sinon reconstituée depuis le bilan de l'intersaison
  const g = S.G[id] || (S.old && S.old[id]); if (g && g.rc) return g.rc;
  for (let i = 0; i < S.hist.length; i++) { const E = S.hist[i].end; if (!E || !E.x || !E.x.rk) continue; const rk = E.x.rk.filter(r => r[0] !== 0), e = rk.find(r => r[0] === id); if (!e) continue;
    const ord = rk.slice().sort((a, b) => b[3] - a[3] || a[2] - b[2]); const r = ord.findIndex(x => x[0] === id) + 1; return { s: S.hist[i].s, r, n: rk.length, pot: e[3], a0: e[2], st: rcStars(r - 1, rk.length), approx: 1 }; }
  return null;
}
function rcProfileHTML(id) {
  const rc = rcOf(id); if (!rc) return '';
  const g = S.G[id] || (S.old && S.old[id]), potName = rc.p0 != null ? POTS[scale(POTS, rc.p0)][1] : POTS[rc.pot] ? POTS[rc.pot][1] : '';
  let verdict = '';
  if (g && rc.p0 != null) { const best = Math.max(g.op || 0, g.o || 0), age = g.a || 0, d = best - rc.p0;
    verdict = d >= 60 ? ['up', 'A dépassé les attentes'] : (d <= -150 && age >= 27) ? ['dn', 'N’a pas atteint ce qu’on attendait'] : age < 26 && d < 0 ? ['eq', 'Encore en développement'] : ['eq', 'Fidèle aux attentes']; }
  /* v270 : fiche d'entrée détaillée — classe, choix des dépisteurs, niveau et potentiel à la création, handicap en classe de recrues, ligue de départ */
  let rcs = null, rcr = null, rcn = 0, arr = null;
  S.hist.forEach(H => { const E = H.end; if (!E) return; const q = (E.rc || []).find(x => x[0] === id); if (q && rcs == null) { rcs = H.s; rcr = q; rcn = E.rc.length; }
    if (!arr && E.x && E.x.rk) { const k = E.x.rk.find(x => x[0] === id); if (k) arr = { s: H.s, l: k[1], a: k[2] }; } });
  const ohs = g && g.oh ? g.oh.find(x => x[0] === rc.s) || g.oh[0] : null, o0 = ohs ? ohs[1] : null;
  const lgL = l => l < 0 ? '<span class="rclg rlx">Sans carte</span>' : '<b>L' + (l + 1) + ' · ' + LEAGUE_SHORT[l] + '</b>';
  const row = (k, v) => '<div class="trow"><span>' + k + '</span><b>' + v + '</b></div>';
  const startL = rcr ? rcr[2] : arr ? arr.l : null;
  let h = '<div class="block rcprof"><h3 style="margin-top:0">Début de carrière</h3><div class="rcrows">' +
    row(rcs != null ? 'Classe de recrues' : 'Cuvée', '<a href="#" data-a="rclass" data-s="' + rc.s + '">' + yr(rc.s + 1) + '</a>') +
    row('Choix des dépisteurs', (rc.r === 1 ? 'Le joyau de la classe' : ord(rc.r)) + ' <span class="mute">sur ' + rc.n + '</span> ' + rcStarsHTML(rc.st)) +
    row('À la création', '<span>' + rc.a0 + ' ans</span>' + (o0 != null ? ' · <span>Niveau ' + esc(TIERS[scale(TIERS, o0)][1]) + '</span>' : '')) +
    row('Potentiel perçu', esc(potName) + (rc.ce ? ' <span class="rccert ' + rc.ce + '">' + RC_CERT[rc.ce] + '</span>' : '')) +
    (rcr ? row('Handicap en classe de recrues', (rcr[1] >= 90 ? '–' : fmtHI(rcr[1])) + ' <span class="mute">· ' + ord(rcr[3]) + ' sur ' + rcn + '</span>') : '') +
    (startL != null ? row('Ligue de départ', lgL(startL) + (rcs != null ? ' <span class="mute">en ' + yr(rcs + 1) + '</span>' : arr ? ' <span class="mute">en ' + yr(arr.s + 1) + '</span>' : '')) : '') + '</div>' +
    (rc.rp ? '<div class="rcrep">« ' + esc(rc.rp) + ' »</div>' : '') + (rc.cmp != null ? '<p class="small mute" style="margin:6px 0 0">Les dépisteurs le comparaient à <a href="#" data-a="golfer" data-id="' + rc.cmp + '">' + esc(nameOf(rc.cmp)) + '</a>.</p>' : '') +
    (verdict ? '<p style="margin:8px 0 0"><span class="rcverd ' + verdict[0] + '">' + verdict[1] + '</span> <span class="small mute">aujourd’hui : ' + (g && g.o != null ? TIERS[tierOf(g)][1] : '') + (g && g.op ? ' · sommet ' + TIERS[scale(TIERS, g.op)][1] : '') + '</span></p>' : '') +
    (rc.approx ? '<p class="small mute" style="margin:6px 0 0">Arrivé avant la mise à jour : rapport des dépisteurs non conservé.</p>' : '') + '</div>';
  return h;
}
