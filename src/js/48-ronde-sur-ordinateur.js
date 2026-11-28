/* ============ RONDE SUR ORDINATEUR (v398) ============
   Disposition choisie par le propriétaire pour l'écran de la ronde (jouée ou simulée), style Gestionnaire sur PC.
   v407 :
   - colonne de gauche : les actions de la ronde, puis le groupe de ton golfeur, les groupes suivis et la watchlist
     du tournoi (nom de famille seul, le plus de trous possible) ;
   - panneau de droite : une ligne de trois menus (Ligue, Vue, Golfeurs) avec, à droite, la coupure projetée
     (v408 : aussi pour une autre ligue regardée), la ligne d'état, puis le classement, qui prend tout le reste ;
   - « Réactions » et « Journal » sont remplacés par la bande des moments clés, en bas de l'écran (voir kmRender) ;
   - « Scores adverses » (tous d'un coup / par séquence) en menu dans la colonne de gauche.
   rdLayout() déplace les blocs après l'affichage ; les menus cliquent sur les boutons d'origine, gardés cachés.
   Sur téléphone et en style classique, rien ne change. */
function rdSel(lab, chips) {
  const w = document.createElement('label'); w.className = 'rdsel';
  const t = document.createElement('span'); t.textContent = lab; w.appendChild(t);
  const s = document.createElement('select'), B = [...chips.querySelectorAll('.chip[data-a]')];
  B.forEach((b, i) => { const o = document.createElement('option'); o.value = i; o.textContent = b.textContent; if (b.getAttribute('aria-pressed') === 'true') o.selected = true; s.appendChild(o); });
  s.addEventListener('change', () => { const b = B[+s.value]; if (b) b.click(); });
  w.appendChild(s); return w;
}
function rdLayout() {
  if (!(typeof isMgr === 'function' && isMgr()) || !VIEW || !/^(play|spec)$/.test(VIEW.name)) return;
  const m = document.querySelector('#app .cb .mpb'), ca = document.querySelector('#app .ca'); if (!m || !ca || m.dataset.rd) return;
  m.dataset.rd = '1'; m.classList.add('rdm');
  const chipsOf = a => { const b = m.querySelector('.chips > [data-a="' + a + '"]'); return b ? b.parentElement : null; };
  const revC = chipsOf('revealmode'), lgC = chipsOf('lgv'), pvC = chipsOf('pv'), lbC = chipsOf('lbmode');
  const hid = document.createElement('div'); hid.hidden = true; hid.className = 'rdhid'; m.appendChild(hid);
  // 1. « Scores adverses » → menu dans la colonne de gauche
  if (revC) {
    const lab = revC.previousElementSibling; if (lab && lab.tagName === 'P' && !lab.querySelector('*')) lab.remove();
    const sel = rdSel('Scores adverses', revC); sel.classList.add('rdrev'); hid.appendChild(revC);
    const tgt = ca.querySelector(':scope > .hole') || ca.querySelector(':scope > .btn, :scope > [data-a]');
    if (tgt) tgt.before(sel); else ca.appendChild(sel);
  }
  // 2. Ligne au-dessus du classement : trois menus (Ligue, Vue, Golfeurs)
  const bar = document.createElement('div'); bar.className = 'rdbar';
  let paid = null;
  if (pvC) { const box = pvC.parentElement; if (box && box !== m && box.children.length > 1) paid = [...box.children].find(x => x !== pvC) || null; }
  if (lgC) {
    const sel = rdSel('Ligue', lgC);
    [...sel.querySelectorAll('option')].forEach(o => { o.textContent = o.textContent.replace(/^L(\d)/, 'Ligue $1'); });
    bar.appendChild(sel); hid.appendChild(lgC);
  }
  if (pvC) { bar.appendChild(rdSel('Vue', pvC)); hid.appendChild(pvC); }
  if (lbC) { bar.appendChild(rdSel('Golfeurs', lbC)); hid.appendChild(lbC); }
  if (paid) { paid.classList.add('rdpaid'); bar.appendChild(paid); }
  const anchor = m.querySelector(':scope > .tstat, :scope > .pjint, :scope > .pjna, :scope > .cardwrap, :scope > .boardwrap, :scope > .scroll, :scope > table') || hid;
  if (bar.children.length) anchor.before(bar);
  // 3. La coupure projetée (barres et pourcentages) : dans l'espace libre à droite des menus
  const cut = m.querySelector('.cutst');
  if (cut) { cut.classList.add('rdpaid'); if (bar.parentElement) bar.appendChild(cut); else anchor.before(cut); }
  if (typeof trNode === 'function' && LANG === 'en') { trNode(m); trNode(ca); }
  rdFit();
  [...m.children].forEach(x => { if (x !== hid && !x.children.length && !x.textContent.trim() && x.id !== 'boardTop') x.remove(); });
}
/* v407 : la watchlist (dernier bloc de la colonne de gauche) s'arrête au bas de l'écran, au-dessus de la bande des
   moments clés ; le reste défile dans son cadre. Recalculé à chaque affichage et quand la fenêtre change de taille. */
