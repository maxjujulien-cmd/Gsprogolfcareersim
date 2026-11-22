/* ============ FAMILLES (v193) ============
   De temps en temps, une recrue est de la même famille qu'un golfeur actif ou retraité : fils (le parent a 20 à 40 ans de plus),
   frère (0 à 8 ans de plus, encore actif) ou cousin (15 ans d'écart au plus). Même nom de famille et même nation.
   Environ 1 recrue sur 40 (≈ 1 par saison). Un fils ou un frère hérite d'un peu du talent de son parent (20 % de l'écart
   entre son plafond et le sommet du parent) : rare et léger, sans effet mesurable sur le calibrage. */
const FAM = { p: 0.025, mix: [['pere', 0.4], ['frere', 0.4], ['cousin', 0.2]], inh: 0.2, jr: 0.15 };
const FAM_LBL = { pere: 'Père', fils: 'Fils', frere: 'Frère', cousin: 'Cousin' };
const FAM_BACK = { pere: 'fils', fils: 'pere', frere: 'frere', cousin: 'cousin' };
function famRec(id) { return S.G[id] || (S.old && S.old[id]) || null; }
function famOf(id) { const r = famRec(id); return r && r.fam ? r.fam : []; }
function famAgeNow(id) { const g = S.G[id]; if (g) return g.a; const o = S.old && S.old[id]; return o && o.a != null ? o.a + (S.season - (o.s || S.season)) : null; }
function famPeak(id) { const g = S.G[id]; if (g) return Math.max(g.o || 0, g.op || 0); const o = S.old && S.old[id]; return o && o.oh && o.oh.length ? Math.max.apply(null, o.oh.map(x => x[1])) : 0; }
function famSurname(n) { const p = String(n || '').replace(/ (Jr\.|II|III|IV)$/, '').split(' '); return p.length > 1 ? p.slice(1).join(' ') : null; }
function famPick(age) {   // tirage d'un lien de parenté pour une recrue de cet âge (ou null)
  if (typeof S === 'undefined' || !S || !S.G || !S.hist || Math.random() >= FAM.p) return null;
  let r = Math.random(), type = 'cousin'; for (const [t, w] of FAM.mix) { if ((r -= w) < 0) { type = t; break; } }
  const cand = [];
  const consider = (id, retired) => {
    if (id === 0) return; const rec = famRec(id); if (!rec || !rec.nat || !famSurname(rec.n)) return;
    if (famOf(id).length >= 4) return;
    const a = famAgeNow(id); if (a == null) return; const d = a - age;
    let w = 0;
    if (type === 'pere' && d >= 20 && d <= 40) w = 1 + Math.min(6, (rec.cw || 0) / 2) + (famPeak(id) >= 800 ? 3 : 0);
    else if (type === 'frere' && !retired && d >= 0 && d <= 8) w = 1;
    else if (type === 'cousin' && Math.abs(d) <= 15 && (!retired || S.season - (rec.s || 0) <= 10)) w = 1;
    if (w > 0) cand.push([id, w]);
  };
  Object.keys(S.G).forEach(k => consider(+k, false));
  if (type !== 'frere') Object.keys(S.old || {}).forEach(k => consider(+k, true));
  if (!cand.length) return null;
  let t = Math.random() * cand.reduce((a, c) => a + c[1], 0), id = cand[0][0];
  for (const c of cand) { if ((t -= c[1]) <= 0) { id = c[0]; break; } }
  return { id, rel: type, peak: famPeak(id) };
}
function famLink(a, b, relOfB, ga) {   // relOfB : ce que b est pour a (ex. 'pere') ; ga : la fiche de a si elle n'est pas encore dans S.G (recrue)
  const ra = ga || famRec(a), rb = famRec(b); if (!ra || !rb || a === b) return;
  ra.fam = ra.fam || []; rb.fam = rb.fam || [];
  if (!ra.fam.some(x => x[0] === b)) ra.fam.push([b, relOfB]);
  if (!rb.fam.some(x => x[0] === a)) rb.fam.push([a, FAM_BACK[relOfB]]);
}
function famApply(g, F, used) {   // nom, nation et liens d'une recrue qui a un parent sur le circuit
  const rel = famRec(F.id), sur = famSurname(rel.n), nation = NATIONS.find(x => x.name === rel.nat);
  let n = null;
  if (F.rel === 'pere' && Math.random() < FAM.jr && !/ (Jr\.|II|III|IV)$/.test(rel.n)) n = rel.n + ' Jr.';
  for (let i = 0; i < 40 && (!n || used.has(n)); i++) { const first = nation ? pickNameFor(nation).split(' ')[0] : String(g.n).split(' ')[0]; n = first + ' ' + sur; if (n === rel.n) n = null; }
  if (!n || used.has(n)) return;
  used.add(n); g.n = n; g.nat = rel.nat; g.fn = 1;   // fn : arrivée à annoncer dans les nouvelles
  famLink(g.id, F.id, F.rel, g);
  if (F.rel === 'pere') famOf(F.id).filter(x => x[1] === 'fils' && x[0] !== g.id).forEach(x => famLink(g.id, x[0], 'frere', g));
  if (F.rel === 'frere') famOf(F.id).forEach(x => { if (x[0] === g.id) return; if (x[1] === 'pere') famLink(g.id, x[0], 'pere', g); else if (x[1] === 'frere') famLink(g.id, x[0], 'frere', g); });
}
function famMain(id) {   // le lien le plus marquant, pour une ligne courte (« Fils de … »)
  const f = famOf(id); if (!f.length) return null;
  const order = { pere: 0, fils: 1, frere: 2, cousin: 3 };
  return f.slice().sort((a, b) => order[a[1]] - order[b[1]])[0];
}
function famDe(rel, id) { const pre = { pere: 'Fils de ', fils: 'Père de ', frere: 'Frère de ', cousin: 'Cousin de ' }[rel]; return pre + '<a href="#" data-a="golfer" data-id="' + id + '">' + esc(nameOf(id)) + '</a>'; }
function famProfileHTML(id) {
  if (!S || id === 0) return ''; const f = famOf(id); if (!f.length) return '';
  const order = { pere: 0, frere: 1, fils: 2, cousin: 3 };
  return '<div class="block famblk"><h3 style="margin-top:0">Famille</h3>' + f.slice().sort((a, b) => order[a[1]] - order[b[1]]).map(([rid, rel]) => {
    const g = S.G[rid], o = !g && S.old && S.old[rid], l = g ? leagueOf(rid) : -1, hm = S.hof && S.hof.m.some(m => m.k === String(rid));
    const sub = g ? (l >= 0 ? 'Ligue ' + (l + 1) + ' · ' : '') + g.a + ' ans · ' + TIERS[tierOf(g)][1] : o ? 'Retraité' + (o.s ? ' en ' + yr(o.s) : '') + (o.cw ? ' · ' + o.cw + ' victoire' + (o.cw > 1 ? 's' : '') : '') : '';
    return '<div class="famrow"><span class="famrel">' + FAM_LBL[rel] + '</span><div>' + flagOf(rid, 16) + ' <a href="#" data-a="golfer" data-id="' + rid + '">' + esc(nameOf(rid)) + '</a>' + (hm ? ' <span class="famhof" title="Temple de la renommée">★ Temple</span>' : '') + '<div class="small mute">' + sub + '</div></div></div>';
  }).join('') + '</div>';
}

