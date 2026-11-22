/* ============ v269 : terrains de la carrière, choisis à la création ============
   Les filtres du tirage et le « terrain neutre » (moyen) se règlent avant de commencer. Par défaut, le terrain neutre
   suit les filtres : c'est la moyenne des tees qui seront tirés (un par terrain, le plus proche du neutre),
   pour que le niveau des golfeurs simulés (et ton handicap) corresponde au genre de terrains que tu joueras. */
function nfCrf() { if (!VIEW.ncrf) { const s = crfSaved() || {}; VIEW.ncrf = {}; Object.keys(CRF_DEF).forEach(k => { VIEW.ncrf[k] = s[k] != null ? s[k] : CRF_DEF[k]; }); } return VIEW.ncrf; }
function nfPool(f) { const tees = Array.isArray(f.tees) && f.tees.length ? new Set(f.tees) : null; return BANK.filter(b => { const p = parTotal(b.pars); return (!tees || tees.has(b.tee)) && b.dist >= f.dmin && b.dist <= f.dmax && b.cr >= f.crmin && b.cr <= f.crmax && b.slope >= f.smin && b.slope <= f.smax && p >= f.pmin && p <= f.pmax; }); }
function nfNeutral(f) {
  const pool = nfPool(f); if (!pool.length) return null;
  const by = {}; pool.forEach(b => { (by[normName(b.name)] = by[normName(b.name)] || []).push(b); });
  const cr72 = b => b.cr - parTotal(b.pars) + 72, mean = (a, fn) => a.reduce((s, x) => s + fn(x), 0) / a.length;
  let ref = { cr: mean(pool, cr72), sl: mean(pool, b => b.slope), d: mean(pool, b => b.dist) };
  for (let it = 0; it < 3; it++) {
    const pick = Object.values(by).map(ts => ts.reduce((a, b) => { const g = x => Math.abs(cr72(x) - ref.cr) + Math.abs(x.dist - ref.d) / (CFG.distStep || 600) + Math.abs(x.slope - ref.sl) / 15; return g(b) < g(a) ? b : a; }));
    ref = { cr: mean(pick, cr72), sl: mean(pick, b => b.slope), d: mean(pick, b => b.dist), n: pick.length };
  }
  return { cr: Math.round(ref.cr * 10) / 10, sl: Math.round(ref.sl), d: Math.round(ref.d / 10) * 10, n: ref.n, t: pool.length };
}
function nfNeu() { const f = nfCrf(), a = nfNeutral(f); if (!VIEW.nneu || VIEW.nneu.auto) VIEW.nneu = Object.assign({ auto: true }, a ? { cr: a.cr, sl: a.sl, d: a.d } : { cr: 70.3, sl: 126, d: 6070 }); return VIEW.nneu; }
function nfCountTxt() { const a = nfNeutral(nfCrf()); return a ? a.t + ' tee' + (a.t > 1 ? 's' : '') + ' correspondent (' + a.n + ' terrain' + (a.n > 1 ? 's' : '') + ')' : 'Aucun terrain ne correspond à ces filtres'; }
function nfCoursesHTML() {
  if (!BANK.length) return '';
  const f = nfCrf(), N = nfNeu(), num = (k, step) => '<input type="number" data-c="nfcrf" data-k="' + k + '" step="' + step + '" value="' + f[k] + '" aria-label="' + k + '">';
  const rowR = (l, a, b, st) => '<div class="nfr"><span>' + l + '</span>' + num(a, st) + '<span class="mute">à</span>' + num(b, st) + '</div>';
  const cnt = {}; BANK.forEach(b => { cnt[b.tee] = (cnt[b.tee] || 0) + 1; });
  const tl = Object.keys(cnt).sort((a, b) => teeRank(a) - teeRank(b) || a.localeCompare(b)), sel = Array.isArray(f.tees) && f.tees.length ? new Set(f.tees) : null;
  const tees = '<div class="crftees"><span class="crftl">Tees</span><button class="crft all' + (!sel ? ' on' : '') + '" data-a="nftee" data-v="*" aria-pressed="' + !sel + '">Tous les tees</button>' + tl.map(t => { const c = TEE_COLORS[t] || ['var(--bg)', 'var(--ink)'], on = !!(sel && sel.has(t)); return '<button class="crft' + (on ? ' on' : '') + '" data-a="nftee" data-v="' + esc(t) + '" aria-pressed="' + on + '"><i style="background:' + c[0] + '"></i>' + esc(t) + ' <small>' + cnt[t] + '</small></button>'; }).join('') + '</div>';
  const neu = (k, l, step, v) => '<div class="nfr"><span>' + l + '</span><input type="number" id="nfneu-' + k + '" data-c="nfneu" data-k="' + k + '" step="' + step + '" value="' + v + '" inputmode="decimal"></div>';
  return '<details class="nfcrs"' + (VIEW.nfOpen ? ' open' : '') + ' data-c="nfopen"><summary>Terrains de la carrière</summary>' +
    '<p class="small mute" style="margin:6px 0 8px">Les filtres du tirage des terrains (un terrain différent par tournoi), aussi modifiables plus tard dans Terrains.</p>' +
    rowR('Distance (verges)', 'dmin', 'dmax', 50) + rowR('Course rating', 'crmin', 'crmax', 0.1) + rowR('Slope', 'smin', 'smax', 1) + rowR('Par', 'pmin', 'pmax', 1) + tees +
    '<p class="small" id="nfcount" style="margin:6px 0 0"><b>' + nfCountTxt() + '</b></p>' +
    '<h3 style="margin:14px 0 2px">Terrain moyen</h3><p class="small mute" style="margin:0 0 6px">Un terrain avec ces valeurs n’a aucun effet sur les scores ; les autres jouent plus difficile ou plus facile. Les simulations (et l’histoire du circuit) se basent dessus.</p>' +
    chipRow([['auto', 'D’après les filtres'], ['man', 'Personnalisé']], N.auto ? 'auto' : 'man', 'nfneumode') +
    neu('cr', 'Course rating (par 72)', 0.1, N.cr) + neu('sl', 'Slope', 1, N.sl) + neu('d', 'Distance (verges)', 10, N.d) +
    '<p class="small mute" id="nfneuh" style="margin:4px 0 0">' + (N.auto ? 'Moyenne des tees qui seront tirés avec ces filtres. Modifie une valeur pour la personnaliser.' : 'Valeurs personnalisées.') + '</p></details>';
}
function nfRefresh() {
  const N = nfNeu(), c = document.getElementById('nfcount'); if (c) c.innerHTML = '<b>' + esc(nfCountTxt()) + '</b>';
  [['cr', N.cr], ['sl', N.sl], ['d', N.d]].forEach(([k, v]) => { const e = document.getElementById('nfneu-' + k); if (e && document.activeElement !== e) e.value = v; });
}
function vNew() {
  const mode = VIEW.mode === 'sim' ? 'sim' : VIEW.mode === 'duo' ? 'duo' : 'manual';
  const cont = S ? '<div class="narrow"><div class="block menucont"><div class="ctx">Partie en cours</div><p style="margin:2px 0 8px"><b>' + esc(S.name || '') + '</b> \u00b7 <span>' + (S.duo ? 'Duo' : S.mode === 'sim' ? 'Joueur simul\u00e9' : 'Joueur manuel') + '</span> \u00b7 <span>Saison ' + yr(S.season) + '</span> \u00b7 <span>Tournoi ' + Math.min(S.t + 1, N_TOURN) + '/' + N_TOURN + '</span></p><button class="btn" data-a="menuback" style="margin:0">Continuer ma partie</button></div></div>' : '';
  return '<div class="wrap sc"><div class="top lgtop"><div><img class="newlogo" src="' + LOGO_BIG + '" alt="Indoor Golf Career"><div class="ctx">Quatre ligues \u00b7 dix tournois par saison</div></div>' + langPickHTML() + '</div>' + cont + '<p class="mute" style="margin-top:8px">Une saison de dix tournois contre des adversaires simul\u00e9s.</p>' +
    '<div class="narrow"><div class="block"><label for="nm">' + (mode === 'duo' ? 'Nom de l\u2019\u00e9quipe' : 'Ton nom') + '</label><input type="text" id="nm" value="' + (mode === 'duo' ? 'Max & fils' : 'Joe Random') + '" maxlength="30" autocomplete="off">' +
    (mode === 'manual' ? '<label for="nnat">Nationalit\u00e9</label>' + natSelectHTML('nnat', '') + '<label for="nage">\u00c2ge</label><input type="number" id="nage" value="22" min="15" max="50" inputmode="numeric">' : '') +
    (mode === 'duo' ? '' : '<label>Ton arriv\u00e9e sur le circuit</label>' + chipRow([['now', 'D\u00e8s maintenant'], ['later', 'Plus tard']], VIEW.narr === 'later' ? 'later' : 'now', 'setarr') +
      '<p class="small mute" style="margin:4px 0 0">' + (VIEW.narr === 'later' ? 'Tu commences sans joueur : simule tranquillement les saisons, tournoi par tournoi ou plusieurs d\u2019un coup, et cr\u00e9e ton joueur au d\u00e9but de n\u2019importe quelle saison (\u00e0 la fin d\u2019une intersaison, par exemple). Tu choisiras alors un joueur manuel ou simul\u00e9, et sa ligue de d\u00e9part.' : 'Ton joueur fait ses d\u00e9buts d\u00e8s la premi\u00e8re saison.') + '</p>') +
    (VIEW.narr === 'later' && mode !== 'duo' ? '' : '<label for="lg">Ligue de d\u00e9part</label>') + '<select id="lg"' + (VIEW.narr === 'later' && mode !== 'duo' ? ' hidden' : '') + '><option value="4">Classe de recrues \u00b7 ton index d\u00e9cide de ta ligue</option><option value="3"' + (mode === 'duo' ? '' : ' selected') + '>Ligue 4 \u00b7 Amateur</option><option value="2">Ligue 3 \u00b7 Semi-Pro</option><option value="1">Ligue 2 \u00b7 Pro</option><option value="0"' + (mode === 'duo' ? ' selected' : '') + '>Ligue 1 \u00b7 Tour</option></select>' +
    '<label style="margin-top:14px;user-select:none;-webkit-user-select:none" data-a="duokey">Mode</label><div class="chips" role="group" aria-label="Mode de jeu">' +
    '<button class="chip' + (mode === 'manual' ? ' on' : '') + '" data-a="setmode" data-v="manual" aria-pressed="' + (mode === 'manual') + '">Joueur manuel</button>' +
    '<button class="chip' + (mode === 'sim' ? ' on' : '') + '" data-a="setmode" data-v="sim" aria-pressed="' + (mode === 'sim') + '">Joueur simul\u00e9</button>' +
    (duoOn() || mode === 'duo' ? '<button class="chip' + (mode === 'duo' ? ' on' : '') + '" data-a="setmode" data-v="duo" aria-pressed="' + (mode === 'duo') + '">Duo</button>' : '') + '</div>' +
    '<p class="small mute" style="margin:4px 0 0">' + (mode === 'duo' ? 'Vous jouez un seul golfeur \u00e0 deux (meilleure balle). Tournois d\u2019une ronde : les 65 premiers sont pay\u00e9s en vrais dollars dans la tirelire. Cette partie est gard\u00e9e \u00e0 part de ta carri\u00e8re.' : mode === 'sim' ? 'Tu cr\u00e9es un golfeur et tu suis sa carri\u00e8re : les trous et les rondes se simulent au lieu d\u2019entrer tes propres scores.' : 'Tu joues sur ton simulateur et tu entres tes scores trou par trou.') + '</p>' +
    '<div id="lvlwrap">' + lvlBoxHTML() + '</div>' +
    (mode === 'duo' ? '' : '<label style="margin-top:14px">R\u00e9glages de la carri\u00e8re</label>' + chipRow(['real', 'dyn', 'arc'].map(k => [k, ADV_PRESETS[k].t]), VIEW.npre || 'real', 'npre') +
      '<p class="small mute" style="margin:4px 0 0">' + ADV_PRESETS[VIEW.npre || 'real'].d + ' Ajustables dans Options \u203a Avanc\u00e9 jusqu\u2019\u00e0 ton premier tournoi, puis verrouill\u00e9s.</p>') +
    (mode === 'duo' ? '' : '<label style="margin-top:14px">Points des Majeurs (Ligue 1)</label>' + chipRow([['1', '\u00d71'], ['1.25', '\u00d71,25'], ['1.5', '\u00d71,5'], ['2', '\u00d72']], VIEW.nmaj || '1.25', 'setmaj') +
      '<p class="small mute" style="margin:4px 0 0">' + ({ '1': 'Les 4 Majeurs rapportent autant de points que les autres tournois (la bourse reste \u00d71,5).', '1.25': 'Les 4 Majeurs valent environ 40 % des points de la saison (bourse \u00d71,5) : de gros rendez-vous, sans d\u00e9cider seuls du champion.', '1.5': 'Les 4 Majeurs valent environ la moiti\u00e9 des points de la saison : gros rendez-vous, mais une saison r\u00e9guli\u00e8re peut gagner le titre.', '2': 'Les 4 Majeurs valent pr\u00e8s de 60 % des points de la saison : ils d\u00e9cident souvent du champion.' })[VIEW.nmaj || '1.25'] + '</p>') +
    (mode === 'duo' ? '' : '<label style="margin-top:14px">Format des tournois</label>' + chipRow([[2, '2 rondes \u00b7 coupure'], [1, '1 ronde \u00b7 plus rapide']], VIEW.fmt === 1 ? 1 : 2, 'setfmt') +
      '<p class="small mute" style="margin:4px 0 0">' + (VIEW.fmt === 1 ? 'Une seule ronde par tournoi : tout le monde est class\u00e9, les 65 premiers (et les \u00e9galit\u00e9s) re\u00e7oivent points et bourse. Deux fois plus rapide.' : 'Ronde 1, coupure aux 65 premiers (et les \u00e9galit\u00e9s), puis ronde 2.') + '</p>') +
    nfCoursesHTML() +
    '<div class="row" style="margin-top:14px;align-items:flex-end"><div><label for="startyear" style="margin-top:0">Ann\u00e9e d\u2019arriv\u00e9e</label><input type="number" id="startyear" value="' + new Date().getFullYear() + '" min="1900" max="3000" inputmode="numeric"></div>' +
    '<div><label for="presim" style="margin-top:0">Saisons d\u2019histoire</label><input type="number" id="presim" value="0" min="0" max="' + PRESIM_MAX + '" inputmode="numeric"></div></div>' +
    '<p class="small mute" id="presimHint" style="margin:6px 0 0">' + presimHint() + '</p>' +
    '<button class="btn" data-a="start" style="margin-top:18px">' + (mode === 'duo' ? 'Commencer la partie Duo' : 'Commencer la carri\u00e8re') + '</button>' +
    (S ? '<div class="block newconf" id="newconf" hidden style="border:1.5px solid var(--bad);margin-top:10px"><p style="margin:0 0 8px"><b>Remplacer ta partie en cours ?</b> Elle sera effac\u00e9e. Exporte-la d\u2019abord dans Options \u203a Sauvegarde si tu veux la garder.</p><div class="row"><button class="btn danger sm" data-a="start" data-ok="1">Remplacer</button><button class="btn sec sm" data-a="newconfno">Annuler</button></div></div>' : '') + '</div>' +
    (SLOT === 'save-duo' ? '<p class="small" style="text-align:center;margin:10px 0 0">' + slotSwitchHTML() + '</p>' : '') +
    '<p class="mute small" style="text-align:center;margin:14px 0 8px">\u2014 ou \u2014</p>' +
    '<label class="btn sec filebtn">Importer une sauvegarde<input type="file" id="impNew" class="fileinp" data-c="import"></label>' + pnHomeBtn() +
    '<details style="border-top:none;padding-top:2px"><summary style="font-size:16px;color:var(--acc)">Le s\u00e9lecteur ne s\u2019ouvre pas ?</summary><p class="small mute">Ouvre le fichier .json dans une appli de texte, copie tout son contenu, puis colle-le ici.</p><textarea id="impTextNew" rows="5" placeholder="Colle ici le contenu du fichier .json"></textarea><button type="button" class="btn sec sm" style="width:100%;margin-top:8px" data-a="importtext" data-v="impTextNew">Importer le texte coll\u00e9</button></details>' +
    (VIEW.importError ? '<p class="small" style="color:var(--bad);margin:8px 0 0">' + esc(VIEW.importError) + '</p>' : '') +
    '<p class="mute small">' + (CFG.varLg ? 'Quatre ligues : de ' + vlMin(0) + ' \u00e0 ' + vlMax(2) + ' golfeurs en Ligues 1 \u00e0 3 selon le niveau du circuit, la Ligue 4 accueille les autres. \u00c0 la fin de chaque saison, le top ' + (VL2 ? VL.candL[1] + ' \u00e0 ' + VL.candL[3] : VL.cand) + ' de chaque ligue monte et les ' + relBot() + ' derniers descendent' : 'Quatre ligues de ' + FIELD + ' golfeurs. \u00c0 la fin de chaque saison, les ' + MOVE + ' premiers de chaque ligue montent et les ' + MOVE + ' derniers descendent') + ' ; en cours de saison, les golfeurs en feu montent et ceux en difficult\u00e9 descendent.' + (CFG.exWin ? ' Une victoire prot\u00e8ge de la rel\u00e9gation pour 3 saisons \ud83d\udee1.' : '') + '</p></div></div>';
}
function presimHint() {
  const yEl = document.getElementById('startyear'), nEl = document.getElementById('presim');
  const y = yEl ? +yEl.value || 0 : new Date().getFullYear(), n = nEl ? Math.max(0, Math.min(PRESIM_MAX, Math.round(+nEl.value || 0))) : 0;
  if (!n) return y ? 'Le circuit na\u00eet en ' + y + ', en m\u00eame temps que ta carri\u00e8re.' : 'Sans ann\u00e9e, les saisons sont num\u00e9rot\u00e9es (saison 1, 2, 3\u2026).';
  const y0 = (y || new Date().getFullYear()) - n;
  return 'Le circuit a d\u00e9j\u00e0 ' + n + ' saison' + (n > 1 ? 's' : '') + ' d\u2019histoire (' + y0 + ' \u00e0 ' + (y0 + n - 1) + ') : tu arrives en ' + (y0 + n) + ', avec des records, des champions et des v\u00e9t\u00e9rans d\u00e9j\u00e0 en place.';
}
/* ---- Cr\u00e9ation du golfeur simul\u00e9 (\u00e0 la cr\u00e9ation de la partie, ou apr\u00e8s une retraite) ---- */
/* v254 : sans joueur actif, au début d'une saison, on choisit le type de joueur à créer (manuel ou simulé) */
const ptSwitchOK = () => !!(S && !S.duo && !S.cur && S.t === 0 && !S.G[0] && leagueOf(0) < 0 && !plRc());
function ptChips() { return ptSwitchOK() ? '<div class="block" style="margin-top:8px"><label style="margin-top:0">Type de joueur</label>' + chipRow([['manual', 'Joueur manuel'], ['sim', 'Joueur simul\u00e9']], (VIEW.pt || S.mode) === 'sim' ? 'sim' : 'manual', 'setpt') + '<p class="small mute" style="margin:4px 0 0">Manuel : tu joues sur ton simulateur et tu entres tes scores. Simul\u00e9 : le jeu joue pour ton golfeur et tu suis sa carri\u00e8re.</p></div>' : ''; }
function vPlayerCreate() {
  if ((ptSwitchOK() ? VIEW.pt || S.mode : S.mode) !== 'sim') return vManualCreate();
  const isRecreate = !!VIEW.isRecreate;
  const last = isRecreate && S.playerCareers && S.playerCareers.length ? S.playerCareers[S.playerCareers.length - 1] : null;
  let h = '<div class="top"><div><h1>' + (last ? 'Nouveau golfeur' : 'Cr\u00e9e ton golfeur') + '</h1><div class="ctx">' + (last ? 'La carri\u00e8re continue' : isRecreate ? 'Ton arriv\u00e9e sur le circuit' : 'Mode simul\u00e9') + '</div></div></div>';
  if (last) h += '<div class="block" style="margin-top:8px"><b>' + esc(last.n) + '</b> a pris sa retraite \u00e0 ' + last.a + ' ans, \u00e0 la fin de la saison ' + yr(last.s) + (last.cs ? ' \u00b7 ' + last.cs + ' saison' + (last.cs > 1 ? 's' : '') + ' de carri\u00e8re' : '') + (last.cw ? ' \u00b7 ' + last.cw + ' titre' + (last.cw > 1 ? 's' : '') : '') + (last.ce ? ' \u00b7 ' + fmtMoney(last.ce) + ' en carri\u00e8re' : '') + '.</div>';
  h += ptChips();
  h += '<p class="mute" style="margin-top:8px">Ce golfeur aura un niveau et un potentiel cach\u00e9s comme n\u2019importe quel adversaire \u2014 le reste (r\u00e9gularit\u00e9, \u00e2ge de pointe\u2026) est tir\u00e9 au hasard.</p>';
  h += '<div class="narrow"><div class="block">';
  h += '<label for="pcName">Nom</label><input type="text" id="pcName" value="' + esc(S.name || 'Toi') + '" maxlength="30" autocomplete="off">';
  h += '<label for="pcAge">\u00c2ge</label><input type="number" id="pcAge" value="22" min="17" max="50">';
  h += '<label for="pcNat">Nationalit\u00e9</label><select id="pcNat"><option value="">Non pr\u00e9cis\u00e9e</option>' + NATIONS.slice().sort((a, b) => a.name.localeCompare(b.name)).map(n => '<option value="' + esc(n.name) + '">' + esc(n.name) + '</option>').join('') + '</select>';
  h += '<label for="pcTier">Niveau</label><select id="pcTier">' + TIERS.map((t, i) => '<option value="' + i + '"' + (i === 3 ? ' selected' : '') + '>' + t[1] + '</option>').join('') + '</select>';
  h += '<label for="pcPot">Potentiel</label><select id="pcPot">' + POTS.map((t, i) => '<option value="' + i + '"' + (i === 5 ? ' selected' : '') + '>' + t[1] + '</option>').join('') + '</select>';
  if (isRecreate) h += '<label for="pcLeague">Ligue de d\u00e9part</label><select id="pcLeague">' + (CFG.rcOn ? '<option value="4"' + (VIEW.league === 4 ? ' selected' : '') + '>Classe de recrues \u00b7 ton index d\u00e9cide de ta ligue</option>' : '') + '<option value="3"' + (VIEW.league !== 0 && VIEW.league !== 1 && VIEW.league !== 2 && VIEW.league !== 4 ? ' selected' : '') + '>Ligue 4 \u00b7 Amateur</option><option value="2"' + (VIEW.league === 2 ? ' selected' : '') + '>Ligue 3 \u00b7 Semi-Pro</option><option value="1"' + (VIEW.league === 1 ? ' selected' : '') + '>Ligue 2 \u00b7 Pro</option><option value="0"' + (VIEW.league === 0 ? ' selected' : '') + '>Ligue 1 \u00b7 Tour</option></select>';
  else h += '<label for="pcLeague">Ligue de d\u00e9part</label><select id="pcLeague">' + (CFG.rcOn ? '<option value="4"' + (VIEW.league === 4 ? ' selected' : '') + '>Classe de recrues \u00b7 ton index d\u00e9cide de ta ligue</option>' : '') + '<option value="3"' + (VIEW.league !== 0 && VIEW.league !== 1 && VIEW.league !== 2 && VIEW.league !== 4 ? ' selected' : '') + '>Ligue 4 \u00b7 Amateur</option><option value="2"' + (VIEW.league === 2 ? ' selected' : '') + '>Ligue 3 \u00b7 Semi-Pro</option><option value="1"' + (VIEW.league === 1 ? ' selected' : '') + '>Ligue 2 \u00b7 Pro</option><option value="0"' + (VIEW.league === 0 ? ' selected' : '') + '>Ligue 1 \u00b7 Tour</option></select>';
  h += '<button class="btn" data-a="playercreate" style="margin-top:18px">' + (isRecreate ? 'Commencer avec ce golfeur' : 'Commencer la carri\u00e8re') + '</button>';
  if (isRecreate) h += '<button class="btn sec" data-a="spectgo">' + (S.spect && !VIEW.fresh ? 'Retour au circuit' : 'Suivre le circuit sans golfeur') + '</button><p class="small mute" style="margin:6px 0 0">Tu pourras simuler les saisons suivantes et cr\u00e9er un nouveau golfeur au d\u00e9but de n\u2019importe quelle saison.</p>';
  h += '</div></div>';
  return h;
}