function rdFit() {
  const w = document.querySelector('#app .cols.play .ca .grptw .grpw'); if (!w) return;
  w.style.maxHeight = 'none';
  if (window.scrollY > 0) return;
  const tw = w.closest('.grptw'), padB = parseFloat(getComputedStyle(tw).paddingBottom) || 0, band = document.getElementById('kmt');
  const z = zf(), lim = Math.floor((window.innerHeight - w.getBoundingClientRect().top) / z - (band && !band.hidden ? band.offsetHeight : 0) - 12 - padB);   // v416 : en unités du style, quel que soit le zoom
  if (lim >= 112 && w.scrollHeight - lim > 8) w.style.maxHeight = lim + 'px';   // trop bas (ronde jouée à la main) : la page défile, pas le cadre
}
window.addEventListener('resize', () => { try { rdFit(); } catch (e) { } });
Object.assign(I18N_EN, { '⛶ Plein écran': '⛶ Full screen', 'Plein écran': 'Full screen', 'Quitter le plein écran': 'Exit full screen', 'Zoom sur ordinateur :': 'Zoom on computer:', 'Le zoom est retenu sur cet ordinateur. Échap quitte le plein écran ; le navigateur demande un clic pour y revenir à chaque ouverture du jeu.': 'The zoom is remembered on this computer. Esc exits full screen; the browser needs a click to go back to it each time the game opens.', 'Barème de placement': 'Placement scale', '· meilleur index à gauche': '· best index on the left', 'Toi': 'You', 'Sans carte': 'No card',
  'Chaque point est une recrue, placée selon son index actuel. Les chiffres sont les moyennes d’index des ligues, notées après le dernier tournoi, et le seuil sans carte. Chaque recrue commence dans la meilleure ligue dont la moyenne est moins bonne que son index.': 'Each dot is a rookie, placed by their current index. The numbers are the leagues’ index averages, taken after the last tournament, and the no-card threshold. Each rookie starts in the best league whose average is worse than their index.',
  'Chaque point est une recrue, placée selon son index final. Les chiffres sont les moyennes d’index des ligues, notées après le dernier tournoi, et le seuil sans carte. Chaque recrue commence dans la meilleure ligue dont la moyenne est moins bonne que son index.': 'Each dot is a rookie, placed by their final index. The numbers are the leagues’ index averages, taken after the last tournament, and the no-card threshold. Each rookie starts in the best league whose average is worse than their index.',
  'Saison à préparer': 'Season to plan', 'Handicap moy.': 'Avg. handicap', 'Golfeur par golfeur': 'Golfer by golfer', '5 derniers': 'Last 5', '4 derniers': 'Last 4', 'Ligue': 'League', 'La saison en direct ne s’applique pas à la classe de recrues': 'Live season doesn’t apply to the Rookie Class',
  'Les recrues n’accumulent aucun point de classement : c’est leur index qui décidera de leur ligue à la fin de la saison. Choisis une ligue dans le menu pour voir son classement en direct.': 'Rookies don’t earn any ranking points: their index decides their league at the end of the season. Pick a league in the menu to see its live standings.' });