/* v247 : âge des recrues de 17 à 25 ans, surtout 17 à 20 (≈ 70 %) ; les plus vieilles sont des cas moins fréquents */
const ROOK_AGE_W = [[17, 16], [18, 20], [19, 19], [20, 15], [21, 9], [22, 7], [23, 6], [24, 4], [25, 4]];
function rookieAge() { let r = Math.random() * ROOK_AGE_W.reduce((a, x) => a + x[1], 0); for (const [a, w] of ROOK_AGE_W) { r -= w; if (r < 0) return a; } return 19; }
/* v418 : profils de départ des recrues. Le vrai plafond ne change pas, seul le point de départ change :
   brut (25 %) = 30 à 50 % du plafond, et une fois sur deux une éclosion tardive (2 à 4 ans de retard) ;
   standard = comme avant ; prêt à jouer (CFG.rcReady %, 25 par défaut) = 75 à 92 % du plafond, peu de marge.
   Simulation (3 mondes × 30 saisons) : 4 fois plus de recrues placées directement en L2, 2 fois plus en L3, environ
   1 recrue en L1 aux 3 saisons, 2,5 fois plus de golfeurs qui plafonnent dans leur ligue de départ, autant d'éclosions
   tardives et un circuit aussi fort qu'avant (médianes des ligues à ±11 points). Voir docs/parametres.md. */
