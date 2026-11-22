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
