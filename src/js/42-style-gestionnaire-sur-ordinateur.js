/* ============ STYLE « GESTIONNAIRE » SUR ORDINATEUR (v194) ============
   Sur grand écran : thème sombre ardoise, menu latéral à gauche, barre du haut (fil d'Ariane, saison, bouton Continuer)
   et tableau de bord en widgets à l'accueil. Les infos restent celles du jeu ; seul l'habillage change.
   Le style classique reste offert (Plus › Affichage). */
let SKIN = 'mgr';
try { SKIN = localStorage.getItem('golf-skin') || 'mgr'; } catch (e) { }
function isMgr() { return isPC() && SKIN === 'mgr'; }
const MICO = {
  home: '<path d="M8 1.5 1.5 7H3v7h3.5V10h3v4H13V7h1.5z"/>',
  leagues: '<path d="M2 14h3V7H2zm4.5 0h3V2h-3zM11 14h3V9h-3z"/>',
  records: '<path d="M3 1.5h8l2 2V14.5H3zM5 6h6M5 9h6M5 12h4" stroke="#12161B" stroke-width="1.2"/>',
  almanac: '<path d="M2 2.5h5.5v11H2zM8.5 2.5H14v11H8.5z"/>',
  golfers: '<circle cx="8" cy="5" r="3"/><path d="M2 15c0-4 3-6 6-6s6 2 6 6z"/>',
  courses: '<path d="M4 1v14" stroke="currentColor" stroke-width="1.6"/><path d="M4.8 1.8l8 3-8 3z"/>',
  watch: '<path d="M8 1.5l2 4.2 4.5.6-3.3 3.1.8 4.5L8 11.7l-4 2.2.8-4.5L1.5 6.3 6 5.7z"/>',
  more: '<circle cx="3" cy="8" r="1.6"/><circle cx="8" cy="8" r="1.6"/><circle cx="13" cy="8" r="1.6"/>',
  hof: '<path d="M1.5 14.5h13M3 14V7.5L8 3l5 4.5V14M6 14v-3.5h4V14" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  rclass: '<path d="M8 1 15 4.5 8 8 1 4.5zM3.5 6v4c0 1.5 2 2.8 4.5 2.8s4.5-1.3 4.5-2.8V6" fill="none" stroke="currentColor" stroke-width="1.5"/>'
};
const mIco = k => '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">' + (MICO[k] || '') + '</svg>';
function mSideHTML(cur) {
  const g0 = S.G[0], pl = plLeague();
  let h = '<div class="msbrand"><img src="' + LOGO_SM + '" alt="">Indoor Golf Career</div>';
  if (g0 || pl >= 0) { const rk = pl >= 0 && (pl !== 4 || rcX(0) < 90) ? seasonRank(pl, 0) : 0;
    h += '<a href="#" class="msme" data-a="golfer" data-id="0"><span class="msav">' + esc((S.name || 'Toi').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()) + '</span><span><b>' + esc(S.name || 'Toi') + '</b><small>' + (g0 ? g0.a + ' ans' : S.pk && S.pk.a ? S.pk.a + ' ans' : 'Joueur') + (rk ? ' · ' + ord(rk) + (pl === 4 ? ' · Recrues' : ' en L' + (pl + 1)) : '') + '</small></span></a>'; }
  if (VIEW.name === 'records' && VIEW.rv === 'hof') cur = '';
  h += TABS.map(([v, l]) => '<button class="tab" data-a="tab" data-v="' + v + '"' + (v === cur ? ' aria-current="page"' : '') + '>' + mIco(v) + '<span>' + l + '</span></button>').join('');
  h += '<div class="mssep"></div><button class="tab" data-a="hof"' + (VIEW.name === 'records' && VIEW.rv === 'hof' ? ' aria-current="page"' : '') + '>' + mIco('hof') + '<span>Temple</span></button>';
  if (S.season > 1) h += '<button class="tab" data-a="rclass" data-s="' + (S.season - 1) + '"' + (VIEW.name === 'rclass' ? ' aria-current="page"' : '') + '>' + mIco('rclass') + '<span>Dernière cuvée</span></button>';
  h += '<div class="msfoot">' + slotSwitchHTML() + '</div>';
  return h;
}
function mTopHTML(cur) {
  cur = cur || 'home';
  const tl = (TABS.find(t => t[0] === cur) || [])[1] || '';
  const sub = { inbox: 'Bo\u00eete de r\u00e9ception', off: 'Intersaison ' + yr(VIEW.s || S.season - 1) + ' → ' + yr((VIEW.s || S.season - 1) + 1), hofCer: 'Cérémonie du Temple', golfer: VIEW.id != null ? nameOf(VIEW.id) : 'Golfeur', tourn: 'Tournoi', journal: 'Journal', seasonEnd: 'Bilan de la saison ' + yr(VIEW.s || S.season - 1), cres: 'Résumé de terrain', rclass: 'Classe de ' + yr((VIEW.s || 0) + 1), play: 'Ronde en cours', spec: 'Simulation', roundEnd: 'Fin de ronde', tournEnd: 'Fin de tournoi', playerCreate: 'Nouveau golfeur' }[VIEW.name];
  const crumb = sub ? esc(tl) + ' <i>›</i> <b>' + esc(sub) + '</b>' : '<b>' + esc(VIEW.name === 'records' && VIEW.rv === 'hof' ? 'Temple de la renommée' : tl) + '</b>';
  const pl = plLeague(), tn = Math.min(S.t + 1, N_TOURN);
  return '<div class="mtnav"><button class="mtar" data-a="backview"' + (NAV.length ? '' : ' disabled') + ' aria-label="Retour">‹</button></div><div class="mtcrumb">' + crumb + '</div>' +
    '<button class="mtsearch" data-a="tab" data-v="golfers">🔍 Rechercher un golfeur…</button>' +
    '<div class="mtdate"><b>Saison ' + yr(S.season) + ' · ' + (S.t >= N_TOURN ? (finalePending() || (S.cur && S.cur.fin) ? 'Finale' : 'saison terminée') : 'Tournoi ' + tn + '/' + N_TOURN + (isMajorT(S.t) ? ' ★' : '')) + '</b><span>' + (S.duo ? 'Duo · ' : '') + (lgNm(pl) || '') + '</span></div>' +
    '<button class="mtfs" data-a="fullscr" aria-label="Plein écran" title="Plein écran">⛶</button><button class="mtgo" data-a="mgrgo">Continuer ▶</button>';
}
function mgrSync(cur) {
  let top = document.getElementById('mtop');
  if (!isMgr() || !S || S.presim) { if (top) top.hidden = true; return; }
  if (!top) { top = document.createElement('header'); top.id = 'mtop'; document.body.insertBefore(top, $tabs); }
  top.hidden = false; top.innerHTML = mTopHTML(cur);
}
function mgrGo() {   // « Continuer » : l'action principale de l'accueil (jouer, reprendre, clôturer la saison…)
  if (VIEW.name === 'off') { const nb = document.querySelector('#app .offoot .btn.next'); if (nb) nb.click(); return; }
  if (VIEW.name === 'po') { const P = S.cur && S.cur.po; if (P && P.w != null) { poBack(); render(); window.scrollTo(0, 0); } return; }   // v394 : « Continuer » ne joue jamais la prolongation à ta place
  if (!/^(home|play|spec|po|roundEnd|tournEnd|seasonEnd|playerCreate|hofCer)$/.test(VIEW.name) || (VIEW.name === 'seasonEnd' && VIEW.arch)) { go('home'); return; }
  const b = document.querySelector('#app .dnext .btn:not(.sec)') || document.querySelector('#app .cols .ca .btn:not(.sec)') || document.querySelector('#app .btn:not(.sec)');
  if (b) b.click();
}
/* ---- Tableau de bord de l'accueil ---- */
const DART = '<svg viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 70 Q100 40 210 62 T400 48 V120 H0Z" fill="#2f6a2a"/><path d="M0 92 Q140 70 260 88 T400 84 V120 H0Z" fill="#244f20"/><ellipse cx="298" cy="86" rx="54" ry="8" fill="#8cc46c" opacity=".8"/><line x1="306" y1="86" x2="306" y2="44" stroke="#fff" stroke-width="1.6"/><path d="M306 44 L326 51 L306 58Z" fill="#E8B931"/></svg>';
function dPanel(t, body, link, cls) { return '<section class="dpn' + (cls ? ' ' + cls : '') + '"><header><span>' + t + '</span>' + (link || '') + '</header><div class="dpb">' + body + '</div></section>'; }