const RPROF = { rawP: 0.25, raw: [0.30, 0.50], ready: [0.75, 0.92], lbP: 0.5 };
function rpDraw() { const rd = clamp((CFG.rcReady == null ? 25 : +CFG.rcReady) / 100, 0, 0.6), u = Math.random(); return u < RPROF.rawP ? 0 : u < 1 - rd ? 1 : 2; }
function newRookie(id, used) {
  const age = rookieAge();
  const ph = phenOn() && S && S.G && !phenActive() && Math.random() < PHEN.p;
  const F = ph ? null : famPick(age);
  let pt = ph ? PHEN.ptMin + Math.random() * (PHEN.ptMax - PHEN.ptMin) : clamp(ROOK.ptC + (ceilShape(drawOverall()) - ROOK.ptC) * ROOK.ptS * eraMul(), 20, 995)   /* v419-v420 : ceilShape */;
  if (F && F.rel !== 'cousin' && F.peak > 0) pt = clamp(pt + FAM.inh * (F.peak - pt), 20, 995);   // un peu du talent familial
  const t = (ROOK.ageMax - age) / (ROOK.ageMax - ROOK.ageMin);
  let frac = clamp(ROOK.f0 + (1 - t) * ROOK.f1 + gauss() * 0.08, 0.25, 0.97);
  const rp = ph ? 1 : rpDraw();   // v418 : profil de départ (0 brut, 1 standard, 2 prêt à jouer) ; le vrai plafond ne change pas
  if (rp === 0) frac = RPROF.raw[0] + Math.random() * (RPROF.raw[1] - RPROF.raw[0]);
  else if (rp === 2) frac = RPROF.ready[0] + Math.random() * (RPROF.ready[1] - RPROF.ready[0]);
  const o = clamp(Math.min(pt - 5, pt * frac), 5, ROOK.cap);
  const g = newGolfer(id, used, o, age);
  g.o = o; g.op = o; g.cs = 0; g.sg = 0;
  let est = pt + gauss() * ROOK.scout; if (est > ROOK.scPiv) est = ROOK.scPiv + (est - ROOK.scPiv) * ROOK.scS;   // v191 : prudents sur les hauts potentiels (≈ 1 recrue cotée Generational aux 2 cuvées) ; le vrai plafond (pt) ne change pas et se révèle au fil des intersaisons
  g.p = clamp(est, o, 1000);   // estimation des dépisteurs
  if (g.bio) g.bio.pm = mediaPick(Object.assign({}, g, { pt }));   // v286 : la personnalité tient compte du potentiel annoncé
  initDev(g); g.pt = pt; (g.tr || []).forEach(t => { t.sn = 0; t.rv = null; });   // une recrue arrive sans talent connu
  g.rp = rp; if (rp === 0 && !g.lb && Math.random() < RPROF.lbP) g.lb = 2 + Math.floor(Math.random() * 3);   // v418 : un talent brut éclot souvent tard
  if (ph) phenMake(g);
  if (F) { try { famApply(g, F, used); } catch (e) { } }
  // v247 : rarement (CFG.rcProd %), une recrue arrive déjà prête (Pro à Elite). Son potentiel n'est pas garanti :
  // souvent bon, parfois juste au-dessus de son niveau ; plus elle est jeune, plus elle a de marge en moyenne.
  if (!ph && CFG.rcOn && Math.random() < (CFG.rcProd == null ? 0.5 : CFG.rcProd) / 100) {
    const o2 = 640 + Math.random() * 200, room = Math.max(8, (40 + (25 - age) * 14) * Math.exp(gauss() * 0.6));
    g.o = g.op = o2; g.pt = clamp(o2 + room, o2 + 5, 995);
    let est = g.pt + gauss() * ROOK.scout; if (est > ROOK.scPiv) est = ROOK.scPiv + (est - ROOK.scPiv) * ROOK.scS;
    g.p = clamp(est, o2, 1000); initDev(g); g.pt = clamp(o2 + room, o2 + 5, 995); g.prd = 1; delete g.rp;
  }
  return g;
}

/* Retraite forcée : un golfeur de 24 ans et plus qui termine une 4e saison complète de suite en Ligue 4 sans monter
   perd sa place sur le circuit (sa place va à une recrue). Simulation de 40 saisons : ~13 retraites forcées par saison,
   ~6 recrues de plus, Ligue 4 plus jeune et plus forte. */
const FORCED_L4 = { n: 4, age: 24, vn: 2, vage: 26 };
const fL4N = f => f === 2 ? FORCED_L4.vn : FORCED_L4.n;   // saisons en L4 selon la règle de retraite forcée
function forcedRisk(g, l) { return g && l === 3 && (((g.y4 || 0) >= FORCED_L4.n - 1 && g.a >= FORCED_L4.age) || ((g.y4 || 0) >= FORCED_L4.vn - 1 && g.a >= FORCED_L4.vage && FORCED_L4.n < 99)); }
/* Époques de talent (v192) : une valeur S.era qui dérive lentement d'une saison à l'autre (marche aléatoire qui revient vers 0).
   Elle étire ou resserre le talent des nouvelles recrues : certaines décennies produisent beaucoup plus de grands golfeurs que d'autres. */
