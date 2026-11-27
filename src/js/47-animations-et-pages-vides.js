/* ============ ANIMATIONS ET PAGES VIDES (v389) ============
   Choix du propriétaire parmi quatre options présentées en vidéo et en images :
   - Animations « Balayage + flèches » : chaque nouvel écran entre par un balayage de gauche à droite ; les chiffres
     principaux (rangs, points, gains, totaux) comptent jusqu'à leur valeur ; dans les classements en direct
     (ronde, spectateur, tournoi), les lignes glissent vers leur nouvelle place (v411 : plus lentement, avec une
     couleur et le nombre de places pour ceux qui changent de rang, voir animFlip). Rien ne bouge si l'appareil
     demande moins d'animations.
   - Flèches de la ronde en direct (v390) : après chaque trou qu'un golfeur termine, on compare sa place juste avant
     ce trou et juste après : ▲ verte s'il est monté, ▼ rouge s'il est descendu, rien s'il n'a pas bougé. La flèche
     reste affichée jusqu'à son trou suivant (voir arwUpdate), dans toutes les vues et en mode « In sequence ».
   - Pages vides « Carte illustrée + action » : emptyCard() remplace les messages d'une ligne (Almanac, boîte de
     réception…) par une grande icône, un titre, une phrase et, au besoin, un bouton qui mène à l'action utile.
   Les animations se branchent sur render() sans rien changer à l'affichage lui-même. */
function emptyCard(icon, title, text, withGo, cls) {
  return '<div class="emc' + (cls ? ' ' + cls : '') + '"><div class="emci" aria-hidden="true">' + icon + '</div><b>' + title + '</b><span>' + text + '</span>' +
    (withGo ? '<button class="btn emgo" data-a="emgo">Jouer mon premier tournoi</button>' : '') + '</div>';
}
function emGo() { VIEW = { name: 'home' }; render(); window.scrollTo(0, 0); mgrGo(); }   // l'action principale de l'accueil (jouer, reprendre…)
const ANIM = { enter: 380, count: 900, flip: 1100, trail: 4100, seen: new Map(), tr: new Map() };
const animOff = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
/* une ligne par golfeur et par tableau : où elle est, son rang affiché, et ses chiffres (pour savoir s'il a joué) */
function animRows() {
  const m = new Map(), tabs = [...document.querySelectorAll('#app table')];
  document.querySelectorAll('#app tr').forEach(tr => {
    const a = tr.querySelector('[data-a=golfer][data-id]') || tr.querySelector('[data-pk]'); if (!a) return;   // v443 : lignes du tournoi rapide
    const pe = tr.querySelector('.pp, td.pos'), pos = pe ? parseInt(pe.textContent.replace(/\D/g, ''), 10) : NaN;
    const sig = [...tr.children].filter(td => !td.classList.contains('pos') && !td.querySelector('[data-a=golfer]')).map(td => td.textContent).join('|');
    const te = tr.querySelector('td.s2, td.tot');
    m.set(tabs.indexOf(tr.closest('table')) + ':' + (a.dataset.id || a.dataset.pk), { top: tr.getBoundingClientRect().top, tr, id: +a.dataset.id, pos: isFinite(pos) ? pos : null, sig, tot: te ? te.textContent : null });
  });
  return m;
}
function animEnter() {
  const w = document.querySelector('#app .wrap'); if (!w || !w.animate) return;
  w.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: ANIM.enter, easing: 'cubic-bezier(.7,0,.3,1)' });
}
/* v411 : mouvements du classement (choix du propriétaire, options C et D).
   - Chaque ligne déplacée glisse vers sa nouvelle place, plus lentement qu'avant (1,1 s).
   - Pendant la ronde, un golfeur qui vient de jouer un trou au-dessus ou en dessous du par et change de rang est mis en couleur (vert : il monte, rouge :
     il descend) avec le nombre de places gagnées ou perdues ; la couleur reste environ 3 secondes, même si l'écran
     est redessiné entre-temps (ANIM.tr garde l'heure de départ de chaque traînée).
   - « Golfeur par golfeur » : le golfeur dévoilé (REVEAL.cur) grossit avec un contour, glisse, puis se pose. */