/* ---- Nouvelle carrière en mode « je joue moi-même » : un nom et une ligue de départ, rien d'autre ---- */
function vManualCreate() {
  const last = S.playerCareers && S.playerCareers.length ? S.playerCareers[S.playerCareers.length - 1] : null;
  let h = '<div class="top"><div><h1>' + (last ? 'Nouvelle carri\u00e8re' : 'Ton arriv\u00e9e sur le circuit') + '</h1><div class="ctx">Tu joues toi-m\u00eame sur ton simulateur</div></div></div>';
  h += ptChips();
  if (last) h += '<div class="block" style="margin-top:8px"><b>' + esc(last.n) + '</b> a pris sa retraite \u00e0 la fin de la saison ' + yr(last.s) + (last.cs ? ' \u00b7 ' + last.cs + ' saison' + (last.cs > 1 ? 's' : '') : '') + (last.cw ? ' \u00b7 ' + last.cw + ' victoire' + (last.cw > 1 ? 's' : '') : '') + (last.ce ? ' \u00b7 ' + fmtMoney(last.ce) + ' en carri\u00e8re' : '') + '.</div>';
  h += '<div class="narrow"><div class="block"><label for="mcName" style="margin-top:0">Nom</label><input type="text" id="mcName" value="' + esc(last ? last.n : S.name || 'Toi') + '" maxlength="30" autocomplete="off">' +
    '<label for="mcNat">Nationalit\u00e9</label>' + natSelectHTML('mcNat', S.nat || '') + '<label for="mcAge">\u00c2ge</label><input type="number" id="mcAge" value="' + ((S.pk && S.pk.a) || 22) + '" min="15" max="50" inputmode="numeric">' +
    '<label for="mcLeague">Ligue de d\u00e9part</label><select id="mcLeague">' + (CFG.rcOn ? '<option value="4">Classe de recrues \u00b7 ton index d\u00e9cide de ta ligue</option>' : '') + '<option value="3" selected>Ligue 4 \u00b7 Amateur</option><option value="2">Ligue 3 \u00b7 Semi-Pro</option><option value="1">Ligue 2 \u00b7 Pro</option><option value="0">Ligue 1 \u00b7 Tour</option></select>' +
    '<p class="small mute" style="margin:8px 0 0">' + (last ? 'Ta nouvelle carri\u00e8re d\u00e9bute en ' + yr(S.season) + ' : nouveau carnet de handicap, nouvelles statistiques. L\u2019historique de la carri\u00e8re pr\u00e9c\u00e9dente reste dans les records.' : 'Ta carri\u00e8re d\u00e9bute en ' + yr(S.season) + ', dans un circuit qui a d\u00e9j\u00e0 son histoire.') + '</p>' +
    (S.t === 0 && !S.cur ? '<button class="btn" data-a="manualcreate" style="margin-top:18px">Commencer</button>' : '<p class="small" style="margin:14px 0 0">Possible au d\u00e9but d\u2019une saison.</p>') +
    '<button class="btn sec" data-a="spectgo">' + (S.spect && !VIEW.fresh ? 'Retour au circuit' : 'Suivre le circuit sans jouer') + '</button>' +
    '<p class="small mute" style="margin:6px 0 0">Tu pourras simuler les saisons suivantes et recommencer une carri\u00e8re au d\u00e9but de n\u2019importe quelle saison.</p></div></div>';
  return h;
}
/* ---- Accueil ---- */
function vHome() {
  if (spOn() && (!S.cur || S.cur.sw)) return vSpect();
  const pl = plLeague(), c = S.cur, sim = S.mode === 'sim';
  let L = offResumeHTML(), R = '';
  let h = '<div class="top"><div><h1>Saison ' + yr(S.season) + '</h1><div class="ctx">' + (S.duo ? 'Duo \u00b7 ' : '') + lgNm(pl) + '</div></div><div class="slotlnk sans">' + slotSwitchHTML() + '</div></div>';
  if (S.t >= N_TOURN && !c && finalePending()) {
    const fc = finCourse(), ff = finField(), inF = ff.includes(0) && leagueOf(0) === 0;
    L += '<div class="block hero"><div class="ctx">\ud83c\udfc6 Finale \u00b7 top ' + FIN.n + ' de la Ligue 1</div><div class="big">' + esc(fc.name) + '</div><div class="mute">Par ' + parTotal(fc.pars) + ' \u00b7 ' + ff.length + ' golfeurs \u00b7 aucune coupure \u00b7 points doubl\u00e9s \u00b7 la plus grosse bourse de l\u2019ann\u00e9e</div>' + courseMeta(fc) +
      (inF && !sim ? '<button class="btn" data-a="round" data-r="0">Jouer la ronde 1 de la Finale</button>' : inF && sim ? '<button class="btn" data-a="roundsim" data-r="0">Simuler la ronde 1</button><button class="btn sec" data-a="simtourn" style="margin-top:6px">Simuler la Finale</button>' :
        '<p class="small" style="margin:10px 0 6px">' + (leagueOf(0) === 0 ? 'Tu n\u2019es pas dans le top ' + FIN.n + ' : les meilleurs se disputent le titre sans toi.' : 'Les meilleurs de la Ligue 1 se disputent le titre.') + '</p><button class="btn" data-a="finsim">Voir la Finale</button>') + '</div>';
  } else if (S.t >= N_TOURN && !c) {
    const F = seasonHist().fin, fw = F && F.lg && F.lg[0] && F.lg[0].rows[0];
    L += '<div class="block hero"><div class="big">Saison termin\u00e9e</div><p class="mute">' + (fw ? 'La Finale est jou\u00e9e : <a href="#" data-a="tourn" data-s="' + S.season + '" data-t="' + N_TOURN + '" data-l="0">' + esc(nameOf(fw[0])) + ' l\u2019emporte</a>. ' : 'Les dix tournois sont jou\u00e9s. ') + 'Place aux promotions et aux rel\u00e9gations.</p><button class="btn" data-a="endseason">Entrer dans l\u2019intersaison \u203a</button><p class="small mute" style="margin:8px 0 0">Retraites, progression, recrues, World Ranking\u2026 chapitre par chapitre.</p></div>';
  } else {
    const course = c ? c : curCourse();
    let btn;
    if (!c) {
      btn = S.one && !sim ? '<button class="btn" data-a="round" data-r="0">Jouer la ronde</button>' : sim ? '<button class="btn" data-a="roundsim" data-r="0">Simuler la ronde' + (S.one ? '' : ' 1') + '</button><button class="btn sec" data-a="r1fast" style="margin-top:6px">Simuler la ronde' + (S.one ? '' : ' 1') + ' d\u2019un coup</button><button class="btn sec" data-a="simtourn" style="margin-top:2px">Simuler le tournoi</button><button class="btn sec" data-a="simseason" style="margin-top:2px">Simuler toute la saison</button>' : '<button class="btn" data-a="round" data-r="0">Jouer la ronde 1</button>';
    }
    else if (c.phase === 'cut') btn = c.made ? '<button class="btn" data-a="' + (sim ? 'roundsim' : 'round') + '" data-r="1">' + (sim ? 'Simuler' : 'Jouer') + ' la ronde 2</button>' + (sim ? '<button class="btn sec" data-a="simtourn" style="margin-top:6px">Simuler la ronde 2 d\u2019un coup</button>' : '') : '<button class="btn" data-a="spec">Simuler la ronde 2 trou par trou</button><button class="btn sec" data-a="finish">Simuler la ronde 2 d\u2019un coup</button>';
    else if (c.phase === 'po') btn = '<button class="btn" data-a="poview">Reprendre la prolongation</button>';
    else if (c.phase === 'sim1' || c.phase === 'sim2') btn = '<button class="btn" data-a="resumespec">Reprendre la simulation \u00b7 trou ' + (c.k2 + 1) + '</button><button class="btn sec" data-a="finish">Simuler le reste de la ronde</button>' + (sim ? '<button class="btn sec" data-a="simtourn" style="margin-top:2px">Simuler le reste du tournoi</button>' : '');
    else btn = '<button class="btn" data-a="resume">Reprendre la ronde ' + (S.one ? '' : (c.r + 1) + ' ') + '\u00b7 trou ' + (c.ps.length + 1) + '</button>';
    const mjH = c ? (c.fin ? '' : c.maj) : isMajorT(S.t) ? majorName(S.t) : '';
    L += '<div class="block hero"><div class="ctx">' + (c && c.fin ? '\ud83c\udfc6 Finale \u00b7 top ' + FIN.n + ' de la Ligue 1' : 'Tournoi ' + (S.t + 1) + ' sur ' + N_TOURN + (mjH ? (pl === 0 ? ' <span class="mjb">Majeur</span> ' + esc(mjH) : ' \u00b7 cette semaine en L1 : ' + esc(mjH) + ' (Majeur)') : '')) + '</div><div class="big">' + esc(course.name) + '</div><div class="mute">Par ' + parTotal(course.pars) + (c && c.fin ? ' \u00b7 aucune coupure \u00b7 points doubl\u00e9s' : pl === 4 ? ' \u00b7 <span>classe de recrues</span> \u00b7 <span>aucune coupure, ni points ni bourse</span>' : S.one ? ' \u00b7 une ronde \u00b7 les ' + S.settings.cut + ' premiers sont pay\u00e9s' : ' \u00b7 coupure apr\u00e8s la ronde 1') + (S.duo && S.duo.hc ? ' \u00b7 handicap d\u2019\u00e9quipe +' + S.duo.hc : '') + '</div>' + (S.duo ? '<div class="mgrid" style="margin-top:8px">' + tile(course.purse ? fmtCash(duoWinAmt(course.purse, pl)) : fmtCash(duoWinAmt(10000000, pl)) + ' \u00e0 ' + fmtCash(duoWinAmt(15000000, pl)), 'au gagnant, pour vrai') + '</div>' : course.purse ? '<div class="mgrid" style="margin-top:8px">' + tile(fmtMoney(Math.round(course.purse * LEAGUE_PURSE_PCT[pl])), 'bourse de ce tournoi') + '</div>' : '') + courseMeta(course) + (!c || c.ps.length === 0 && c.r === 0 ? voyTripHTML(S.t) : '') + btn + '</div>';
  }
  try { L += voyRouteHTML(); } catch (e) { }
  const HERO = L;
  if (S.duo) L += duoBlock();
  const rk = seasonRank(pl, 0), st = lgSt(0);
  if (pl === 4) L += '<h2>Classe de recrues</h2>' + rcStandHTML() + '<button class="btn sec" data-a="league" data-v="4">Voir toute la classe</button>';
  else L += '<h2>Classement de saison</h2><p class="mute small" style="margin:-4px 0 10px">Tu es ' + ord(rk) + ' avec ' + st.pts + ' points' + (st.w ? ', ' + st.w + ' victoire' + (st.w > 1 ? 's' : '') : '') + '.</p>' + standingsBoard(pl) +
    '<button class="btn sec" data-a="league" data-v="' + pl + '">Voir tout le classement</button>';
  let PRVH = ''; if (!c && pl >= 0 && pl < 4) try { PRVH = previewHTML(pl); } catch (e) { }
  if (S.last) {
    const t = S.hist[S.last.s - 1].t[S.last.t];
    if (t && t.pl === 4 && t.rc) R += '<h2>Dernier tournoi</h2>' + rcLastHTML(t);
    else if (t) { const sm = getSum(t, t.pl); R += '<h2>Dernier tournoi</h2><div class="block"><h3 style="margin-top:0">' + esc(t.name) + '</h3><p style="margin:6px 0 4px"><b>' + sumTxt(sm.head) + '</b> <span class="mute small">' + esc(sm.sub) + '</span></p>' + sumList(sm.st.slice(0, 2), true) + '<p class="small" style="margin:8px 0 0"><a href="#" data-a="tourn" data-s="' + S.last.s + '" data-t="' + S.last.t + '" data-l="' + t.pl + '">Résumé et résultats complets</a> \u00b7 <a href="#" data-a="journal">Journal</a></p></div>'; }
  }
  if (canRetire() && golferHistory(0).some(x => x.s < S.season)) L += retireBlock();
  L += pnHomeBtn();
  const LASTH = R;
  if (isMgr()) return h + homeDash(h, HERO, pl, LASTH, PRVH);
  R = PRVH + R;
  ibxSync();
  if (ibxVis().length) R += '<h2>Dans le monde du golf</h2><ul class="news">' + ibxVis().slice(0, 6).map(n => '<li' + (n.rd ? '' : ' class="un"') + '>' + newsHTML(n.text, n.ids) + '</li>').join('') + '</ul><button class="btn sec" data-a="ibx"><span>Bo\u00eete de r\u00e9ception</span>' + (ibxUnread() ? ' <span class="ibbadge">' + ibxUnread() + '</span>' : '') + '</button>';
  return h + cols(L, R);
}

