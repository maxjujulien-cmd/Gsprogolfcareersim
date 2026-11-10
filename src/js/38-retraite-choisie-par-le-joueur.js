/* ======== Retraite choisie par le joueur (mode simulé) ========
   Jamais décidée au hasard : le bouton apparaît à l'intersaison (page de fin de saison, et l'accueil tant que le premier
   tournoi n'est pas commencé). Après la retraite : nouveau golfeur tout de suite, ou mode spectateur (le circuit continue,
   on simule tournois et saisons, et on peut créer un nouveau golfeur au début de n'importe quelle saison). */
function canRetire() { return !!S && (S.mode !== 'sim' || !!S.G[0]) && leagueOf(0) >= 0 && S.t === 0 && !S.cur && !S.presim; }
/* Bilan de la carrière en cours (les deux modes) : saisons terminées, titres, gains, âge (mode simulé seulement) */
function careerNow() {
  const g = S.G[0], c0 = careerStart(0), h = golferHistory(0), seasons = new Set(h.map(x => x.s));
  return { a: g ? g.a : null, cs: Math.max(1, seasons.size), cw: h.filter(x => x.pos === 1).length, ce: h.reduce((a, x) => a + (x.pay || 0), 0) };
}
function retireBlock() {
  const k = careerNow();
  return '<div class="block retblk"><h3 style="margin-top:0">Ta carri\u00e8re</h3><p class="small mute" style="margin:0 0 10px">' + esc(S.name) + (k.a ? ' a ' + k.a + ' ans' : ' compte ' + k.cs + ' saison' + (k.cs > 1 ? 's' : '') + ' sur le circuit') + '. La retraite ne te sera jamais impos\u00e9e : c\u2019est toi qui d\u00e9cides, entre deux saisons.</p><button class="btn danger sm" data-a="retireask" style="width:100%">Prendre ma retraite</button></div>';
}
function retireModal() {
  const k = careerNow(), cs = k.cs, cw = k.cw;
  return '<div class="modalbg" role="presentation"><div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="retT" aria-describedby="retD"><h3 id="retT">Prendre ta retraite ?</h3>' +
    '<p id="retD">' + esc(S.name) + ' quitte le circuit' + (k.a ? ' \u00e0 ' + k.a + ' ans,' : '') + ' apr\u00e8s ' + cs + ' saison' + (cs > 1 ? 's' : '') + (cw ? ' et ' + cw + ' titre' + (cw > 1 ? 's' : '') : '') + '. <b>C\u2019est d\u00e9finitif</b> : ' + (S.mode === 'sim' ? 'ce golfeur ne pourra plus jouer.' : 'cette carri\u00e8re est termin\u00e9e.') + '</p>' +
    '<p class="small mute">Ensuite, tu pourras ' + (S.mode === 'sim' ? 'cr\u00e9er un nouveau golfeur' : 'recommencer une carri\u00e8re') + ' ou simuler les saisons suivantes.</p>' +
    '<button class="btn danger" data-a="retireok">Oui, prendre ma retraite</button><button class="btn sec" id="retno" data-a="retireno">Annuler</button></div></div>';
}
function retirePlayer() {
  if (!canRetire()) return false;
  const g = S.G[0], k = careerNow(), H = S.hist[S.season - 2], E = H && H.end;
  const l = E && E.from >= 0 ? E.from : leagueOf(0);
  S.playerCareers = S.playerCareers || [];
  S.playerCareers.push({ n: S.name, nat: g ? g.nat || '' : S.nat || '', a: k.a, s: S.season - 1, cs: k.cs, cw: k.cw, l, ce: k.ce, vol: 1 });
  if (!g) S.pk = { cur: [0, 0, 0], best: [0, 0, 0], cw: 0, earn: 0 };   // mode « je joue moi-même » : le carnet, les séries et les gains repartent à zéro pour la prochaine carrière
  if (E) { E.to = -1; E.vret = 1; }   // la fin de saison affiche maintenant la fin de carrière
  for (let k = 0; k < 4; k++) S.L[k] = S.L[k].filter(id => id !== 0);
  delete S.G[0]; delete S.st[0];
  S.news.unshift({ s: S.season - 1, t: 0, text: S.name + (k.a ? ' (' + k.a + ' ans)' : '') + ' annonce sa retraite.', l: -1, ids: [] });
  S.spect = true; S.needsPlayerCreate = false;
  topUpLeagues();   // le poste libéré est comblé (promotion d'une ligue à l'autre, recrue en Ligue 4)
  persist();
  return true;
}
/* ---- Mode spectateur : le circuit continue sans golfeur du joueur ---- */
function spectTournament() {
  if (S.cur || S.t >= N_TOURN) return;
  presimTournament();
  if (S.t >= N_TOURN) { doSeasonEnd(); render(); window.scrollTo(0, 0); return; }
  persist(); go('home'); toast('Tournoi ' + S.t + ' simul\u00e9');
}
function spectRest() {
  if (S.cur) return;
  while (S.t < N_TOURN) presimTournament();
  doSeasonEnd(); render(); window.scrollTo(0, 0);
}
let SPECT_RUN = null;
function spectProgressHTML() {
  const P = SPECT_RUN, done = P.n - P.left;
  return scene() + '<div class="wrap sc"><div class="top"><div><h1>Le circuit continue</h1><div class="ctx">Saison ' + yr(S.season) + ' \u00b7 ' + done + ' sur ' + P.n + '</div></div></div><div class="narrow"><div class="block">' +
    '<span class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="' + P.n + '" aria-valuenow="' + done + '" style="height:12px;margin:4px 0 10px"><i style="width:' + Math.round(done / P.n * 100) + '%"></i></span>' +
    '<p class="small mute" style="margin:0">Les saisons se jouent entre les golfeurs du circuit. Tu arriveras en ' + yr(S.season - done + P.n) + ', pr\u00eat \u00e0 cr\u00e9er un nouveau golfeur si tu le veux.</p></div></div></div>';
}
function runSpect(n) {
  if (SPECT_RUN || S.cur) return;
  SPECT_RUN = { n, left: n }; $tabs.hidden = true;
  const step = () => {
    if (SPECT_RUN.left <= 0) { SPECT_RUN = null; go('home'); toast(n + ' saison' + (n > 1 ? 's' : '') + ' simul\u00e9e' + (n > 1 ? 's' : '') + ' \u00b7 bienvenue en ' + yr(S.season)); return; }
    while (S.t < N_TOURN) presimTournament();
    doSeasonEnd(); SPECT_RUN.left--; persistNow();
    $app.innerHTML = spectProgressHTML(); setTimeout(step, 0);
  };
  $app.innerHTML = spectProgressHTML(); setTimeout(step, 30);
}
function vSpect() {
  const c = curCourse(), last = (S.playerCareers || [])[S.playerCareers.length - 1];
  let h = '<div class="top"><div><h1>Saison ' + yr(S.season) + '</h1><div class="ctx">' + (last ? esc(last.n) + ' est \u00e0 la retraite' : S.mode !== 'sim' ? 'Tu n\u2019es pas encore sur le circuit' : 'Aucun golfeur en activit\u00e9') + ' \u00b7 le circuit continue</div></div></div>';
  let L = '', R = '';
  const cu = S.cur && S.cur.sw ? S.cur : null;
  if (S.t >= N_TOURN && !cu && finalePending()) {   // v324 : la Finale se regarde aussi en mode spectateur
    const fc = finCourse(), ff = finField();
    L += '<div class="block hero"><div class="ctx">\ud83c\udfc6 Finale \u00b7 top ' + FIN.n + ' de la Ligue 1</div><div class="big">' + esc(fc.name) + '</div><div class="mute">Par ' + parTotal(fc.pars) + ' \u00b7 ' + ff.length + ' golfeurs \u00b7 aucune coupure \u00b7 points doubl\u00e9s \u00b7 la plus grosse bourse de l\u2019ann\u00e9e</div>' + courseMeta(fc) +
      '<button class="btn" data-a="spr">Simuler la ronde 1 trou par trou</button><button class="btn sec" data-a="r1fast">Simuler la ronde 1 d\u2019un coup</button><button class="btn sec" data-a="finsim">Voir le r\u00e9sultat de la Finale</button></div>';
  } else if (S.t >= N_TOURN && !cu) { const F = seasonHist().fin, fw = F && F.lg && F.lg[0] && F.lg[0].rows[0];
    L += '<div class="block hero"><div class="big">Saison termin\u00e9e</div><p class="mute">' + (fw ? 'La Finale est jou\u00e9e : <a href="#" data-a="tourn" data-s="' + S.season + '" data-t="' + N_TOURN + '" data-l="0">' + esc(nameOf(fw[0])) + ' l\u2019emporte</a>. ' : 'Les dix tournois sont jou\u00e9s. ') + 'Place aux promotions et aux rel\u00e9gations.</p><button class="btn" data-a="sps">Terminer la saison \u203a</button></div>'; }
  else if (cu) {   // v292 : tournoi suivi en direct
    const bt = cu.phase === 'po' ? '<button class="btn" data-a="poview">Reprendre la prolongation</button>' : cu.phase === 'cut' ? '<button class="btn" data-a="spec">Simuler la ronde 2 trou par trou</button><button class="btn sec" data-a="finish">Simuler la ronde 2 d\u2019un coup</button>'
      : '<button class="btn" data-a="resumespec">Reprendre la simulation \u00b7 trou ' + (cu.k2 + 1) + '</button><button class="btn sec" data-a="finish">Simuler le reste de la ronde</button><button class="btn sec" data-a="simtourn" style="margin-top:2px">Simuler le reste du tournoi</button>';
    L += '<div class="block hero"><div class="ctx"><span>Tournoi ' + (S.t + 1) + ' sur ' + N_TOURN + '</span> \u00b7 <span>en direct</span></div><div class="big">' + esc(cu.name) + '</div><div class="mute"><span>Par ' + parTotal(cu.pars) + '</span> \u00b7 <span>Ligue suivie :</span> <span>' + esc(LEAGUE_NAMES[cu.pl]) + '</span></div>' + bt + '</div>';
  } else L += '<div class="block hero"><div class="ctx">Tournoi ' + (S.t + 1) + ' sur ' + N_TOURN + '</div><div class="big">' + esc(c.name) + '</div><div class="mute">Par ' + parTotal(c.pars) + ' \u00b7 les quatre ligues jouent sans toi</div>' +
    '<p class="small mute" style="margin:12px 0 4px">Ligue \u00e0 suivre en direct</p>' + chipRow([0, 1, 2, 3].map(l => [String(l), LEAGUE_SHORT[l]]), String(spwL()), 'spwl') +
    '<button class="btn" data-a="spr">Simuler la ronde 1 trou par trou</button>' +
    '<button class="btn sec" data-a="r1fast">Simuler la ronde 1 d\u2019un coup</button>' +
    '<button class="btn sec" data-a="spt">Simuler le tournoi</button><button class="btn sec" data-a="sps">' + (S.t ? 'Simuler la fin de la saison' : 'Simuler la saison') + '</button>' +
    '<label for="spnum">Plusieurs saisons d\u2019un coup</label><div class="row" style="align-items:stretch"><input type="number" id="spnum" min="1" max="' + PRESIM_MAX + '" value="5" inputmode="numeric" style="flex:0 0 90px"><button class="btn sec" data-a="spn" style="margin:0;min-height:46px">Simuler</button></div></div>';
  const man = S.mode !== 'sim';
  const first = !last;
  if (!cu) L += '<div class="block"><h3 style="margin-top:0">' + (first ? 'Ton arriv\u00e9e sur le circuit' : man ? 'Nouvelle carri\u00e8re' : 'Nouveau golfeur') + '</h3>' + (S.t === 0
    ? '<p class="small mute" style="margin:0 0 8px">' + (first ? 'Ton joueur fera ses d\u00e9buts' : man ? 'Elle d\u00e9butera' : 'Il fera ses d\u00e9buts') + ' en ' + yr(S.season) + '.</p><button class="btn" data-a="newgolfer">' + (first ? (man ? 'Cr\u00e9er mon joueur' : 'Cr\u00e9er mon golfeur') : man ? 'Recommencer une carri\u00e8re' : 'Cr\u00e9er un nouveau golfeur') + '</button>'
    : '<p class="small mute" style="margin:0">Possible au d\u00e9but d\u2019une saison : termine celle-ci pour ' + (first ? 'cr\u00e9er ton joueur, qui d\u00e9butera' : man ? 'recommencer une carri\u00e8re qui d\u00e9butera' : 'cr\u00e9er un golfeur qui d\u00e9butera') + ' en ' + yr(S.season + 1) + '.</p>') + '</div>';
  L += '<h2>Classement \u00b7 ' + LEAGUE_SHORT[0] + '</h2>' + standingsBoard(0) + '<button class="btn sec" data-a="league" data-v="0">Voir les ligues</button>';
  if (!cu) try { R += previewHTML(spwL()); } catch (e) { }
  if (S.last) {
    const t = S.hist[S.last.s - 1] && S.hist[S.last.s - 1].t[S.last.t];
    if (t) { const sm = getSum(t, 0); R += '<h2>Dernier tournoi</h2><div class="block"><h3 style="margin-top:0">' + esc(t.name) + ' \u00b7 ' + LEAGUE_SHORT[0] + '</h3><p style="margin:6px 0 4px"><b>' + sumTxt(sm.head) + '</b> <span class="mute small">' + esc(sm.sub) + '</span></p>' + sumList(sm.st.slice(0, 2), true) + '<p class="small" style="margin:8px 0 0"><a href="#" data-a="tourn" data-s="' + S.last.s + '" data-t="' + S.last.t + '" data-l="0">R\u00e9sum\u00e9 et r\u00e9sultats complets</a> \u00b7 <a href="#" data-a="journal">Journal</a></p></div>'; }
  }
  ibxSync();
  if (ibxVis().length) R += '<h2>Dans le monde du golf</h2><ul class="news">' + ibxVis().slice(0, 6).map(n => '<li' + (n.rd ? '' : ' class="un"') + '>' + newsHTML(n.text, n.ids) + '</li>').join('') + '</ul><button class="btn sec" data-a="ibx"><span>Bo\u00eete de r\u00e9ception</span>' + (ibxUnread() ? ' <span class="ibbadge">' + ibxUnread() + '</span>' : '') + '</button>';
  return h + cols(L, R);
}