function eraMul() { return 1 + (ROOK.eraAmp || 0) * clamp((S && S.era) || 0, -1.6, 1.6); }
function eraStep() { if (!S) return; S.era = clamp(((S.era || 0) * ROOK.eraKeep) + gauss() * ROOK.eraSd, -1.6, 1.6); }
/* ---- Montées et descentes de fin de saison (v206) ----
   Ligues fixes : au-delà des 140 premiers (FIELD − MOVE) on descend ; les meilleurs du dessous montent pour remplir à 150.
   Ligues variables (Réglages › Avancé, par défaut) : L1 à L3 entre 130 et 170 golfeurs selon le niveau du circuit.
     - le top 120 garde sa place ; au-delà, on reste seulement avec un index au standard de la ligue (VL.std) ;
     - les 5 premiers du dessous montent toujours, du 6e au 20e s'ils ont l'index du standard de la ligue du dessus ;
     - la L4 n'a pas de limite ; les recrues gardent le total à 600.
     Standards calibrés par simulation (6 parties de 50 saisons) : L1 moyenne ≈ 153 golfeurs, de 130 (époque faible) à 170 (forte).
   Exemptés (🛡) : jamais relégués (victoire récente, champion de la saison passée, exemption unique de carrière). */
/* ---- Majeurs (L1 seulement) et Finale (v207) ----
   Majeurs : tournois 3, 5, 7 et 9 de la L1 ; points ×2 et bourse ×1,5. Les autres ligues jouent un tournoi normal.
   Finale : un 11e tournoi pour le top 30 (et égalités) de la L1 ; aucune coupure, points ×2, bourse ×2.
   Elle se joue après le 10e tournoi et compte pour le titre de la L1. Stockée à part (H.fin), hors des 10 tournois. */
const commOn = () => !!(S && S.comm);
const settingsLocked = () => !!(S && S.lockOn && !S.duo && !S.presim && !S.comm && (S.season > (S.debut || 1) || S.t > 0 || S.cur));
/* v297 : on peut reverrouiller les réglages après les avoir déverrouillés */
const canRelock = () => !!(S && !S.lockOn && !S.duo && !S.presim && !S.comm && (S.season > (S.debut || 1) || S.t > 0 || S.cur));
const relockLink = () => canRelock() ? ' <a href="#" data-a="relock" style="white-space:nowrap">🔒 Reverrouiller</a>' : '';
const lockWrap = h => settingsLocked() ? '<div class="lockz on" aria-disabled="true">' + h + '</div>' : h;
function lockBanner() {
  if (commOn()) return '<p class="small mute" style="margin:0 0 10px">\ud83d\udee0\ufe0f Mode commissaire : tous les r\u00e9glages sont d\u00e9bloqu\u00e9s.</p>';
  if (settingsLocked()) return VIEW.confirmUnlock ? '<div class="block" style="border-left:5px solid var(--bad)"><b>D\u00e9verrouiller les r\u00e9glages de ta carri\u00e8re ?</b><p class="small" style="margin:4px 0 8px">Tes records et ton Temple pourraient ne plus se comparer d\u2019une \u00e9poque \u00e0 l\u2019autre. Le d\u00e9verrouillage sera not\u00e9 dans les nouvelles.</p><div class="row"><button class="btn danger sm" data-a="unlock2">D\u00e9verrouiller</button><button class="btn sec sm" data-a="unlock0">Annuler</button></div></div>'
    : '<div class="block" style="border-left:5px solid var(--acc)">\ud83d\udd12 <b>R\u00e9glages verrouill\u00e9s pour ta carri\u00e8re.</b> <span class="small mute">Choisis \u00e0 la cr\u00e9ation de la partie, ils restent visibles. L\u2019affichage reste libre.</span> <a href="#" data-a="unlock" style="white-space:nowrap">D\u00e9verrouiller\u2026</a></div>';
  if (S && S.lockOn && !S.duo && !settingsLocked()) return '<p class="small mute" style="margin:0 0 10px">\ud83d\udd13 Tu peux encore ajuster ces r\u00e9glages : ils se verrouilleront \u00e0 ton premier tournoi.</p>';
  if (S && S.unl && S.unl.length) return '<p class="small mute" style="margin:0 0 10px"><span>\ud83d\udd13 R\u00e9glages d\u00e9verrouill\u00e9s en ' + S.unl.map(u => yr(u.s)).join(', ') + '.</span>' + relockLink() + '</p>';
  if (canRelock()) return '<p class="small mute" style="margin:0 0 10px"><span>🔓 Réglages déverrouillés.</span>' + relockLink() + '</p>';
  return '';
}