I18N_RX.push([/^Coupure projetée (\S+) · top (\d+)$/, 'Projected cut $1 · top $2'], [/^Coupure projetée (\S+)$/, 'Projected cut $1'], [/^Ligne de coupure (\S+)$/, 'Cut line $1'], [/^(\d{4}) · (\d+) terrains? choisis?$/, (m, y, n) => y + ' · ' + n + (n === '1' ? ' course chosen' : ' courses chosen')], [/^Ligue (\d) · toi$/, 'League $1 · you'], [/^Ligue (\d)$/, 'League $1'], [/^Coupure projetée dès que le tiers des trous de la ronde sera joué \((\d+) %\)$/, 'Projected cut once a third of the round’s holes are played ($1%)']);

/* ---- v407 : MOMENTS CLÉS — bande en bas de l'écran pendant la ronde (style Gestionnaire sur PC) ----
   Remplace « Réactions » et « Journal ». Rien n'est sauvegardé : à chaque affichage, on compare le classement en
   direct à celui de l'affichage précédent et on en tire les moments clés.
   v412 : la bande suit la ligue choisie dans le menu « Ligue ». Les cinq champs (ta ligue et les autres) sont suivis
   en arrière-plan à chaque affichage, pour que la bande soit déjà remplie quand on change de ligue.
   - Qui a droit à un message :
     · partout : la tête (prend seul la tête, rejoint la tête, creuse l'écart à 3 coups ou plus), les exploits (trou
       d'un coup, aigle, 3 birdies de suite), un golfeur du top 5 qui s'effondre (double ou pire), l'entrée et la
       sortie du top 5, une remontée de 15 places ou plus jusqu'au top 10, le meneur au chalet (ronde avec départs),
       et un des 10 premiers au classement de la saison qui passe d'un côté à l'autre de la coupure projetée ;
     · ta ligue seulement : ton golfeur (birdie ou mieux, double ou pire), ta watchlist et les groupes affichés à
       gauche (gros coups, entrée ou sortie du top 10, coupure).
   - Un message reste jusqu'à ce qu'il ne soit plus vrai (un meneur qui perd la tête, un golfeur qui ressort du top 5,
     qui repasse de l'autre côté de la coupure…) ou que 6 messages plus récents le poussent dehors. Un seul message par
     golfeur (le plus récent) et un seul message de meneur à la fois.
   - Quand il n'y a encore rien : une ligne calme (meneur, et la position de ton golfeur dans ta ligue). */