/* ---- Saisie d'un trou ---- */
function verdictFor(rel, strokes) { return strokes === 1 ? 'Trou d\u2019un coup' : rel <= -3 ? 'Albatros' : rel === -2 ? 'Aigle' : rel === -1 ? 'Birdie' : rel === 0 ? 'Par' : rel === 1 ? 'Bogey' : rel === 2 ? 'Double bogey' : rel === 3 ? 'Triple bogey' : 'Quadruple bogey ou pire'; }
function vPlay() {
  const c = S.cur, k = c.ps.length, par = c.pars[k];
  if (teeCur(c) && k === 0 && c.teeSeen && !c.teeSeen[c.r]) return vTees(true);
  if (k >= 18) return vWait();
  if (k === 0 && preTeeOn(c)) return vPreTee();
  if (VIEW.val == null) VIEW.val = par;
  const rows = liveRows(k), me = rows.find(r => r.id === 0), rw = c.r === 0 ? c.wind : c.wind2;
  let h = '<div class="top"><div><div class="ctx">' + esc(c.name) + (S.one ? ' \u00b7 ronde unique' : ' \u00b7 ronde ' + (c.r + 1)) + '</div>' + roundMeta(c) + '</div>' + teeLinks() + '</div>';
  h += '<div class="hole"><div class="lbl">Trou ' + (k + 1) + ' sur 18</div><div class="par"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V3" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M7 4l12 4.5L7 13z" fill="currentColor"/></svg>Par ' + par + '</div>' +
    '<div class="stepper"><button class="pm" data-a="dec" aria-label="Moins un coup">\u2212</button><div class="val" id="val" aria-live="polite">' + VIEW.val + '</div><button class="pm" data-a="inc" aria-label="Plus un coup">+</button></div>' +
    '<div class="verdict" id="verdict">' + verdictFor(VIEW.val - par, VIEW.val) + '</div></div>';
  const hr = holeRange(par); VIEW.val = Math.max(hr[0], Math.min(hr[1], VIEW.val));
  h += '<div class="chips hchips" role="group" aria-label="Choisir ton score">' + range(hr[0], hr[1]).map(v => { const r = v - par, kc = r <= -2 ? 'e2' : r === -1 ? 'e1' : r === 0 ? 'pr' : r === 1 ? 'b1' : r === 2 ? 'b2' : 'b3'; return '<button class="chip k-' + kc + '" data-a="setv" data-v="' + v + '" aria-pressed="' + (v === VIEW.val) + '">' + v + '</button>'; }).join('') + '</div>';
  if (S.duo && S.duo.hc) { const st = duoStrokes(c.index && c.index[k]); h += '<p class="small mute" style="text-align:center;margin:2px 0 8px">' + (st ? '\u26f3 Coup de handicap sur ce trou : <b>+' + st + '</b> \u00e0 votre score (index ' + (c.index ? c.index[k] : '') + ')' : 'Pas de coup de handicap sur ce trou') + ' \u00b7 handicap d\u2019\u00e9quipe +' + S.duo.hc + '</p>'; }
  h += skInputHTML(c, k);
  h += '<button class="btn" data-a="ok">Valider le trou</button>';
  if (k > 0) h += '<button class="btn sec sm" data-a="undo" style="width:100%;margin-top:4px">Corriger le trou pr\u00e9c\u00e9dent</button>';
  h += grpBlock(k);
  const A = h; h = '';
  h += '<h2>Ta ronde</h2><p style="margin:-2px 0 8px"><span class="sans" style="font-size:26px;font-weight:600">' + posLbl(me) + '</span>' + (S.duo ? ' ' + duoLiveTag(duoLiveEst(rows)) : '') + ' <span class="mute">au classement, </span><span class="sans ' + cls(me.tot) + '" style="font-size:26px;font-weight:600">' + fmt(me.tot) + '</span>' +
    (c.r === 0 && !c.rc ? '<span class="mute small"> \u00b7 ' + (S.one ? 'ligne de paye (top ' + S.settings.cut + ')' : 'coupure actuelle') + ' : ' + fmt(cutScoreOf(rows.map(r => r.tot), S.settings.cut)) + '</span>' : '') + '</p>';
  h += '<p class="small mute" style="margin:8px 0 2px">R\u00e9v\u00e9lation des scores adverses</p>' + chipRow([['instant', 'Tous les scores d\u2019un coup'], ['seq', 'Par s\u00e9quence'], ['gbg', 'Golfeur par golfeur']], S.ui.reveal || 'instant', 'revealmode');
  h += '<div id="boardTop"></div>' + roundBlock(k);
  const B = h; h = '';
  h += fanHTML(c);
  if (c.feed.length) h += '<h2>Journal</h2><ol class="log" reversed>' + c.feed.slice(0, 8).map(f => '<li><span class="n">' + f.n + '</span><div class="t">' + esc(f.t) + f.ev.map(e => '<div class="ev">' + esc(e) + '</div>').join('') + '</div></li>').join('') + '</ol>';
  return cols(A, isMgr() ? mgrPanels(B, 'plp') : B, isMgr() ? '' : h, 'play');
}


