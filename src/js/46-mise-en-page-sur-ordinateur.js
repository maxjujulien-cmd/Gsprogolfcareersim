/* ============ MISE EN PAGE SUR ORDINATEUR SANS ESPACES VIDES (v386) ============
   Styles dans styles/04-mise-en-page-sur-ordinateur.css. lkMasonry() place les panneaux du tableau de bord
   (accueil) et des Terrains en maçonnerie : chaque panneau garde sa hauteur naturelle et le suivant se glisse
   dessous, sans trou. Le calcul se refait après chaque affichage, redimensionnement, image chargée ou
   section dépliée. Hors style Gestionnaire sur ordinateur, les grilles gardent leur disposition normale. */
const LK_GRIDS = '#app .dash, #app .crfrow';
function lkMasonry() {
  const on = typeof isMgr === 'function' && isMgr();
  for (const g of document.querySelectorAll(LK_GRIDS)) {
    if (!on) {
      if (g.classList.contains('lkmas')) { g.classList.remove('lkmas'); for (const it of g.children) it.style.gridRowEnd = ''; }
      continue;
    }
    if (g.dataset.lkgap === undefined) g.dataset.lkgap = parseFloat(getComputedStyle(g).rowGap) || 0;
    g.classList.add('lkmas');
    const gap = +g.dataset.lkgap;
    for (const it of g.children) {
      const cs = getComputedStyle(it);
      if (cs.display === 'none') continue;
      const h = it.getBoundingClientRect().height / zf() + (parseFloat(cs.marginTop) || 0) + (parseFloat(cs.marginBottom) || 0);
      const span = 'span ' + Math.max(1, Math.ceil(h + gap));
      if (it.style.gridRowEnd !== span) it.style.gridRowEnd = span;
    }
  }
}
let _lkRaf = 0;
function lkSchedule() { if (!_lkRaf) _lkRaf = requestAnimationFrame(() => { _lkRaf = 0; lkMasonry(); }); }
(function lkInit() {
  const app = document.getElementById('app');
  if (app && 'MutationObserver' in window) new MutationObserver(lkSchedule).observe(app, { childList: true, subtree: true, characterData: true });
  window.addEventListener('resize', lkSchedule);
  document.addEventListener('toggle', lkSchedule, true);   // <details> ouverts ou fermés
  document.addEventListener('load', lkSchedule, true);     // images chargées
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(lkSchedule);
  lkSchedule();
})();

/* v436 : fiche rapide au survol d'un nom (maquette A, « mini carte de collection », choix de Max).
   Sur ordinateur seulement (souris) : la carte s'ouvre après une demi-seconde sur n'importe quel nom cliquable
   (data-a="golfer") et se ferme dès que la souris le quitte. Un clic ouvre toujours la fiche complète. */
let HV_T = 0, HV_EL = null;
function hvOrd(n) { return n + (n % 100 >= 11 && n % 100 <= 13 ? 'e' : n === 1 ? 'er' : 'e'); }
function hvCardHTML(id) {
  const g = S.G[id]; if (!g || !g.a) return '';
  const man = id === 0 && S.mode !== 'sim', ti = man ? -1 : tierOf(g), col = ti >= 0 ? TIER_HEX[ti] : '#4E9A3A', l = leagueOf(id);
  const vet = g.a >= 31, pot = man ? '' : vet ? TIERS[peakTierOf(g)][1] : POTS[potOf(g)][1];
  const name = nameOf(id), ini = name.split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
  const hc = hcAt(id), wr = wrPub(id), rk = l >= 0 ? seasonRank(l, id) : 0, st = getSt(id);
  const H = golferHistory(id, true, true).slice(-6).reverse();
  const res = H.map(x => { const mc = x.mc || !x.pos; return '<span class="' + (mc ? 'mc' : x.pos === 1 ? 'w' : x.pos <= 10 ? 't' : '') + '">' + (mc ? 'MC' : x.pos) + '</span>'; }).join('');
  const box = (v, k) => '<div><b>' + v + '</b><span>' + k + '</span></div>';
  return '<div class="hvin" data-c="' + col + '"><div class="hvtop"><div class="hvav">' + (phFrameHTML(id, 'phhv') || '<span>' + esc(ini) + '</span>') + '</div><div class="hvid"><div class="hvnm">' + esc(name) + '</div>' +
    '<div class="hvsub">' + (g.nat ? flagVisual(g.nat, 18) + ' ' : '') + '<span>' + g.a + ' ans</span>' + (g.nat ? ' · <span>' + esc(g.nat) + '</span>' : '') + ' · <span>' + (l >= 0 ? 'L' + (l + 1) : 'Recrues') + '</span></div>' +
    (ti >= 0 ? '<span class="hvtier">' + TIERS[ti][1] + '</span>' : '') + '</div></div>' +
    '<div class="hvst">' + box(hc != null ? fmtHI(hc) : '–', 'HCP') + box(wr ? '#' + wr : 'NC', 'Mondial') + box(rk ? hvOrd(rk) : '–', 'Rang') + box(st.pts || 0, 'Pts') + '</div>' +
    '<div class="hvft">' + (pot ? '<div class="hvk"><span>' + (vet ? 'Sommet en carrière' : 'Potentiel') + '</span> · <b>' + pot + '</b></div>' : '') + (res ? '<div class="hvk">Derniers résultats</div><div class="hvres">' + res + '</div>' : '') + '</div></div>';
}
function hvHide() { clearTimeout(HV_T); HV_EL = null; const t = document.getElementById('hvcard'); if (t) t.hidden = true; }
function hvShow(el) {
  const h = hvCardHTML(+el.dataset.id); if (!h || !document.body.contains(el)) return;
  let t = document.getElementById('hvcard'); if (!t) { t = document.createElement('div'); t.id = 'hvcard'; t.setAttribute('role', 'tooltip'); document.body.appendChild(t); }
  t.innerHTML = h; t.style.setProperty("--hvc", t.firstChild.dataset.c); t.hidden = false; try { trNode(t); } catch (e) { } try { phHydrate(); } catch (e) { }
  const z = zf(), R = el.getBoundingClientRect(), W = window.innerWidth / z, Hh = window.innerHeight / z, w = t.offsetWidth, hh = t.offsetHeight;
  let x = Math.min(W - w - 12, Math.max(12, R.left / z)), y = R.bottom / z + 6;
  if (y + hh > Hh - 8) y = Math.max(8, R.top / z - hh - 6);
  t.style.left = x + 'px'; t.style.top = y + 'px';
}
document.addEventListener('mouseover', e => {
  if (!isPC() || (window.matchMedia && !matchMedia('(hover:hover)').matches)) return;
  const el = e.target.closest && e.target.closest('[data-a="golfer"][data-id]');
  if (el === HV_EL) return; hvHide(); if (!el) return;
  HV_EL = el; HV_T = setTimeout(() => { if (HV_EL === el) hvShow(el); }, 500);
});
document.addEventListener('mouseout', e => { if (HV_EL && !HV_EL.contains(e.relatedTarget) && e.target.closest && e.target.closest('[data-a="golfer"]') === HV_EL) hvHide(); });
['pointerdown', 'scroll', 'keydown'].forEach(k => document.addEventListener(k, hvHide, true));
