/* ============ ASSISTANT DE NOUVELLE PARTIE (v404) ============
   Choix du propriétaire (option B parmi quatre maquettes) : « Nouvelle partie » se fait en trois étapes.
   1. Comment tu joues : mode (manuel, simulé, duo) et arrivée sur le circuit (dès maintenant ou plus tard).
   2. Le circuit : ton défi / ton handicap (il règle la force des joueurs du circuit), réglages de la carrière,
      Majeurs, format, terrains, année et saisons d'histoire.
   3. Ton golfeur : nom, nationalité, âge, ligue de départ. Étape sautée si l'arrivée est « plus tard » (on commence
      directement à la fin de l'étape 2).
   nfWizard() range les champs du formulaire d'origine (vNew) dans les trois étapes, sans les recréer : tout ce qui
   lit le formulaire (newFormSave, act 'start') continue de fonctionner. L'étape courante est gardée dans VIEW.nstep. */
function nfWizard() {
  if (!(VIEW && (VIEW.name === 'new' || !S))) return;
  const blk = document.querySelector('#app .narrow > .block:not(.menucont)'); if (!blk || !blk.querySelector('#nm') || blk.dataset.nfw) return;
  blk.dataset.nfw = '1';
  const K = [...blk.children];
  const grp = (lab, n) => { const i = K.findIndex(e => e.tagName === 'LABEL' && e.textContent.trim().startsWith(lab)); return i < 0 ? [] : K.slice(i, i + n); };
  const one = sel => { const e = blk.querySelector(sel); return e ? [e] : []; };
  const later = VIEW.narr === 'later', duo = VIEW.mode === 'duo';
  const nm = K.slice(0, K.findIndex(e => e.tagName === 'LABEL' && /arrivée|Ligue de départ|Mode/.test(e.textContent)) >>> 0 || 2);
  const sec = (title, parts) => { const s = document.createElement('div'); s.className = 'nfsec'; if (title) { const h = document.createElement('h3'); h.textContent = title; s.appendChild(h); } parts.flat().forEach(e => e && s.appendChild(e)); return s.children.length > (title ? 1 : 0) ? s : null; };
  const lgEls = (() => { const s = blk.querySelector('#lg'); if (!s) return []; const l = s.previousElementSibling; return l && l.tagName === 'LABEL' ? [l, s] : [s]; })();
  const histRow = blk.querySelector('#presim') ? blk.querySelector('#presim').closest('.row') : null;
  const steps = [
    { t: 'Comment tu joues', s: [sec('', [grp('Mode', 3), grp('Ton arrivée', 3)])] },
    { t: 'Le circuit', s: [sec('', [one('#lvlwrap')]), sec('La carrière', [grp('Réglages', 3), grp('Points des Majeurs', 3), grp('Format', 3)]), sec('Les terrains', [one('.nfcrs')]), sec('L’histoire du circuit', [histRow ? [histRow] : [], one('#presimHint')])] },
    { t: duo ? 'Votre équipe' : 'Ton golfeur', s: [sec('', [nm, lgEls])] }
  ];
  const start = blk.querySelector('button[data-a="start"]');
  const conf = blk.querySelector('#newconf');
  const last = later && !duo ? 1 : 2;   // « plus tard » : pas d'étape « ton golfeur »
  const box = document.createElement('div'); box.className = 'nfwiz';
  const bar = document.createElement('div'); bar.className = 'nfstep';
  steps.forEach((st, i) => { if (i > last) return; const b = document.createElement('button'); b.type = 'button'; b.dataset.nfs = i; b.innerHTML = '<b><span>Étape</span> ' + (i + 1) + '</b><span>' + st.t + '</span>'; bar.appendChild(b); });
  box.appendChild(bar);
  steps.forEach((st, i) => {
    const pg = document.createElement('div'); pg.className = 'nfpage'; pg.dataset.p = i;
    const h = document.createElement('div'); h.className = 'nfh'; h.textContent = st.t; pg.appendChild(h);
    st.s.filter(Boolean).forEach(x => pg.appendChild(x));
    if (i <= last) {
      const nav = document.createElement('div'); nav.className = 'nfnav';
      if (i > 0) { const bk = document.createElement('button'); bk.type = 'button'; bk.className = 'btn sec'; bk.dataset.nfs = i - 1; bk.textContent = '‹ Retour'; nav.appendChild(bk); }
      if (i < last) { const nx = document.createElement('button'); nx.type = 'button'; nx.className = 'btn'; nx.dataset.nfs = i + 1; nx.textContent = i + 1 === 2 ? (duo ? 'Suivant : votre équipe ›' : 'Suivant : crée ton golfeur ›') : 'Suivant ›'; nav.appendChild(nx); }
      else if (start) { start.style.marginTop = '0'; nav.appendChild(start); }
      pg.appendChild(nav);
      if (i === last && conf) pg.appendChild(conf);
    } else pg.hidden = true;
    box.appendChild(pg);
  });
  [...blk.children].forEach(e => e.remove()); blk.appendChild(box); blk.classList.add('nfblk');
  if (typeof trNode === 'function' && LANG === 'en') trNode(blk);
  nfShow(Math.min(VIEW.nstep || 0, last));
}
function nfShow(i) {
  VIEW.nstep = i;
  document.querySelectorAll('#app .nfpage').forEach(p => { p.hidden = +p.dataset.p !== i || p.dataset.skip === '1'; });
  document.querySelectorAll('#app .nfstep > button').forEach(b => { const k = +b.dataset.nfs; b.className = k === i ? 'on' : k < i ? 'ok' : ''; });
  // Retour au menu, import d'une sauvegarde, etc. : seulement à la première étape
  const nar = document.querySelector('#app .narrow'); if (nar) [...nar.parentElement.children].forEach(e => { if (e !== nar && e.closest && !e.classList.contains('top') && e.tagName !== 'NAV') e.classList.toggle('nfoff', i > 0); });
  if (nar) [...nar.children].forEach(e => { if (!e.classList.contains('nfblk') && !e.classList.contains('menucont')) e.classList.toggle('nfoff', i > 0); });
  window.scrollTo(0, 0);
}
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('#app [data-nfs]'); if (!b) return;
  e.preventDefault(); try { newFormSave(); } catch (x) { } nfShow(+b.dataset.nfs);
});
(function nfInit() {
  const base = render;
  render = function () { const r = base.apply(this, arguments); try { nfWizard(); } catch (e) { } return r; };
})();