const KMS = {}, KM_MAX = 6;
function kmLeaders(rows, r2) {
  const st = rows.filter(r => r2 || r.n == null || r.n > 0); if (!st.length) return [];
  const mn = Math.min.apply(null, st.map(r => r.tot)); return st.filter(r => r.tot === mn);
}
const kmK = () => { const c = S.cur; return Math.min(18, VIEW.name === 'spec' ? (c.k2 || 0) : (c.ps ? c.ps.length : 0)); };
/* le champ suivi : l = null pour ta ligue, 0 à 3 pour une autre ligue (null si elle ne joue pas en direct) */
function kmField(l) {
  const c = S.cur, k = kmK();
  if (l == null) return { own: true, k, rows: liveRows(k), holes: id => id === 0 ? myHoles(c) : c.ai[id], L: c.pl };
  if (!(c.oth && c.oth[l])) return null;
  const rows = othRows(l, k); return rows ? { own: false, k, rows, holes: id => othHoles(l, id), L: l } : null;
}
function kmUpdate(l) {
  const c = S.cur; if (!c || !c.pars) return null;
  const F = kmField(l); if (!F) return null;
  const tr = teeCur(c); let T = tr ? teeT(c, F.k) : F.k; if (!isFinite(T)) T = 1e6;
  const slot = l == null ? 'me' : 'L' + l, key = [S.season, S.t, c.r, c.fin ? 1 : 0, c.name, c.phase, slot].join('|'), r2 = c.r === 1, en = LANG === 'en';
  const rows = F.rows, cur = {}, own = F.own, k = F.k;
  const nT = {}; rows.forEach(r => { nT[r.tot] = (nT[r.tot] || 0) + 1; });
  // le = rang en comptant tous les golfeurs à égalité (« T1 » à 80 golfeurs n'est pas une place de meneur)
  rows.forEach(r => { cur[r.id] = { n: r.n != null ? r.n : Math.max(0, r.pending ? k - 1 : k), tot: r.tot, pos: r.pos, tie: r.tie, le: r.pos + nT[r.tot] - 1 }; });
  const lead = kmLeaders(rows, r2), leadIds = lead.map(r => r.id);
  const leadOK = lead.length > 0 && (r2 || Math.max.apply(null, lead.map(r => cur[r.id].n)) >= 3);
  const sorted = rows.slice().sort((a, b) => a.tot - b.tot), margin = lead.length === 1 && sorted.length > 1 ? sorted[1].tot - lead[0].tot : 0;
  const hasCut = c.r === 0 && !S.one && !c.fin && (!own || !c.rc) && rows.length > S.settings.cut;
  const cut1 = hasCut ? cutScoreOf(rows.map(r => r.tot), S.settings.cut) : null;
  const fin = rows.filter(r => r.n != null && r.n >= 18), finBest = fin.length ? Math.min.apply(null, fin.map(r => r.tot)) : null;
  // un message est-il encore vrai ?
  const okNow = x => {
    const b = cur[x.id]; if (!b) return false;
    switch (x.kind) {
      case 'lead1': return lead.length === 1 && leadIds[0] === x.id;
      case 'leadj': return leadIds.includes(x.id);
      case 'mg': return lead.length === 1 && leadIds[0] === x.id && margin >= x.v;
      case 't5in': return b.le <= 5; case 't5out': return b.pos > 5;
      case 't10in': return b.le <= 10; case 't10out': return b.pos > 10;
      case 'cutin': return hasCut && b.tot <= cut1; case 'cutout': return hasCut && b.tot > cut1;
      case 'club': return b.n >= 18 && b.tot === finBest && fin.filter(r => r.tot === finBest).length === 1;
    }
    return true;   // un fait (aigle, birdies, effondrement, remontée) reste vrai
  };
  const KM = KMS[slot];
  if (!KM || KM.key !== key || T < KM.T - 1e-6) { KMS[slot] = { key, T, st: cur, lead: leadIds, leadOK, msgs: [], cs: {}, mg: null }; return KMS[slot]; }
  const prev = KM.st, N = [], cs = KM.cs || {};   // cs : dernier côté de la coupure annoncé pour chaque golfeur (pas deux fois la même nouvelle)
  const star = new Set(own ? (c.twl || []) : []), mate = new Set();   // étoiles de la watchlist ; partenaires de ton groupe et des groupes suivis
  if (own && tr) { const G = teeGroups(tr.o, tr.lm), me = teeGrp(tr, 0); [me].concat(tr.fol || []).forEach(gi => { if (gi >= 0 && G[gi]) G[gi].forEach(id => mate.add(id)); }); }
  const cut0 = hasCut ? cutScoreOf(Object.keys(prev).map(id => prev[id].tot), S.settings.cut) : null;
  let sea = {}; try { if (F.L >= 0 && F.L <= 3) rankAll(F.L).filter(r => !r.gh && r.pts > 0).slice(0, 10).forEach((r, i) => { sea[r.id] = i + 1; }); } catch (e) { sea = {}; }
  const pl = x => (x.tie ? 'T' : '') + x.pos, nm = id => '<b>' + esc(nameOf(id)) + '</b>';
  const add = (id, j, p, ic, fr, eng, kind, v) => N.push({ id, h: j + 1, p, ic, tx: nm(id) + ' ' + (en ? eng : fr), kind: kind || '', v, T });
  rows.forEach(r => {
    const id = r.id, a = prev[id], b = cur[id]; if (!a || b.n <= a.n) return;
    const hs = F.holes(id); if (!hs) return;
    const me = own && id === 0, st = me || star.has(id), mine = st || mate.has(id), P = ' (' + pl(b) + ')', seen = r2 || a.n >= 3, seen6 = r2 || b.n >= 6;
    let up = 0, dn = 0;
    for (let j = a.n; j < b.n; j++) {
      if (hs[j] == null) continue;
      const d = hs[j] - c.pars[j], h = j + 1; if (d < 0) up = 1; if (d > 0) dn = 1;
      if (hs[j] === 1) add(id, j, 95 + (me ? 10 : 0), '⛳', 'réussit un trou d’un coup au ' + h + ' !', 'makes a hole-in-one on ' + h + '!');
      else if (d <= -2) add(id, j, me ? 100 : mine ? 80 : 70, '🦅', (d <= -3 ? 'réussit un albatros au ' : 'réussit un aigle au ') + h + P, (d <= -3 ? 'makes an albatross on ' : 'eagles hole ') + h + P);
      else if (d === -1 && j >= 2 && hs[j - 1] - c.pars[j - 1] <= -1 && hs[j - 2] - c.pars[j - 2] <= -1 && !(j >= 3 && hs[j - 3] - c.pars[j - 3] <= -1))
        add(id, j, me ? 101 : mine ? 66 : 60, '🔥', ': 3 birdies de suite' + P, 'makes 3 birdies in a row' + P);
      else if (me && d === -1) add(id, j, 100, '🔥', 'réussit un birdie au ' + h + P, 'birdies hole ' + h + P);
      else if (d >= 2 && (me || (seen && a.le <= 5) || (st && (d >= 3 || (seen && a.le <= 10))) || (mine && d >= 3 && seen && a.le <= 10)))
        add(id, j, me ? 100 : seen && a.le <= 5 ? 82 : 52, '💥', 'perd ' + d + ' coups au ' + h + P, 'drops ' + d + ' shots on ' + h + P);
    }
    if (seen6) {   // top 5 (tout le monde), top 10 (tes golfeurs suivis), grosse remontée
      if (a.le > 5 && b.le <= 5 && up) add(id, b.n - 1, me ? 99 : 74, '⭐', 'entre dans le top 5' + P, 'moves into the top 5' + P, 't5in');
      else if (a.le <= 5 && b.pos > 5 && dn) add(id, b.n - 1, me ? 97 : 62, '📉', 'sort du top 5' + P, 'falls out of the top 5' + P, 't5out');
      else if (mine && a.le > 10 && b.le <= 10 && up) add(id, b.n - 1, me ? 98 : 64, '⭐', 'entre dans le top 10' + P, 'moves into the top 10' + P, 't10in');
      else if (mine && a.le <= 10 && b.pos > 10 && dn) add(id, b.n - 1, me ? 97 : 54, '📉', 'sort du top 10' + P, 'falls out of the top 10' + P, 't10out');
      if (up && a.pos - b.pos >= 15 && b.le <= 10) add(id, b.n - 1, me ? 98 : 72, '🚀', 'remonte de ' + (a.pos - b.pos) + ' places' + P, 'climbs ' + (a.pos - b.pos) + ' spots' + P);
    }
    if ((st || sea[id]) && hasCut && b.n >= 9 && a.n >= 1) {   // seulement quand c'est son propre trou qui le fait changer de côté
      const in0 = a.tot <= cut0, in1 = b.tot <= cut1, why = !st && sea[id] ? (en ? ' · #' + sea[id] + ' in the season' : ' · ' + sea[id] + (sea[id] === 1 ? 'er' : 'e') + ' de la saison') : '';
      if (in0 !== in1 && (in1 ? up : dn) && cs[id] !== in1 && (cs[id] = in1, true)) add(id, b.n - 1, me ? 99 : 68, '✂️', (in1 ? 'passe du bon côté de la coupure' : 'glisse sous la ligne de coupure') + ' (' + fmt(b.tot) + ')' + why, (in1 ? 'moves inside the cut line' : 'slips outside the cut line') + ' (' + fmt(b.tot) + ')' + why, in1 ? 'cutin' : 'cutout');
    }
    // meneur au chalet : il termine avec le meilleur score de ceux qui ont fini (et il n'est pas le premier à finir)
    if (b.n >= 18 && a.n < 18 && fin.length >= 2 && b.tot === finBest && fin.filter(x => x.tot === finBest).length === 1 && !leadIds.includes(id))
      add(id, 17, me ? 99 : 74, '🏠', 'mène au chalet à ' + fmt(b.tot), 'is the clubhouse leader at ' + fmt(b.tot), 'club');
  });
  // la tête : un meneur seul, ou un golfeur qui rejoint un petit groupe de tête ; un meneur seul qui creuse l'écart
  let mg = KM.mg;
  if (leadOK) {
    const was = new Set(KM.leadOK ? KM.lead : []), moved = id => prev[id] && cur[id].n > prev[id].n && (r2 || cur[id].n >= 3);
    if (lead.length === 1) { const id = leadIds[0]; if (!(was.size === 1 && was.has(id)) && (moved(id) || was.size)) add(id, cur[id].n - 1, 90, '👑', 'prend seul la tête à ' + fmt(lead[0].tot), 'takes the lead alone at ' + fmt(lead[0].tot), 'lead1'); }
    else if (lead.length <= 3) leadIds.filter(id => !was.has(id) && moved(id)).slice(0, 1).forEach(id => add(id, cur[id].n - 1, 86, '👑', 'rejoint la tête à ' + fmt(lead[0].tot), 'joins the lead at ' + fmt(lead[0].tot), 'leadj'));
    if (lead.length === 1) {
      const id = leadIds[0]; if (!mg || mg.id !== id) mg = { id, v: 2 };
      if (margin >= 3 && margin > mg.v) { mg.v = margin; add(id, Math.max(0, cur[id].n - 1), 84, '📈', 'creuse l’écart : ' + margin + ' coups d’avance', 'pulls ' + margin + ' shots clear', 'mg', margin); }
    } else mg = null;
  }
  // un seul message par golfeur (le plus important de ce trou), et un seul message de meneur à la fois
  const best = {};
  N.forEach(x => { const o = best[x.id]; if (!o || x.p > o.p || (x.p === o.p && x.h > o.h)) best[x.id] = x; });
  const fresh = Object.keys(best).map(id => best[id]), isLead = x => /^(lead1|leadj|mg)$/.test(x.kind), newLead = fresh.some(isLead);
  let M = KM.msgs.filter(x => !best[x.id] && !(newLead && isLead(x))).concat(fresh).filter(okNow);
  M.sort((x, y) => y.T - x.T || y.p - x.p || y.h - x.h); M = M.slice(0, KM_MAX);   // les 6 plus récents (les plus importants d'abord dans un même trou)
  KMS[slot] = { key, T, st: cur, lead: leadIds, leadOK, msgs: M, cs, mg };
  return KMS[slot];
}
function kmCalm(l) {
  const c = S.cur, en = LANG === 'en', F = kmField(l); if (!F) return '';
  const rows = F.rows, lead = kmLeaders(rows, c.r === 1), me = F.own ? rows.find(r => r.id === 0) : null, nm = id => '<b>' + esc(nameOf(id)) + '</b>';
  let t = !lead.length ? (en ? 'The round is about to start' : 'La ronde va commencer')
    : lead.length === 1 ? (en ? 'Leader: ' : 'En tête : ') + nm(lead[0].id) + ' (' + fmt(lead[0].tot) + ')'
    : lead.length <= 3 ? (en ? 'Leaders: ' : 'En tête : ') + lead.map(r => nm(r.id)).join(', ') + ' (' + fmt(lead[0].tot) + ')'
    : lead.length + (en ? ' golfers tied for the lead at ' : ' golfeurs à égalité en tête à ') + fmt(lead[0].tot);
  if (me && lead.length && !lead.some(r => r.id === 0)) t += ' <i>·</i> ' + nm(0) + (en ? ': ' : ' : ') + posLbl(me) + ' (' + fmt(me.tot) + ')';
  return t;
}
/* la ligue affichée dans le classement (null = la tienne) */
function kmShown() {
  const c = S.cur, lv = S.ui.lgv != null && S.ui.lgv !== c.pl ? S.ui.lgv : null;
  return lv != null && lv >= 0 && lv <= 3 && c.oth && c.oth[lv] ? lv : null;
}
function kmRender() {
  if (VIEW && VIEW.name === 'pnPlay') return;   // v443 : le tournoi rapide a sa propre bande (pnKmRender)
  let el = document.getElementById('kmt');
  const on = typeof isMgr === 'function' && isMgr() && S && S.cur && VIEW && /^(play|spec)$/.test(VIEW.name) && !!document.querySelector('#app .cols.play');
  document.documentElement.classList.toggle('kmon', !!on);
  if (!on) { if (el) el.hidden = true; return; }
  const shown = kmShown(); let st = null;
  [null, 0, 1, 2, 3].forEach(l => { if (l != null && (l === S.cur.pl || !(S.cur.oth && S.cur.oth[l]))) return; try { const x = kmUpdate(l); if (l === shown) st = x; } catch (e) { } });   // les cinq champs, chaque fois
  const en = LANG === 'en', M = st ? st.msgs : [];
  let body = '';
  if (M.length) body = M.map(x => '<span class="kmi' + (st.T - x.T >= 1 - 1e-6 ? ' old' : '') + '"><span class="kmh">' + (en ? 'HOLE ' : 'TROU ') + x.h + '</span><span class="kmic" aria-hidden="true">' + x.ic + '</span> <span>' + x.tx + '</span></span>').join('');
  else { try { body = '<span class="kmi calm">' + kmCalm(shown) + '</span>'; } catch (e) { body = ''; } }
  if (!el) { el = document.createElement('div'); el.id = 'kmt'; el.className = 'notr'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.hidden = false;
  const side = document.querySelector('#app'), left = side ? Math.max(0, Math.round(side.getBoundingClientRect().left / zf())) : 0;
  el.style.left = left + 'px';
  const html = '<span class="kmtg">' + (en ? 'KEY MOMENTS' : 'MOMENTS CLÉS') + '</span><div class="kmv"><div class="kmr">' + body + '</div></div>';
  if (el.dataset.h === html) return;   // rien de neuf : on ne touche pas à la bande (le défilement continue)
  el.dataset.h = html; el.innerHTML = html;
  const v = el.querySelector('.kmv'), r = el.querySelector('.kmr');
  if (r.scrollWidth > v.clientWidth + 2 && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) {   // trop long : la bande défile
    r.innerHTML = body + body; r.classList.add('run'); r.style.animationDuration = Math.max(20, Math.round(r.scrollWidth / 2 / 45)) + 's';
  }
}
/* v401 : dans les cartes de scores, un nom qui ne tient pas en entier devient « initiale du prénom + nom de famille »
   (« M. Smith »), comme dans le bloc du groupe ; le nom complet reste au survol. On mesure tout, puis on remplace. */
function nmFit() {
  const L = [...document.querySelectorAll('#app table.cards .nmln > .nmt[data-id]')].filter(a => !a.dataset.nf && a.scrollWidth > a.clientWidth + 1);
  L.forEach(a => { const id = +a.dataset.id, full = nameOf(id), sh = shortNm(full); a.dataset.nf = '1'; if (sh && sh !== full) { a.textContent = sh; a.title = full; } });
}
window.addEventListener('resize', () => { try { nmFit(); } catch (e) { } });
(function rdInit() {
  const base = render;
  render = function () { const r = base.apply(this, arguments); try { kmRender(); } catch (e) { } try { rdLayout(); } catch (e) { } try { nmFit(); } catch (e) { } return r; };
})();