function animFlip(before, live) {
  const now = performance.now(), rows = animRows(), ease = 'cubic-bezier(.45,.05,.25,1)';
  const solo = live && typeof REVEAL !== 'undefined' && REVEAL && REVEAL.gbg && REVEAL.cur != null ? REVEAL.cur : null;
  if (!live) ANIM.tr.clear();
  rows.forEach((v, k) => {
    const b = before.get(k); if (!b || !v.tr.animate) return;
    const dy = (b.top - v.top) / zf(), d = b.pos != null && v.pos != null ? b.pos - v.pos : 0;
    /* seulement s'il vient de jouer un trou au-dessus ou en dessous du par : un golfeur simplement dépassé (rang décalé
       d'une place à cause des égalités) glisse sans couleur, sinon tout le tableau se colore */
    if (live && d && b.sig !== v.sig && b.tot !== v.tot && (solo == null || v.id === solo)) ANIM.tr.set(k, { d, t0: now });
    if (live && solo === v.id && d) {   // agrandissement, glissement, puis retour à la taille normale
      const c = d > 0 ? '46,204,113' : '255,107,94', hold = 350, mv = 700, tot = hold + mv + 200;
      v.tr.style.position = 'relative'; v.tr.style.zIndex = 1;
      v.tr.animate([
        { transform: 'translateY(' + dy + 'px) scale(1)', outline: '2px solid rgba(' + c + ',0)', outlineOffset: '-2px', offset: 0 },
        { transform: 'translateY(' + dy + 'px) scale(1.03)', outline: '2px solid rgba(' + c + ',1)', outlineOffset: '-2px', offset: hold / tot },
        { transform: 'translateY(0) scale(1.03)', outline: '2px solid rgba(' + c + ',1)', outlineOffset: '-2px', offset: (hold + mv) / tot },
        { transform: 'none', outline: '2px solid rgba(' + c + ',0)', outlineOffset: '-2px', offset: 1 }], { duration: tot, easing: 'ease-in-out' });
      return;
    }
    if (Math.abs(dy) < 3) return;
    v.tr.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: solo != null ? 700 : ANIM.flip, delay: solo != null ? 350 : 0, easing: ease, fill: 'backwards' });
  });
  // les traînées encore actives (celles de cet affichage et celles des affichages précédents)
  ANIM.tr.forEach((t, k) => {
    const el = now - t.t0, v = rows.get(k); if (el >= ANIM.trail || !v) { if (el >= ANIM.trail) ANIM.tr.delete(k); return; }
    v.tr.classList.add(t.d > 0 ? 'mvu' : 'mvd'); v.tr.style.setProperty('--mvt', (-Math.round(el)) + 'ms');
    const a = v.tr.querySelector('[data-a=golfer][data-id]'), s = document.createElement('span');
    s.className = 'mvb ' + (t.d > 0 ? 'up' : 'dn'); s.textContent = (t.d > 0 ? '▲' : '▼') + Math.abs(t.d); s.setAttribute('aria-hidden', 'true');
    const old = a.parentElement.querySelector('.anmv'); (old || a).after(s);
  });
}
const ANIM_NUM = '#app .dst3 b, #app .mtile b, #app .tzscup b, #app .tzsmon b, #app .seabig, #app .wrk b, #app .recs .rv, #app .board td.tot';
function animCount() {
  const vn = VIEW && VIEW.name;
  document.querySelectorAll(ANIM_NUM).forEach((el, i) => {
    if (el.children.length) return;
    const txt = el.textContent, m = txt.match(/^([^\d−-]*)([−-]?\d[\d\s\u202f\u00a0.,]*?)(\D*)$/); if (!m) return;
    const raw = m[2].trim(), dec = /[.,]\d$/.test(raw) ? 1 : 0, sep = (raw.match(/[\s\u202f\u00a0]/) || [''])[0], comma = raw.indexOf(',') >= 0;
    const to = parseFloat(raw.replace(/[\s\u202f\u00a0]/g, '').replace('−', '-').replace(',', '.')); if (!isFinite(to)) return;
    const tr = el.closest('tr'), g = tr && tr.querySelector('[data-a=golfer][data-id]');
    const key = vn + ':' + (g ? 'g' + g.dataset.id + ':' + el.className : i);
    const from = ANIM.seen.has(key) ? ANIM.seen.get(key) : 0; ANIM.seen.set(key, to);
    if (from === to) return;
    const fmt = v => { let s = Math.abs(v).toFixed(dec); if (comma) s = s.replace('.', ','); if (sep) s = s.replace(/^\d+/, d => d.replace(/\B(?=(\d{3})+(?!\d))/g, sep)); return (v < 0 ? '−' : '') + s; };
    const t0 = performance.now();
    const step = now => {
      if (!el.isConnected) return;
      const k = Math.min(1, (now - t0) / ANIM.count), e = 1 - Math.pow(1 - k, 3);
      el.textContent = k < 1 ? m[1] + fmt(from + (to - from) * e) + m[3] : txt;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}
/* ---- Flèches de la ronde en direct ----
   liveRows() est appelé par l'écran de la ronde pendant son affichage : on garde le dernier résultat (place et
   progression de chaque golfeur), puis on met à jour, golfeur par golfeur :
   - p : sa progression (trous joués, ou le trou du classement s'il n'y a pas d'heures de départ ; un score pas
     encore dévoilé en mode « In sequence » compte pour le trou d'avant) ;
   - base : sa place dans le dernier classement complet (aucun dévoilement en cours) ;
   - dir : quand p augmente, sa place est comparée à base : 'up', 'dn' ou rien ; pendant un dévoilement, la flèche
     suit sa place à mesure que les scores des autres arrivent. Une fois le classement complet, base devient sa
     place, et la flèche reste telle quelle jusqu'à son trou suivant.
   Tout repart de zéro à chaque nouvelle ronde. */
const ARW = { key: null, st: new Map(), cap: null, fresh: new Set() };
function arwUpdate() {
  const cap = ARW.cap; ARW.cap = null; ARW.fresh = new Set();
  const c = S && S.cur; if (!cap || !c) return;
  const key = S.season + ':' + S.t + ':' + c.r; if (key !== ARW.key) { ARW.key = key; ARW.st = new Map(); }
  const settled = typeof REVEAL === 'undefined' || !REVEAL;
  cap.rows.forEach(r => {
    const p = r.n != null ? r.n : cap.k - (r.pending ? 1 : 0), o = ARW.st.get(r.id);
    if (!o) { ARW.st.set(r.id, { p, base: r.pos, dir: null, mark: false }); return; }
    if (p > o.p) { o.p = p; o.mark = true; }
    if (o.mark) { const d = r.pos < o.base ? 'up' : r.pos > o.base ? 'dn' : null; if (d && d !== o.dir) ARW.fresh.add(r.id); o.dir = d; }
    if (settled) { o.base = r.pos; o.mark = false; }
  });
}
function arwPaint() {
  if (!/^(play|spec)$/.test(VIEW && VIEW.name) || !ARW.st.size) return;
  document.querySelectorAll('#app tr [data-a=golfer][data-id]').forEach(a => {
    if (a.closest('.tstand')) return;   // v397 : pas dans le classement de la saison (page des départs)
    const o = ARW.st.get(+a.dataset.id); if (!o || !o.dir) return;
    const s = document.createElement('span'); s.className = 'anmv ' + o.dir; s.textContent = o.dir === 'up' ? '▲' : '▼'; s.setAttribute('aria-hidden', 'true');
    a.after(s);
    if (ARW.fresh.has(+a.dataset.id) && s.animate && !animOff()) s.animate([{ transform: 'scale(1.8)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 350, easing: 'ease-out' });
  });
}
(function arwInit() {
  const base = liveRows;
  liveRows = function (k) { const rows = base.apply(this, arguments); if (ARW.cap !== null) ARW.cap = { k, rows }; return rows; };
})();
(function animInit() {
  const base = render;
  let last = null;   // écran affiché au rendu précédent (VIEW change avant l'appel à render)
  render = function () {
    const before = animOff() ? null : animRows();
    ARW.cap = false;   // capture le dernier liveRows() appelé pendant l'affichage
    let r;
    try { r = base.apply(this, arguments); } finally { try { arwUpdate(); arwPaint(); } catch (e) { } ARW.cap = null; }
    /* v409 : sur PC, l'écran de la ronde est réarrangé après l'affichage (rdLayout : menus, coupure, bande). On le fait
       ici, avant de mesurer les lignes : sinon tout le tableau semblait avoir bougé et chaque ligne glissait à chaque trou. */
    try { if (typeof kmRender === 'function') kmRender(); if (typeof rdLayout === 'function') rdLayout(); } catch (e) { }
    const now = VIEW ? VIEW.name : null, same = now === last; last = now;
    if (before) try {
      if (same) { if (/^(play|spec|tourn|pnPlay)$/.test(now)) animFlip(before, now !== 'tourn'); }
      else { ANIM.tr.clear(); animEnter(); }
      animCount();
    } catch (e) { }
    return r;
  };
})();