/* ---- v217 : départs décalés ---- */
function teeLinks() { return '<span class="tlinks">' + (teeCur(S.cur) ? '<a href="#" data-a="teesv" class="sans">D\u00e9parts</a>' : '') + '<a href="#" data-a="quit" class="sans">Quitter</a></span>'; }
/* v311 : fiche du terrain pour la ronde en cours (tee, distance, CR/slope, drapeau, vent) sous le nom du terrain */
function roundMeta(c) {
  if (!c) return '';
  const r2 = c.r === 1 && !S.one, pin = r2 ? c.pin2 : c.pin, wind = r2 ? c.wind2 : c.wind, B = [];
  if (c.tee != null) B.push('<span class="rmk">Tee</span> <b>' + esc(c.tee) + '</b>');
  if (c.dist) B.push('<b>' + fmtDist(c.dist) + '</b> <span class="rmu">v</span>');
  if (c.cr != null) B.push('<span class="rmk">CR</span> <b>' + (LANG === 'en' ? c.cr.toFixed(1) : c.cr.toFixed(1).replace('.', ',')) + '</b>');
  if (c.slope != null) B.push('<span class="rmk">Slope</span> <b>' + c.slope + '</b>');
  if (pin && PIN_LABELS[pin]) B.push('<span class="rmk">Drapeau</span> <b>' + PIN_LABELS[pin] + '</b>');
  if (wind) B.push('<span class="rmk">Vent</span> <b>' + WIND_LABELS[wind] + '</b>');
  return B.length ? '<div class="rmeta">' + B.map(x => '<span class="rmi">' + x + '</span>').join('') + '</div>' : '';
}
function teeRoundLbl(c) { return c.fin ? 'Finale' : S.one ? 'ronde unique' : 'ronde ' + (c.r + 1); }
/* v369 : watchlist du tournoi — S.cur.twl = ids cochés d'une étoile (se vide avec le tournoi) */
const twOn = id => !!(S.cur && id !== 0 && Array.isArray(S.cur.twl) && S.cur.twl.includes(id));
const twCan = id => !!(S.cur && id !== 0 && fld(S.cur).includes(id));
const twBtn = id => twCan(id) ? '<button class="tws' + (twOn(id) ? ' on' : '') + '" data-a="twl" data-id="' + id + '" aria-pressed="' + twOn(id) + '" aria-label="' + (twOn(id) ? 'Retirer de la watchlist du tournoi' : 'Ajouter à la watchlist du tournoi') + '">' + (twOn(id) ? '\u2605' : '\u2606') + '</button>' : '';
function twlBlock(k) {
  const c = S.cur; if (!c) return '';
  const ids = (c.twl || []).filter(id => fld(c).includes(id));
  if (!ids.length) return '<div class="block grp grptw"><div class="grph"><h3>\u2605 Watchlist du tournoi</h3></div><p class="small mute grpn"><span>Touche \u2606 à côté d’un nom (départs, classement, groupes) pour suivre un golfeur pendant ce tournoi.</span></p></div>';
  const rows = liveRows(k), R = {}; rows.forEach(r => { R[r.id] = r; });
  const r2 = c.r === 1;
  const L = ids.map(id => {
    const r = R[id], h = c.ai[id] || [], n = r ? (r.n != null ? r.n : (r.pending ? k - 1 : k)) : 0;
    return { id, r, h, n, cut: !r };
  }).sort((a, b) => (a.cut - b.cut) || (a.cut ? 0 : a.r.tot - b.r.tot) || (b.n - a.n));
  const mg = isMgr(), NL = mg ? (r2 ? 4 : 5) : 3;   // v407 : sur PC (colonne de gauche), nom de famille seul et le plus de trous possible
  const line = x => {
    const today = x.n ? relTo(x.h, c.pars, x.n) : null, last = [];
    for (let i = Math.max(0, x.n - NL); i < x.n; i++) last.push(i);
    const lc = '<td class="tl"></td>'.repeat(NL - last.length) + last.map(i => holeCell(x.h[i], c.pars[i]).replace('<td class="', '<td class="tl ')).join('');
    const nm = '<td class="gnm"><span class="nmr"><span class="flg">' + flagOf(x.id, 18) + '</span><a class="nmt" data-a="golfer" data-id="' + x.id + '"' + (mg ? ' title="' + esc(nameOf(x.id)) + '"' : '') + '>' + esc(mg ? lastNm(nameOf(x.id)) : shortNm(nameOf(x.id))) + '</a>' + twBtn(x.id) + '</span></td>';
    const gh = '<td class="gh">' + (x.cut ? '' : x.n >= 18 ? 'F' : x.n ? x.n : '\u2013') + '</td>';
    const sc = '<td class="gt ' + (today == null ? '' : cls(today)) + '">' + (x.cut ? '' : today == null ? '\u2013' : fmt(today)) + '</td>' +
      (r2 ? '<td class="gt ' + (x.cut ? '' : cls(x.r.tot)) + '">' + (x.cut ? '' : fmt(x.r.tot)) + '</td>' : '') +
      '<td class="gp">' + (x.cut ? 'CUT' : posLbl(x.r)) + '</td>';
    return '<tr>' + nm + gh + (mg ? lc + sc : sc + lc) + '</tr>';
  };
  const hL = '<th colspan="' + NL + '"' + (mg ? ' style="width:' + NL * 25 + 'px"' : '') + '>' + NL + ' derniers</th>', hS = '<th class="gt">Auj.</th>' + (r2 ? '<th class="gt">Tot</th>' : '') + '<th class="gp">Pos.</th>';
  const hdr = '<tr class="hn"><th class="gnm">Golfeur</th><th class="gh">Trou</th>' + (mg ? hL + hS : hS + hL) + '</tr>';
  return '<div class="block grp grptw"><div class="grph"><h3>\u2605 Watchlist du tournoi</h3><span class="small mute"><span>' + ids.length + ' golfeur' + (ids.length > 1 ? 's' : '') + '</span></span></div>' +
    '<div class="grpw"><table class="cards grpt twt"><thead>' + hdr + '</thead><tbody>' + L.map(line).join('') + '</tbody></table></div></div>';
}
/* v316 : suivre un groupe (2 au plus) — il s'affiche pendant la ronde comme ton groupe */
const folBtn = (gi, fol) => '<button class="tfol' + (fol.includes(gi) ? ' on' : '') + '" data-a="tfol" data-g="' + gi + '" aria-pressed="' + fol.includes(gi) + '">' + (fol.includes(gi) ? '\u2605 <span>Suivi</span>' : '\u2606 <span>Suivre</span>') + '</button>';
/* Ordre des départs : avant chaque ronde (gate = bouton pour commencer), ou consulté pendant la ronde */
/* v397 : page des départs › classement de la saison de la ligue jouée : rang, points et nombre de tournois joués
   dans cette ligue cette saison, avec l'étoile de la watchlist du tournoi (comme dans les groupes). */
function teeStandHTML(c) {
  const L = c.fin ? 0 : c.pl; if (!(L >= 0 && L <= 3) || !S.L[L]) return '';
  const H = S.hist[S.season - 1], n = {};
  if (H) H.t.forEach(t => { if (t && t.lg && t.lg[L]) t.lg[L].rows.forEach(r => { n[r[0]] = (n[r[0]] || 0) + 1; }); });
  const R = rankAll(L), played = H ? H.t.filter(t => t && t.lg && t.lg[L]).length : 0;
  const row = (r, i) => '<tr' + (r.id === 0 ? ' class="me"' : '') + '><td class="r">' + (i + 1) + '</td><td class="tstn"><span class="flg">' + flagOf(r.id, 16) + '</span><a href="#" class="nmt" data-a="golfer" data-id="' + r.id + '">' + esc(nameOf(r.id)) + '</a>' + (r.id !== 0 ? twBtn(r.id) : '') + '</td><td class="r">' + (n[r.id] || 0) + '</td><td class="r"><b>' + r.pts + '</b></td></tr>';
  return '<div class="block tstand"><h3 style="margin-top:0"><span>Classement de la saison</span> · ' + esc(LEAGUE_NAMES[L]) + '</h3><p class="small mute" style="margin:0 0 6px"><span>Après</span> ' + played + ' <span>' + (played > 1 ? 'tournois' : 'tournoi') + '</span> · <span>Touche ☆ pour suivre un golfeur pendant ce tournoi.</span></p>' +
    '<div class="tstw"><table class="plain tstt"><thead><tr><th class="r">#</th><th>Golfeur</th><th class="r" title="Tournois joués dans cette ligue cette saison">Tourn.</th><th class="r">Pts</th></tr></thead><tbody>' + R.map(row).join('') + '</tbody></table></div></div>';
}
function vTees(gate) {
  const c = S.cur, tr = teeCur(c); if (!tr) return vHome();
  const G = [], nG = teeNG(tr), me = teeGrp(tr, 0), inF = me >= 0, sim = S.mode === 'sim';
  teeGroups(tr.o, tr.lm).forEach((g, i) => { G[i] = g; });
  const f = tr.f || {}, FS = teeFeats(tr), FG = new Set(FS.map(x => x.g)), rg = f.rv != null ? teeGrp(tr, f.rv) : -1, fol = tr.fol || [];
  const nmL = ids => ids.map(i => '<a href="#" class="tsl" data-a="golfer" data-id="' + i + '"><b>' + esc(nameOf(i)) + '</b></a>').join(', ').replace(/, (<b>[^,]*)$/, ' et $1');
  const T = '<div class="top"><div><h1>Ordre des d\u00e9parts</h1><div class="ctx">' + esc(c.name) + ' \u00b7 <span>' + teeRoundLbl(c) + '</span> \u00b7 <span>' + nG + ' groupes</span> \u00b7 <span>' + (tr.lm === 3 ? '2 groupes aux ' + TEE.MIN2 + ' minutes, du trou 1' : 'd\u00e9parts du trou 1 aux ' + TEE.MIN + ' minutes') + '</span></div>' + roundMeta(c) + '</div>' + (gate ? '<a href="#" data-a="quit" class="sans" style="font-size:18px">Quitter</a>' : '') + '</div>';
  let A = '';
  if (inF) {
    const ahead = G.slice(0, me).map((g, i) => Math.min(18, Math.floor(teeGS(me, tr.lm) - teeGS(i, tr.lm) + 1e-6))), done = ahead.filter(n => n >= 18).length, mates = G[me].filter(i => i !== 0);
    A += '<div class="block hero"><div class="ctx">' + (sim ? 'D\u00e9part de ton golfeur' : 'Ton d\u00e9part') + '</div><div class="big">' + teeTime(me) + '</div><p class="mute" style="margin:6px 0 10px">Groupe ' + (me + 1) + ' sur ' + nG + '</p>' +
      (mates.length ? '<p style="margin:0 0 8px">Avec ' + nmL(mates) + '.</p>' : '') +
      '<p class="small mute" style="margin:0"><span>' + (teeGS(me, tr.lm) === 0 ? 'Tu ouvres le bal : personne n\u2019est encore sur le terrain.' : ahead[0] >= 18 ? 'Quand tu partiras, le groupe 1 aura termin\u00e9.' : 'Quand tu partiras, le groupe 1 sera rendu au trou ' + (ahead[0] + 1) + '.') + '</span>' + (done ? ' <span>' + done + ' groupe' + (done > 1 ? 's seront' : ' sera') + ' d\u00e9j\u00e0 au chalet.</span>' : '') +
      ' <span>' + ((() => { const k = G.filter((g, i) => teeGS(i, tr.lm) > teeGS(me, tr.lm) + 1e-9).length; return k ? k + ' groupe' + (k > 1 ? 's partiront' : ' partira') + ' apr\u00e8s toi.' : 'Tu fermes la marche : aucun groupe ne part apr\u00e8s toi.'; })()) + '</span></p></div>';
  } else A += '<div class="block"><b>Tu ne joues pas cette ronde.</b><p class="small mute" style="margin:4px 0 0">Tu suis le dernier groupe, qui part \u00e0 ' + teeTime(nG - 1) + '. Les groupes plus t\u00f4t seront d\u00e9j\u00e0 sur le terrain.</p></div>';
  if (FS.length || rg >= 0) {
    const nmB = id => '<a href="#" class="tsl" data-a="golfer" data-id="' + id + '"><b>' + esc(nameOf(id)) + '</b></a>';
    const nmJ = ids => ids.map(nmB).join(', ').replace(/, (<a [^,]*)$/, ' et $1');
    const why = (x, gi) => {
      const L = t => '<span>' + t + '</span> ';
      switch (x.k) {
        case 'last': return L(gi === me ? 'C’est le tien :' : 'Les meneurs :') + nmJ(G[gi].filter(i => i !== 0));
        case 'champ': return x.ys != null && x.ys !== S.season - 1 ? L('Dernier vainqueur ici (' + yr(x.ys) + ') :') + nmB(x.id) : L('Champion en titre :') + nmB(x.id);
        case 'new': return L(x.ids.length > 1 ? 'Nouveaux promus, premier tournoi dans la ligue :' : 'Nouveau promu, premier tournoi dans la ligue :') + nmJ(x.ids);
        case 'wr': return L('World Ranking :') + x.ids.map(id => nmB(id) + ' <span class="mute">#' + (wrRankOf(id) || '?') + '</span>').join(', ');
        case 'hcp': return L('Handicap combiné le plus bas :') + '<span>moyenne ' + fmtHI(Math.round(x.v * 10) / 10) + '</span>';
        case 'wl': return L('Sur ta watchlist :') + nmJ(x.ids);
        case 'lead': return L('Meneur de la saison :') + nmB(x.id);
        case 'win': return L('Gagnant du dernier tournoi :') + nmB(x.id);
        case 'top10': return L('Top 10 de la saison :') + x.ids.map((id, i) => nmB(id) + ' <span class="mute">' + ord(x.rs[i]) + '</span>').join(', ');
        case 'pts': return L('Plus de points cumulés cette saison :') + '<b>' + x.v + ' pts</b>';
        case 'rev': return L(x.po ? 'Revanche de la prolongation :' : 'Revanche :') + nmB(x.ids[0]) + ' <span>a battu</span> ' + nmB(x.ids[1]) + ' <span class="mute">(' + esc(x.c) + (x.ys !== S.season ? ', ' + yr(x.ys) : '') + ')</span>';
        case 'home': return L('À domicile (' + x.cn + ') :') + nmJ(x.ids);
        case 'stk': return L(x.t === 't10' ? 'Série en jeu : ' + x.n + ' top 10 de suite :' : 'Série en jeu : ' + x.n + ' coupures de suite :') + nmB(x.id);
        case 'dry': return L('Disette : ' + x.n + ' coupures ratées de suite :') + nmB(x.id);
        case 'last3': return L(x.rel ? 'Dernière chance, en zone de relégation à ' + x.left + ' tournoi' + (x.left > 1 ? 's' : '') + ' de la fin :' : 'Dernière chance avant la retraite forcée :') + nmJ(x.ids);
        case 'race': return L('Course au titre :') + x.ids.map((id, i) => nmB(id) + ' <span class="mute">' + ord(x.rs[i]) + '</span>').join(', ') + (x.gap > 0 ? ' <span class="mute">(<span>' + x.gap + ' pts d’écart</span>)</span>' : '');
        case 'phen': return L(x.gen ? 'Le phénomène (talent générationnel) :' : 'Le phénomène :') + nmB(x.id);
        case 'surp': return L('Surprise de la saison :') + nmB(x.id) + ' <span class="mute"><span>' + ord(x.v) + ' au classement</span> <span>(attendu vers le ' + ord(x.e) + ')</span></span>';
      }
      return '';
    };
    let t = '';
    if (FS.length) {
      t += '<b>⭐ ' + (FS.length > 1 ? 'Groupes vedettes' : (FS[0].rs[0] && FS[0].rs[0].k === 'last' ? 'Dernier groupe' : 'Groupe vedette')) + '</b>';
      t += FS.map(x => { const gi = x.g; return '<div class="fgi"><div class="fgh"><span class="fgt">' + teeTime(gi) + ' · <span>Gr. ' + (gi + 1) + '</span>' + (gi === me ? ' · <span>toi</span>' : '') + '</span>' + (gi !== me ? folBtn(gi, fol) : '') + '</div>' +
        '<ul class="fgr">' + x.rs.map(y => '<li>' + why(y, gi) + '</li>').join('') + '</ul>' +
        (x.rs.some(y => y.k === 'last') ? '' : '<p class="small mute fgw"><span>Le groupe :</span> ' + nmJ(G[gi].filter(i => i !== 0)) + (G[gi].includes(0) ? ' <span>et toi</span>' : '') + '</p>') + '</div>'; }).join('');
    }
    if (rg >= 0) t += '<p class="small" style="margin:' + (t ? '8px' : '0') + ' 0 0">⚔️ Ton rival, <a href="#" class="tsl" data-a="golfer" data-id="' + f.rv + '"><b>' + esc(nameOf(f.rv)) + '</b></a>, ' + (rg === me ? 'joue dans ton groupe.' : 'part à ' + teeTime(rg) + ' (groupe ' + (rg + 1) + ').') + '</p>';
    A += '<div class="block fgb" style="padding:10px 14px">' + t + '</div>';
  }
  const go = c.ps.length ? 'Retour \u00e0 la ronde' : null;
  A += gate ? '<button class="btn" data-a="teego">' + (inF && !sim ? (S.one || c.fin ? 'Jouer la ronde' : 'Jouer la ronde ' + (c.r + 1)) : 'Commencer la ronde') + '</button>' : '<button class="btn" data-a="teeback">' + (go || 'Retour \u00e0 la ronde') + '</button>';
  A += teeStandHTML(c);   // v397 : classement de la saison de la ligue, dans la colonne de gauche
  const nm = id => '<a href="#" data-a="golfer" data-id="' + id + '" class="tsn' + (id === 0 ? ' me' : '') + (id === f.rv ? ' rv' : '') + '">' + flagOf(id, 16) + '<span>' + esc(id === 0 ? nameOf(0) : shortNm(nameOf(id))) + (c.r === 1 && c.r1[id] != null ? ' <small class="' + cls(c.r1[id]) + '">' + fmt(c.r1[id]) + '</small>' : '') + '</span></a>';
  const nmT = id => id === 0 || !twCan(id) ? nm(id) : '<span class="tsc">' + nm(id) + twBtn(id) + '</span>';
  const B = '<h2>Les ' + nG + ' groupes</h2><p class="small mute" style="margin:-4px 0 8px">Tu peux suivre jusqu\u2019\u00e0 2 groupes : ils s\u2019affichent pendant la ronde, comme ton groupe.</p><p class="small mute" style="margin:-4px 0 8px">Touche \u2606 à côté d’un nom pour l’ajouter à ta watchlist du tournoi.</p><div class="tsgrid">' + G.map((g, i) => '<div class="tsg' + (i === me ? ' mine' : '') + (FG.has(i) ? ' feat' : '') + (fol.includes(i) ? ' fol' : '') + '"><div class="tst">' + teeTime(i) + '<small>Gr. ' + (i + 1) + (FG.has(i) ? ' \u00b7 \u2b50' : '') + (i === me ? ' \u00b7 toi' : '') + '</small>' + (i !== me ? folBtn(i, fol) : '') + '</div><div class="tsp">' + g.map(nmT).join('') + '</div></div>').join('') + '</div>';
  return T + cols(A, isMgr() ? mgrPanels(B, 'plp') : B, '', '');
}
/* Ton groupe : tes partenaires, trou par trou, au même rythme que toi ; v316 : suivis des groupes choisis (2 au plus) */
function grpBlock(k) {
  const c = S.cur, tr = teeCur(c); if (!tr) return twlBlock(k);
  const me = teeGrp(tr, 0), G = teeGroups(tr.o, tr.lm), rows = liveRows(k), R = {}; rows.forEach(r => { R[r.id] = r; });
  const FG = new Set(teeFeats(tr).map(x => x.g));
  let out = me >= 0 ? grpOne(c, G[me], me, k, R, rows, true, false) : '';
  (tr.fol || []).filter(gi => gi !== me && G[gi]).forEach(gi => {
    const kk = Math.max(0, ...G[gi].map(id => R[id] && R[id].n != null ? R[id].n : 0));
    out += grpOne(c, G[gi], gi, kk, R, rows, false, FG.has(gi));
  });
  return out + twlBlock(k);
}
/* nom de famille seul (« Pepijn de Vries » → « de Vries ») pour les tableaux étroits de la colonne de gauche */
function lastNm(n) { const p = String(n || '').trim().split(/\s+/); return p.length > 1 ? p.slice(1).join(' ') : p[0] || ''; }
function grpOne(c, ids, gi, k, R, rows, mine, feat) {
  const mg = isMgr(), W = mg ? 7 : isPC() ? 6 : 4, n0 = Math.max(0, Math.min(k, 18) - W + (mg ? 1 : 0));   // v407 : PC = 7 trous, jusqu'au prochain trou
  const cols = range(n0, Math.max(n0, Math.min(18, n0 + W) - 1)).filter(i => i < 18);
  const line = id => {
    const r = R[id] || { n: 0 }, h = id === 0 ? myHoles(c) || [] : c.ai[id] || [], n = r.n != null ? r.n : k, t = relTo(h, c.pars, n);
    return '<tr' + (id === 0 ? ' class="me"' : '') + '><td class="gnm"><span class="nmr"><span class="flg">' + flagOf(id, 18) + '</span><a class="nmt" data-a="golfer" data-id="' + id + '"' + (mg ? ' title="' + esc(nameOf(id)) + '"' : '') + '>' + esc(mg ? lastNm(nameOf(id)) : id === 0 ? nameOf(0) : shortNm(nameOf(id))) + '</a>' + twBtn(id) + '</span></td>' +
      cols.map(i => i < n ? holeCell(h[i], c.pars[i]) : '<td class="h"></td>').join('') + '<td class="gt ' + (n ? cls(t) : '') + '">' + (n ? fmt(t) : '–') + '</td><td class="gp">' + (R[id] ? posLbl(R[id]) : '') + '</td></tr>';
  };
  const hdr = '<tr class="hn"><th class="gnm">' + (k ? 'Trou' : 'Golfeur') + '</th>' + cols.map(i => '<th' + (i === k ? ' class="nx"' : '') + '>' + (i + 1) + '</th>').join('') + '<th class="gt">Auj.</th><th class="gp">Pos.</th></tr>';
  const tt = ids.map(id => { const r = R[id], h = id === 0 ? myHoles(c) || [] : c.ai[id] || []; return [id, r && r.n ? relTo(h, c.pars, r.n) : null]; }).filter(x => x[1] != null).sort((a, b) => a[1] - b[1]);
  const notes = [];
  if (!mg && tt.length && k >= 3 && (tt.length < 2 || tt[0][1] < tt[1][1])) notes.push('Meilleur du groupe aujourd’hui : <b>' + esc(nameOf(tt[0][0])) + '</b> (' + fmt(tt[0][1]) + ').');
  if (mine) { const done = rows.filter(r => r.n >= 18 && r.id !== 0)[0]; if (done) notes.push('🏠 Au chalet : <b>' + esc(nameOf(done.id)) + '</b> a terminé à ' + fmt(done.tot) + '.'); }
  else if (!k) notes.push('Pas encore parti.');
  else if (k >= 18) notes.push('🏠 Groupe au chalet.');
  const ttl = mine ? (S.mode === 'sim' ? 'Le groupe de ton golfeur' : 'Ton groupe') : (feat ? '⭐ ' : '★ ') + 'Groupe suivi';
  return '<div class="block grp' + (mine ? '' : ' grpf') + '"><div class="grph"><h3>' + ttl + '</h3><span class="small mute"><span>départ ' + teeTime(gi) + '</span> · <span>groupe ' + (gi + 1) + '</span>' + (mine ? '' : ' · <a href="#" data-a="tfol" data-g="' + gi + '" class="grpx">Ne plus suivre</a>') + '</span></div>' +
    '<div class="grpw"><table class="cards grpt"><thead>' + hdr + '</thead><tbody>' + ids.map(line).join('') + '</tbody></table></div>' + (notes.length ? '<p class="small grpn">' + notes.map(x => '<span>' + x + '</span>').join(' ') + '</p>' : '') + '</div>';
}
/* Ta ronde est finie, mais des groupes sont encore sur le terrain */
/* v266 : avant ton départ — la ronde commence avec le premier groupe ; tu avances d'un trou à la fois ou jusqu'à ton départ */
function preTeeOn(c) { const tr = teeCur(c); return !!(tr && c.pw != null && c.pw < tr.anc && !(teeSim(c) ? c.k2 > 0 : c.ps.length)); }
function vPreTee() {
  const c = S.cur, tr = teeCur(c), rows = liveRows(0), rw = c.r === 0 ? c.wind : c.wind2, me = teeGrp(tr, 0);
  const on = rows.filter(r => r.n > 0 && r.n < 18).length, fin = rows.filter(r => r.n >= 18).length, lead = c.r === 1 ? rows[0] : rows.filter(r => r.n > 0)[0];
  const left = Math.max(0, Math.ceil((tr.anc - c.pw) * TEE.HOLE - 1e-6));
  let h = '<div class="top"><div><div class="ctx">' + esc(c.name) + ' · ' + teeRoundLbl(c) + '</div>' + roundMeta(c) + '</div>' + teeLinks() + '</div>';
  const noMe = me < 0, lastG = teeNG(tr) - 1;
  h += '<div class="block hero"><div class="ctx">' + (noMe ? 'Avant le départ du dernier groupe' : S.mode === 'sim' ? 'Avant le départ de ton golfeur' : 'Avant ton départ') + '</div><div class="big">' + teeClock(c.pw) + '</div><p class="mute" style="margin:6px 0 0"><span>' + (noMe ? 'Dernier départ : ' + teeTime(lastG) + ' (groupe ' + (lastG + 1) + ')' : 'Ton départ : ' + teeTime(me) + ' (groupe ' + (me + 1) + ')') + '</span> · <span>dans ' + (left >= 60 ? Math.floor(left / 60) + ' h ' + String(left % 60).padStart(2, '0') : left + ' min') + '</span></p></div>';
  h += '<div class="block" style="padding:10px 14px"><b>' + (on + fin ? on + ' golfeur' + (on > 1 ? 's' : '') + ' sur le terrain' + (fin ? ' · ' + fin + ' terminé' + (fin > 1 ? 's' : '') : '') : 'Personne n’est encore parti') + '</b>' + (lead ? '<p class="small mute" style="margin:2px 0 0">En tête : ' + esc(nameOf(lead.id)) + ' (' + fmt(lead.tot) + ', ' + (lead.n >= 18 ? 'terminé' : !lead.n ? 'pas encore parti' : lead.n + ' trou' + (lead.n > 1 ? 's' : '')) + ').</p>' : '') + '</div>';
  { const pin = c.r === 0 ? c.pin : c.pin2, wd = (c.r === 0 ? c.wind : c.wind2) || 'none';   // v273 : conditions de la ronde, bien en vue avant le départ
    h += '<div class="block precond"><div><span class="pck">\ud83d\udea9 <span>Drapeau</span></span><b>' + (pin ? PIN_LABELS[pin] : '\u2013') + '</b></div><div><span class="pck">\ud83d\udca8 <span>Vent</span></span><b>' + WIND_LABELS[wd] + '</b></div></div>'; }
  h += '<button class="btn" data-a="prestep">Avancer d’un trou</button><button class="btn sec" data-a="preall">' + (noMe ? 'Simuler jusqu’au dernier départ' : 'Simuler jusqu’à mon départ') + '</button>' + (teeSim(c) ? '<button class="btn sec sm" data-a="finish" style="width:100%;margin-top:4px">Simuler le reste de la ronde</button>' : '') + teeJumpHTML(c, tr);
  h += grpBlock(0);
  const A = h; h = '';
  const B = '<h2>Classement</h2>' + '<p class="small mute" style="margin:0 0 2px">R\u00e9v\u00e9lation des scores adverses</p>' + chipRow([['instant', 'Tous les scores d\u2019un coup'], ['seq', 'Par s\u00e9quence'], ['gbg', 'Golfeur par golfeur']], S.ui.reveal || 'instant', 'revealmode') + '<div id="boardTop"></div>' + roundBlock(0);
  h += fanHTML(c);
  if (c.feed.length) h += '<h2>Journal</h2><ol class="log" reversed>' + c.feed.slice(0, 8).map(f => '<li><span class="n">' + f.n + '</span><div class="t">' + esc(f.t) + f.ev.map(e => '<div class="ev">' + esc(e) + '</div>').join('') + '</div></li>').join('') + '</ol>';
  return cols(A, isMgr() ? mgrPanels(B, 'plp') : B, isMgr() ? '' : h, 'play');
}
function preTeeAdv(all, to) {
  const c = S.cur, tr = teeCur(c); if (!tr || c.pw == null) return;
  const before = liveRows(0); c.pw = all ? tr.anc : Math.min(tr.anc, to != null ? Math.max(c.pw, to) : c.pw + 1); if (tr.anc - c.pw < 1e-6) c.pw = tr.anc;
  const after = liveRows(0), ev = []; holeEvents(before, after, 0, ev, true);
  const lead = c.r === 1 ? after[0] : after.filter(r => r.n > 0)[0];
  c.feed = c.feed.filter(f => !f.pre); 
  if (lead) c.feed.unshift({ n: teeClock(c.pw).replace(/\u00a0(AM|PM)/, '').replace(/\u00a0h\u00a0/, 'h'), w: 1, pre: 1, t: 'En tête : ' + nameOf(lead.id) + ' (' + fmt(lead.tot) + ').', ev: ev.slice(0, 3) });
  persist();
}
function vWait() {
  const c = S.cur, rows = liveRows(18), me = rows.find(r => r.id === 0), left = rows.filter(r => r.n < 18), sim = teeSim(c), rw = c.r === 0 ? c.wind : c.wind2;
  const today = me ? relTo(myHoles(c), c.pars, 18) : null, low = left.length ? Math.min.apply(null, left.map(r => r.n)) : 18, lastG = left.length ? Math.max.apply(null, left.map(r => r.g)) : 0;
  let h = '<div class="top"><div><div class="ctx">' + esc(c.name) + ' \u00b7 ' + teeRoundLbl(c) + '</div>' + roundMeta(c) + '</div>' + teeLinks() + '</div>';
  if (me) h += '<div class="block hero"><div class="ctx">' + (S.mode === 'sim' ? 'Ronde de ton golfeur termin\u00e9e' : 'Ta ronde est termin\u00e9e') + '</div><div class="big ' + cls(today) + '">' + fmt(today) + '</div><p class="mute" style="margin:6px 0 0"><span>' + posLbl(me) + ' au classement</span>' + (c.r === 1 ? ' \u00b7 <span>total ' + fmt(me.tot) + '</span>' : '') + ' \u00b7 <span>' + sum(myHoles(c)) + ' coups</span></p></div>';
  if (!left.length) {   // v391 : tout le monde a terminé ; on reste ici jusqu'à ce que le joueur passe à la suite
    const cutNext = c.r === 0 && !S.one, P = c.po, poDone = P && P.w != null;
    const tie = !cutNext && !P && rows.length > 1 && rows[0].tot === rows[1].tot;   // v394 : égalité en tête → la suite est la prolongation
    if (poDone) h += '<div class="block" style="padding:10px 14px"><b><span>Prolongation :</span> <a href="#" data-a="golfer" data-id="' + P.w + '">' + esc(nameOf(P.w)) + '</a> l\u2019emporte</b><p class="small mute" style="margin:2px 0 0"><span>Au trou de prolongation</span> <span>' + P.h.length + '</span>. <a href="#" data-a="poview">Revoir la prolongation</a></p></div>';
    else h += '<div class="block" style="padding:10px 14px"><b>Tout le monde a termin\u00e9</b><p class="small mute" style="margin:2px 0 0">' + (cutNext ? 'La ronde 1 est compl\u00e8te : regarde le classement, puis passe \u00e0 la coupure.' : tie ? '\u00c9galit\u00e9 en t\u00eate : regarde le classement, puis passe \u00e0 la prolongation.' : 'Le tournoi est termin\u00e9 : regarde le classement final, puis passe \u00e0 la cl\u00f4ture.') + '</p></div>';
    h += '<button class="btn" data-a="holdgo">' + (cutNext ? 'Voir la coupure' : tie ? 'Aller \u00e0 la prolongation' : 'Voir la cl\u00f4ture du tournoi') + '</button>';
  } else {
  h += '<div class="block" style="padding:10px 14px"><b>' + left.length + ' golfeur' + (left.length > 1 ? 's' : '') + ' encore sur le terrain</b><p class="small mute" style="margin:2px 0 0">Le dernier groupe (' + teeTime(lastG) + ') ' + (low === 0 ? 'n\u2019est pas encore parti' : 'en est au trou ' + (low + 1)) + '.</p></div>';
  h += '<button class="btn" data-a="teestep">Avancer d\u2019un trou</button><button class="btn sec" data-a="teeall">Tout terminer d\u2019un coup</button>';
  }
  { const tr = teeCur(c);   // v385 : sauter plusieurs trous d'un coup après ta ronde
    if (tr && left.length && low < 17) { const o = []; for (let k = low + 1; k <= 17; k++) o.push('<option value="w:' + (k - low) + '">' + teeClock(tr.anc + 18 + (c.tx || 0) + (k - low)) + ' · trou ' + (k + 1) + ' du dernier groupe</option>');
      h += '<label for="tejump" class="small mute" style="display:block;margin:10px 0 4px">Aller directement à…</label><select id="tejump" data-c="tejump"><option value="">Choisir un moment…</option>' + o.join('') + '</select>'; } }
  if (!sim) h += '<button class="btn sec sm" data-a="undo" style="width:100%;margin-top:4px">Corriger le trou 18</button>';
  h += grpBlock(18);
  const A = h; h = '';
  const B = '<h2>' + (sim ? 'Classement' : 'Ta ronde') + '</h2>' + '<p class="small mute" style="margin:0 0 2px">R\u00e9v\u00e9lation des scores adverses</p>' + chipRow([['instant', 'Tous les scores d\u2019un coup'], ['seq', 'Par s\u00e9quence'], ['gbg', 'Golfeur par golfeur']], S.ui.reveal || 'instant', 'revealmode') + '<div id="boardTop"></div>' + roundBlock(18);
  h += fanHTML(c);
  if (c.feed.length) h += '<h2>Journal</h2><ol class="log" reversed>' + c.feed.slice(0, 8).map(f => '<li><span class="n">' + f.n + '</span><div class="t">' + esc(f.t) + f.ev.map(e => '<div class="ev">' + esc(e) + '</div>').join('') + '</div></li>').join('') + '</ol>';
  return cols(A, isMgr() ? mgrPanels(B, 'plp') : B, isMgr() ? '' : h, 'play');
}

/* ---- Ronde 2 simulée (coupure ratée) ---- */
function vSpec() {
  if (teeCur(S.cur) && S.cur.k2 === 0 && S.cur.teeSeen && !S.cur.teeSeen[S.cur.r]) return vTees(true);
  if (S.cur.k2 >= 18) return vWait();
  if (!S.cur.k2 && preTeeOn(S.cur)) return vPreTee();
  const c = S.cur, k = c.k2, par = c.pars[k], rows = liveRows(k), lead = rows[0], me = rows.find(r => r.id === 0), rw = c.r === 0 ? c.wind : c.wind2;
  const roundLbl = S.one ? 'ronde simul\u00e9e' : c.r === 0 ? 'ronde 1 simul\u00e9e' : 'ronde 2 simul\u00e9e';
  let h = '<div class="top"><div><div class="ctx">' + esc(c.name) + ' \u00b7 ' + roundLbl + '</div>' + roundMeta(c) + '</div>' + teeLinks() + '</div>';
  h += '<div class="hole"><div class="lbl">' + (teeCur(c) && teeCur(c).o.indexOf(0) < 0 ? 'Dernier groupe \u00b7 trou ' + (k + 1) : 'Trou ' + (k + 1) + ' sur 18') + '</div><div class="par"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V3" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M7 4l12 4.5L7 13z" fill="currentColor"/></svg>Par ' + par + '</div></div>';
  h += '<button class="btn" data-a="simhole" style="margin-top:14px">Simuler le trou ' + (k + 1) + '</button>';
  h += '<button class="btn sec sm" data-a="finish" style="width:100%;margin-top:4px">Simuler le reste de la ronde</button>' + teeJumpHTML(c, teeCur(c));
  if (c.sw) h += '<div class="block" style="margin-top:12px;padding:10px 14px"><b>' + esc(LEAGUE_NAMES[c.pl]) + '</b> \u00b7 ' + (k && lead ? '<span>En t\u00eate :</span> ' + esc(nameOf(lead.id)) + ' (' + fmt(lead.tot) + ')' : '<span>' + (c.r === 0 ? fld(c).length : c.alive.length) + ' joueurs en lice</span>') + '</div>';
  else if (c.phase === 'sim2' && !c.made) h += '<div class="block" style="background:var(--meBg);border:1.5px solid var(--me);margin-top:12px;padding:10px 14px"><b>Tu as rat\u00e9 la coupure</b> (' + fmt(c.r1[0]) + ', coupure \u00e0 ' + fmt(c.cut) + '). ' + (k ? 'En t\u00eate : ' + esc(nameOf(lead.id)) + ' (' + fmt(lead.tot) + ').' : c.alive.length + ' joueurs poursuivent.') + '</div>';
  else h += '<div class="block" style="background:var(--meBg);border:1.5px solid var(--me);margin-top:12px;padding:10px 14px"><b>Tu es ' + posLbl(me) + ' \u00e0 ' + fmt(me.tot) + '</b>. ' + (k ? 'En t\u00eate : ' + esc(nameOf(lead.id)) + ' (' + fmt(lead.tot) + ').' : (c.r === 0 ? fld(c).length : c.alive.length) + ' joueurs en lice.') + '</div>';
  h += grpBlock(k);
  const A = h; h = '';
  const B = '<h2>Classement</h2><p class="small mute" style="margin:0 0 2px">R\u00e9v\u00e9lation des scores adverses</p>' + chipRow([['instant', 'Tous les scores d\u2019un coup'], ['seq', 'Par s\u00e9quence'], ['gbg', 'Golfeur par golfeur']], S.ui.reveal || 'instant', 'revealmode') + '<div id="boardTop"></div>' + roundBlock(k);
  h += fanHTML(c);
  if (c.feed.length) h += '<h2>Journal</h2><ol class="log" reversed>' + c.feed.slice(0, 8).map(f => '<li><span class="n">' + f.n + '</span><div class="t">' + esc(f.t) + f.ev.map(e => '<div class="ev">' + esc(e) + '</div>').join('') + '</div></li>').join('') + '</ol>';
  return cols(A, isMgr() ? mgrPanels(B, 'plp') : B, isMgr() ? '' : h, 'play');
}

/* ---- Fin de la ronde 1 ---- */
function vRoundEnd() {
  if (S.cur.sw) return vRoundEndSw();
  const c = S.cur, rows = liveRows18R1(), me = rows.find(r => r.id === 0), sim = S.mode === 'sim';
  let h = '', F = '';
  const T = '<div class="top"><div><h1>Ronde 1 termin\u00e9e</h1><div class="ctx">' + esc(c.name) + '</div></div></div>';
  h += '<div class="block hero"><div class="ctx">Ton score</div><div class="big ' + cls(me.tot) + '">' + fmt(me.tot) + '</div><p class="mute" style="margin:6px 0 0">' + posLbl(me) + ' sur ' + rows.length + ' \u00b7 ' + sum(myHoles(c)) + ' coups</p></div>';
  const diff = me.tot - c.cut;
  if (c.rc) h += '<div class="block"><p style="margin:0"><b>Classe de recrues</b> : aucune coupure, toute la classe joue la ronde 2. Chaque ronde compte pour ton index, qui d\u00e9cidera de ta ligue \u00e0 la fin de la saison.</p></div>';
  else h += '<div class="block"><p style="margin:0"><b>Coupure \u00e0 ' + fmt(c.cut) + '</b> : ' + c.alive.length + ' joueurs poursuivent. ' +
    (c.made ? '<span class="tag good">Tu passes</span> ' + (diff === 0 ? 'Juste sur la ligne.' : 'Avec ' + Math.abs(diff) + ' coup' + (Math.abs(diff) > 1 ? 's' : '') + ' de marge.') : '<span class="tag bad">Coupure rat\u00e9e</span> Il te manquait ' + diff + ' coup' + (diff > 1 ? 's' : '') + '.') + '</p></div>';
  if (c.made) F += '<button class="btn" data-a="' + (sim ? 'roundsim' : 'round') + '" data-r="1" style="margin-top:14px">' + (sim ? 'Simuler la ronde 2' : 'Jouer la ronde 2') + '</button>';
  else F += '<p class="small mute" style="margin:14px 0 0">Tu ne joues pas la ronde 2, mais tu peux la regarder se d\u00e9rouler.</p><button class="btn" data-a="spec">Simuler la ronde 2 trou par trou</button><button class="btn sec" data-a="finish">Simuler la ronde 2 d\u2019un coup</button>';
  if (!sim) F += '<button class="btn sec" data-a="undo">Corriger le dernier trou</button>';
  return T + cols(h, roundBlock(18), F, 'rend');
}

function vRoundEndSw() {   // v292 : fin de la ronde 1 suivie sans golfeur
  const c = S.cur, rows = liveRows18R1(), ld = rows[0];
  const T = '<div class="top"><div><h1>Ronde 1 termin\u00e9e</h1><div class="ctx">' + esc(c.name) + ' \u00b7 ' + esc(LEAGUE_NAMES[c.pl]) + '</div></div></div>';
  let h = '<div class="block hero"><div class="ctx">En t\u00eate</div><div class="big">' + esc(nameOf(ld.id)) + '</div><p class="mute" style="margin:6px 0 0">' + fmt(ld.tot) + (rows[1] && rows[1].tot === ld.tot ? ' \u00b7 <span>\u00e0 \u00e9galit\u00e9</span>' : '') + '</p></div>';
  h += '<div class="block"><p style="margin:0">' + (c.rc ? '<b>Aucune coupure</b>' : '<b><span>Coupure \u00e0 ' + fmt(c.cut) + '</span></b> \u00b7 <span>' + c.alive.length + ' joueurs poursuivent</span>') + '</p></div>';
  const F = '<button class="btn" data-a="spec" style="margin-top:14px">Simuler la ronde 2 trou par trou</button><button class="btn sec" data-a="finish">Simuler la ronde 2 d\u2019un coup</button>';
  return T + cols(h, roundBlock(18), F, 'rend');
}
/* ---- Fin de tournoi ---- */
function vTournEnd() {
  const H = S.hist[S.last.s - 1], t = H.t[S.last.t], pl = t.pl;
  const tL = l => l === 4 ? t.rc : t.lg[l], rc = pl === 4;
  const rows = tL(pl).rows, me = rows.find(r => r[0] === 0), myPay = (tL(pl).pay && tL(pl).pay[0]) || 0;
  const sl = VIEW.sl == null || (VIEW.sl === 4 && !rc) ? pl : VIEW.sl;
  let h = '', F = '';
  const T = '<div class="top"><div><h1>' + esc(t.name) + '</h1><div class="ctx">Tournoi ' + (S.last.t + 1) + ' \u00b7 ' + lgNm(pl) + (t.purse && !rc ? ' \u00b7 bourse totale ' + fmtMoney(t.purse) : '') + '</div></div></div>';
  if (t.duo) h += '<div class="block duo" style="border-left:5px solid ' + (t.duo.amt ? 'var(--good)' : 'var(--line)') + '"><b>' + (t.duo.amt ? '\ud83d\udc37 ' + fmtCash(t.duo.amt) + ' pour la tirelire' : 'Hors de la ligne de paye : rien pour la tirelire cette fois') + '</b><p class="small mute" style="margin:4px 0 0">Le gagnant touchait ' + fmtCash(t.duo.win) + ' \u00b7 \u00e0 remettre en tout : ' + fmtCash(duoTotals().due) + '</p></div>';
  h += '<div class="block hero"><div class="ctx">' + (me[1] === 0 ? 'Coupure rat\u00e9e' : 'Position finale') + '</div><div class="big">' + (me[1] === 0 ? fmt(me[2]) : (rows.filter(r => r[1] === me[1]).length > 1 ? 'T' : '') + me[1]) + '</div><p class="mute" style="margin:6px 0 0">' + (rc ? '<span>sur</span> ' + rows.length + (rcX(0) < 90 ? ' \u00b7 <span>index</span> ' + fmtHI(rcX(0)) + ' \u00b7 <span>rang de la classe</span> : ' : '') : (me[4] ? '+' + me[4] + ' point' + (me[4] > 1 ? 's' : '') : 'aucun point') + (myPay ? ' \u00b7 ' + fmtMoney(myPay) : '') + ' \u00b7 classement de saison : ') + (rc && rcX(0) >= 90 ? '' : t.pb === 0 ? ord(t.ra) : ord(t.rb) + ' \u2192 ' + ord(t.ra)) + '</p>' + courseMeta(t) + '</div>';
  const myMv = (t.mvs || []).filter(m => m[0] === 0).pop();
  if (myMv) h += '<div class="block" style="border-left:5px solid ' + (myMv[3] === 'up' ? 'var(--good)' : 'var(--bad)') + '"><b>' + (myMv[3] === 'up' ? '\u25B2 Tu montes en ' : '\u25BC Tu descends en ') + esc(LEAGUE_NAMES[myMv[2]]) + '</b> en pleine saison, ' + (myMv[3] === 'up' ? 'gr\u00e2ce \u00e0 ' : 'apr\u00e8s ') + esc(myMv[4]) + '. Ton prochain tournoi se joue dans cette ligue.</div>';
  const story = sl === 4 ? '' : storyHTML(t, S.last.s, S.last.t, sl, { hideMe: sl === pl });   // v234 : à côté des résultats (plus dans la colonne de gauche)
  F += '<button class="btn sec" data-a="tourn" data-s="' + S.last.s + '" data-t="' + S.last.t + '" data-l="' + sl + '" data-m="c1" style="margin-top:12px">Cartes de scores de tous les golfeurs</button><button class="btn sec" data-a="tourn" data-s="' + S.last.s + '" data-t="' + S.last.t + '" data-l="' + sl + '">Tous les r\u00e9sultats</button>';
  F += '<button class="btn" data-a="home">Continuer</button>';
  return T + cols(h, chipRow((rc ? [[4, 'Recrues']] : []).concat(LEAGUE_SHORT.map((n, i) => [i, 'L' + (i + 1)])), sl, 'sl') + '<div class="tendg"><div><h2>' + (sl === 4 ? '<span>R\u00e9sultats</span> \u00b7 <span>Recrues</span>' : 'R\u00e9sultats \u00b7 ' + LEAGUE_SHORT[sl]) + '</h2>' + resultsBoard(tL(sl).rows, { top: 10, l: sl, pay: tL(sl).pay || {}, at: [S.last.s, S.last.t], cut: tL(sl).cut, one: tL(sl).one, title: lgNm(sl) + ' \u00b7 R\u00e9sultats finaux', course: t.name }) + '</div><div class="tends">' + story + '</div></div>', F, 'rend tend');
}


/* ---- Classement de saison avec le résultat de chacun des 10 tournois ---- */
function seasonResults(s, l) {
  const H0 = S.hist[s - 1], ts = l === 0 && H0.fin && H0.fin.lg && H0.fin.lg[0] && H0.fin.lg[0].rows.length ? H0.t.concat([H0.fin]) : H0.t;
  return ts.map(t => {
    if (!t || !t.lg[l]) return null;
    const rows = t.lg[l].rows, pay = t.lg[l].pay || {}, cnt = {}, m = {}, cut1 = t.lg[l].cut;
    rows.forEach(r => { cnt[r[1]] = (cnt[r[1]] || 0) + 1; });
    const made = rows.filter(r => r[1] > 0).length, miss = rows.filter(r => r[1] === 0).map(r => r[2]);
    rows.forEach(r => {
      const x = m[r[0]] = { pos: r[1], pts: r[4], tie: r[1] > 0 && cnt[r[1]] > 1, tot: r[3] != null ? r[2] + r[3] : r[2], pay: pay[r[0]] || 0 };
      if (r[1] > 0 && r[3] == null && cut1 != null && r[2] > cut1) x.out = 1;   // tournoi d'une ronde : hors des places payées (aucun point), en rouge comme une coupure ratée
      if (r[1] === 0) { x.mcr = made + 1 + miss.filter(v => v < r[2]).length; x.mct = miss.filter(v => v === r[2]).length > 1; }   // rang final d'une coupure ratée (class\u00e9 selon la ronde 1)
    });
    return m;
  });
}
/* tournoi joué pendant que le golfeur était dans une autre ligue : case noircie avec cette ligue en blanc */
function offCell(t, id) {
  const x = t && tRowMap(t).get(id);
  return x ? '<td class="r roff" title="Jouait en Ligue ' + (x[0] + 1) + ' \u00e0 ce tournoi">L' + (x[0] + 1) + '</td>' : '<td class="r"></td>';
}
function resCell(x, mode) {
  if (!x) return '<td class="r"></td>';
  const c = x.pos === 1 ? 'rw' : x.pos === 0 || x.out ? 'rm' : x.pos <= 10 ? 'rt' : '';
  const val = mode === 'pts' ? x.pts : mode === 'score' ? fmt(x.tot) : mode === 'pay' ? (x.pay ? fmtMoney(x.pay) : '\u2013') : (x.pos === 0 ? (x.mcr ? (x.mct ? 'T' : '') + x.mcr : 'CUT') : (x.tie ? 'T' : '') + x.pos);
  return '<td class="r ' + c + '"' + (x.pos === 0 ? ' title="Coupure rat\u00e9e"' : x.out ? ' title="Hors des places pay\u00e9es : aucun point"' : '') + '>' + val + '</td>';
}
function statCells(res, id) {
  let t10 = 0, t20 = 0, made = 0, played = 0;
  res.forEach(m => { const x = m && m[id]; if (!x) return; played++; if (x.pos > 0 && !x.out) made++; if (x.pos > 0) { if (x.pos <= 20) t20++; if (x.pos <= 10) t10++; } });
  return '<td class="cp">' + (t10 || '') + '</td><td class="cp">' + (t20 || '') + '</td><td class="cp cw">' + (played ? made + '/' + played : '') + '</td>';
}
function leagueGrid(l, s, opts) {
  opts = opts || {}; const mode = VIEW.gv || 'pos', H = S.hist[s - 1];
  let list;
  if (opts.tableRows) list = opts.tableRows.map((r, i) => ({ id: r[0], pts: r[1], w: r[2], idx: i + 1, mv: !!r[4], gh: !!r[5] }));
  else list = displayRank(l);
  markZones(list, l, 'zu', 'zd', opts.tableRows ? H : null);
  const shown = opts.all ? list : pickRows(list, opts.top || 10, opts.around || 3);
  const res = seasonResults(s, l), cols = 2 + res.length + 4, HH = S.hist[s - 1];
  const mjCol = i => l === 0 && i < N_TOURN && ((HH.t[i] && HH.t[i].maj) || (!HH.t[i] && s === S.season && isMajorT(i)));
  let h = chipRow([['pos', 'Positions'], ['pts', 'Points'], ['score', 'Score'], ['pay', 'Gains']], mode, 'gv');
  h += '<div class="cardwrap' + (mode === 'pay' ? ' wide-pay' : '') + (opts.lgall ? ' lgall' : '') + '" role="region" aria-label="Classement de saison et r\u00e9sultat de chaque tournoi" tabindex="0"><table class="cards' + (CFG.showIdx ? ' wi' : '') + '"><thead><tr class="hn"><th class="s1">Golfeur</th><th class="s2">Pts</th>' +
    range(1, res.length).map(i => { const lb = i > N_TOURN ? 'F' : i + (mjCol(i - 1) ? '\u2605' : ''), tt = i > N_TOURN ? ' title="Finale (top 30)"' : mjCol(i - 1) ? ' title="Majeur"' : ''; return '<th class="rc' + (i > N_TOURN ? ' rfin' : mjCol(i - 1) ? ' rmaj' : '') + '"' + tt + '>' + (res[i - 1] ? '<a data-a="tourn" data-s="' + s + '" data-t="' + (i - 1) + '" data-l="' + l + '" style="color:inherit;text-decoration:underline">' + lb + '</a>' : lb) + '</th>'; }).join('') + '<th class="cp">V</th><th class="cp">Top 10</th><th class="cp">Top 20</th><th class="cp cw">Coupure</th></tr></thead><tbody>';
  const tgt = CFG.varLg && l < 3 && !opts.tableRows && s === S.season ? relBot() : null; let safeDone = false;   // v332 : ligne de relégation (N derniers)
  shown.forEach(r => {
    if (r.gap) { h += '<tr class="gap"><td colspan="' + cols + '">\u00b7\u00b7\u00b7</td></tr>'; return; }
    const below = tgt != null && !r.gh && r.zone === 'zd';
    if (below && !safeDone) { safeDone = true; h += '<tr class="safeln"><td class="s1" colspan="2"><span>Zone de rel\u00e9gation (' + tgt + ' derniers)</span></td><td colspan="' + (cols - 2) + '"></td></tr>'; }
    h += '<tr' + (r.id === 0 ? ' class="me"' : '') + '><td class="s1 ' + r.zone + '"><span class="nmr"><span class="pp">' + (r.idx === null ? '\u2013' : r.idx) + '</span><span class="flg">' + flagOf(r.id, 20, opts.tableRows ? [s, N_TOURN - 1] : null) + '</span><span class="nmb"><a class="nmt" data-a="golfer" data-id="' + r.id + '" style="color:inherit;text-decoration:none">' + esc(nameOf(r.id)) + '</a>' + (r.gh ? mvPill(r.id, s, l, 'gh') : r.mv ? mvPill(r.id, s, l, 'mv') : '') + hxTag(r.id, opts.tableRows ? [s, N_TOURN - 1] : null, '') + (opts.tableRows ? '' : exBadge(r.id, l) + mvBadge(r.id, l)) + '</span>' + fmark(r.id) + '</span></td><td class="s2">' + r.pts + '</td>' +
      res.map((m, i) => !m ? '<td class="r"></td>' : m[r.id] ? resCell(m[r.id], mode) : offCell(H.t[i], r.id)).join('') + '<td class="cp">' + (r.w || '') + '</td>' + statCells(res, r.id) + '</tr>';
  });
  h += '</tbody></table></div><div class="legend cl"><span><i class="lg rw"></i>Victoire</span><span><i class="lg rt"></i>Top 10</span><span><i class="lg rm"></i>Coupure rat\u00e9e</span><span><i class="lg roff"></i>Jouait dans une autre ligue (L1 \u00e0 L4)</span>' +
    (l > 0 ? '<span><i style="background:#5CC796"></i>' + lgUpTxt(l) + '</span><span>' + (CFG.varLg && CFG.gpCount ? 'promus en cours de saison : gardent leur rang et comptent dans le top ' + vlCand(l) : 'promus en cours de saison : gardent leur rang, sans prendre de place') + '</span>' : '') + (l < 3 ? '<span><i style="background:var(--underB)"></i>' + lgDnTxt(l) + '</span><span>arriv\u00e9s en cours de saison : prot\u00e9g\u00e9s</span>' + (CFG.exWin || CFG.exChamp || CFG.exCar ? '<span>\ud83d\udee1 exempt\u00e9 : jamais rel\u00e9gu\u00e9</span>' : '') : '') + (CFG.showForm ? '<span>\u25B2 en forme \u00b7 \u25BC en m\u00e9forme</span>' : '') + (CFG.showIdx ? '<span>Pastille : handicap</span>' : '') + '</div><p class="small mute" style="margin:0 0 6px">Top 10 et Top 20 comptent aussi les victoires. Coupure = coupures r\u00e9ussies sur tournois jou\u00e9s.</p>';
  return h;
}

/* ---- Ligues ---- */
function vLeagues() {
  const l = VIEW.l == null ? (plLeague() === 4 ? 4 : vLg()) : VIEW.l, s = VIEW.s || S.season;
  if (l === 4) return vRcLeague(s);
  const H = S.hist[s - 1], cur = s === S.season;
  const T = '<div class="top"><h1>Ligues</h1></div>';
  let h = chipRow(LEAGUE_SHORT.map((n, i) => [i, 'L' + (i + 1) + ' ' + n]).concat(rcHas(s) ? [[4, 'Recrues']] : []), l, 'league');
  const seasons = S.hist.map(x => x.s);
  if (seasons.length > 1) h += '<select data-c="season" aria-label="Saison">' + seasons.slice().reverse().map(x => '<option value="' + x + '"' + (x === s ? ' selected' : '') + '>Saison ' + yr(x) + (x === S.season ? ' (en cours)' : '') + '</option>').join('') + '</select>';
  h += '<h2>' + LEAGUE_NAMES[l] + '</h2>';
  if (cur) h += leagueGrid(l, s, { all: true, lgall: 1 });
  else if (H.end) h += leagueGrid(l, s, { all: true, lgall: 1, tableRows: H.end.tables[l] });
  let R = '<h2>Tournois</h2>';
  const played = H.t.map((t, i) => [t, i]).filter(x => x[0]);
  if (!played.length) R += '<p class="mute">Aucun tournoi jou\u00e9 cette saison.</p>';
  else R += '<div class="scroll"><table class="plain"><tr><th>#</th><th>Terrain</th><th>Vainqueur</th><th class="r">Score</th><th class="r">Bourse totale</th></tr>' + played.reverse().map(([t, i]) => {
    const w = t.lg[l].rows[0]; return '<tr><td>' + (i + 1) + '</td><td><a href="#" data-a="tourn" data-s="' + s + '" data-t="' + i + '" data-l="' + l + '">' + esc(t.name) + '</a></td><td>' + esc(nameOf(w[0])) + '</td><td class="r ' + cls(w[2] + w[3]) + '">' + fmt(w[2] + w[3]) + '</td><td class="r">' + (t.purse ? fmtMoney(t.purse) : '\u2013') + '</td></tr>';
  }).join('') + '</table></div>';
  R += '<button class="btn sec" data-a="journal" style="margin-top:12px">Journal des r\u00e9sum\u00e9s</button>';
  if (isMgr()) return T + leaguesMgr(l, s, H, cur, seasons, R);
  return T + cols(h, R, '', 'lg');
}


