/* ============ ÉVÉNEMENTS ET DÉMARRAGE ============ */
function toast(msg) {
  const d = document.createElement('div'); d.className = 'toast'; d.textContent = msg; d.setAttribute('role', 'status');
  document.body.appendChild(d); setTimeout(() => d.remove(), 2400);
}
function skRefresh() { const el = document.querySelector('.skbox'); if (!el || !S.cur) return; const tmp = document.createElement('div'); tmp.innerHTML = skInputHTML(S.cur, S.cur.ps.length); const nb = tmp.querySelector('.skbox'); if (nb) el.replaceWith(nb); }
function refreshHoleUI() {
  const c = S.cur, par = c.pars[c.ps.length];
  const v = document.getElementById('val'), vd = document.getElementById('verdict');
  if (v) { v.textContent = VIEW.val; v.classList.remove('pop'); void v.offsetWidth; v.classList.add('pop'); }
  if (vd) vd.textContent = verdictFor(VIEW.val - par, VIEW.val);
  document.querySelectorAll('.chip[data-a="setv"]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.v === VIEW.val)));
}
function tabGo(v) {
  if (v === 'home') go(S.cur && S.cur.phase === 'cut' ? 'roundEnd' : 'home');
  else if (v === 'leagues') go('leagues', { l: plLeague() === 4 ? 4 : vLg() });
  else go(v);
}
/* v223 : le formulaire du menu garde ce qu'on y a tapé quand on change un choix (mode, format, langue…) */
function newFormSave() { const g = id => document.getElementById(id); if (!g('nm')) return; { const dd = document.querySelector('.nfcrs'); if (dd) VIEW.nfOpen = dd.open; } VIEW.nf = { nm: g('nm').value, lg: g('lg') ? g('lg').value : null, sy: g('startyear') ? g('startyear').value : null, ps: g('presim') ? g('presim').value : null, hc: g('nhc') ? g('nhc').value : null, nat: g('nnat') ? g('nnat').value : (VIEW.nf && VIEW.nf.nat), ag: g('nage') ? g('nage').value : (VIEW.nf && VIEW.nf.ag), bio: ['Ct', 'Ht', 'Wt', 'Lf'].map(k => g('n' + k) ? g('n' + k).value : ((VIEW.nf && VIEW.nf.bio) || [])[['Ct', 'Ht', 'Wt', 'Lf'].indexOf(k)]) }; }
function newFormLoad() { const f = VIEW.nf; if (!f) return; const g = id => document.getElementById(id); if (g('nm') && f.nm != null) g('nm').value = f.nm; if (g('lg') && f.lg != null && !VIEW.lgReset) g('lg').value = f.lg; if (g('startyear') && f.sy != null) g('startyear').value = f.sy; if (g('presim') && f.ps != null) { g('presim').value = f.ps; const h = g('presimHint'); if (h) h.textContent = presimHint(); } if (g('nhc') && f.hc != null) g('nhc').value = f.hc; if (g('nnat') && f.nat != null) g('nnat').value = f.nat; if (g('nage') && f.ag != null) g('nage').value = f.ag; if (f.bio) ['Ct', 'Ht', 'Wt', 'Lf'].forEach((k, i) => { if (g('n' + k) && f.bio[i] != null) g('n' + k).value = f.bio[i]; }); VIEW.lgReset = false; }
async function act(a, el) {
  const d = el.dataset;
  if ((!S || VIEW.name === 'new') && document.getElementById('nm')) newFormSave();
  if (/^pn/.test(a)) { pnAct(a, el); return; }
  if (/^(clock|drawcourses|randomcourses|pigeadd|pigedraw|futclr|futwipe|rrand|rpurse|voysort)$/.test(a)) futOn();   // v405 : le tri du trajet aussi   // v315 : le dé fonctionne aussi pour les saisons futures
  switch (a) {
    case 'start': {
      const name = (document.getElementById('nm').value || 'Toi').trim() || 'Toi';
      const mode = VIEW.mode === 'sim' ? 'sim' : VIEW.mode === 'duo' ? 'duo' : 'manual';
      if (S && !d.ok && (mode === 'duo' ? 'save-duo' : 'save') === SLOT) { const cf = document.getElementById('newconf'); if (cf) { cf.hidden = false; cf.scrollIntoView({ block: 'center' }); } break; }   // v222 : depuis le menu principal, on confirme avant d'effacer la partie en cours
      const league = +document.getElementById('lg').value;
      const target = mode === 'duo' ? 'save-duo' : 'save';
      if (target !== SLOT) { if (S) persistNow(); const ex = await dbGet(target); if (ex && ex.G && ex.L) { await switchSlot(target); toast(target === 'save-duo' ? 'Ta partie Duo existe d\u00e9j\u00e0 : la voici' : 'Ta carri\u00e8re existe d\u00e9j\u00e0 : la voici'); break; } setSlot(target); }
      const joinYear = +((document.getElementById('startyear') || {}).value || 0) || null;
      const presimN = Math.max(0, Math.min(PRESIM_MAX, Math.round(+((document.getElementById('presim') || {}).value || 0) || 0)));
      // l'ann\u00e9e d'arriv\u00e9e est celle de la premi\u00e8re saison du joueur : la saison 1 du circuit est donc N ans plus t\u00f4t
      const startYear = presimN > 0 ? (joinYear || new Date().getFullYear()) - presimN : joinYear;
      const npre = VIEW.npre || 'real';
      const nat0 = mode === 'manual' ? ((document.getElementById('nnat') || {}).value || '').trim() : '';
      const later = mode !== 'duo' && VIEW.narr === 'later';
      newGame(name, league, mode, startYear, presimN, VIEW.fmt === 1, later);
      if (nat0) { S.nat = nat0; persist(); }
      if (VIEW.ncrf && BANK.length) { S.crf = Object.assign({}, VIEW.ncrf); crfRemember(); const N = nfNeu(); S.cfg = S.cfg || {}; S.cfg.crRef = N.cr; S.cfg.slopeRef = N.sl; S.cfg.distRef = N.d; setCfg(S.cfg); persist(); }   // v269 : terrains et terrain moyen choisis à la création
      if (mode === 'manual') { const ag = Math.round(+((document.getElementById('nage') || {}).value || 22)); S.pk = S.pk || { cur: [0, 0, 0], best: [0, 0, 0], cw: 0 }; S.pk.a = Math.max(17, Math.min(50, ag || 22)); S.pk.bio = bioFromForm('n', S.nat); persist(); }   // v268 : âge du joueur manuel   // v434 : 17 ans minimum, ville, taille, poids, côté
      { const hv = parseFloat(String((document.getElementById('nhc') || {}).value || '').replace(',', '.')), k = VIEW.lvlk || 'l2c';   // v237 : aussi en mode simulé (niveau des adversaires seulement)
        if (!isNaN(hv)) { S.cfg.lvl = lvlDelta(hv, k); S.cfg.lvlH = hv; S.cfg.lvlK = k; setCfg(S.cfg); persist(); } }
      if (mode !== 'duo') { advPreset(npre, true); S.cfg.majPts = +(VIEW.nmaj || '1.25'); setCfg(S.cfg); S.lockOn = true; S.debut = S.season; persist(); }
      VIEW = { name: 'home' }; runPresim();   // v321 : toujours (saisons cachées du monde de départ)
      break;
    }
    case 'setmode': VIEW.mode = d.v; if (d.v === 'duo' && VIEW.nf) VIEW.nf.lg = '0'; render(); break;
    case 'slot': switchSlot(d.v); break;
    case 'duokey': duoKey(); break;
    case 'tlf': VIEW.tlf = d.v; render(); break;
    case 'tlog': { const o = new Set(VIEW.tlo || []); o.has(d.k) ? o.delete(d.k) : o.add(d.k); VIEW.tlo = Array.from(o); render(); break; }
    case 'ibx': go('inbox', { ibf: 'all' }); break;
    case 'ibxf': VIEW.ibf = d.v; VIEW.chk = []; render(); break;
    case 'ibxopen': { if (d.id === '' || d.id == null) break; const id = +d.id, n = (S.news || []).find(x => x.id === id); if (!n) break; if (!n.rd) { n.rd = 1; persist(); } if (VIEW.name !== 'inbox') { go('inbox', { ibf: 'all', sel: id }); break; } VIEW.sel = id; VIEW.undo = null; render(); if (!isPC()) window.scrollTo(0, 0); break; }
    case 'ibxback': VIEW.sel = null; render(); break;
    case 'ibxchk': { const id = +d.id, c = new Set(VIEW.chk || []); c.has(id) ? c.delete(id) : c.add(id); VIEW.chk = Array.from(c); render(); break; }
    case 'ibxall': { const l = ibxList(VIEW.ibf || 'all'), c = new Set(VIEW.chk || []), all = l.length && l.every(n => c.has(n.id)); VIEW.chk = all ? [] : l.map(n => n.id); render(); break; }
    case 'ibxunread': { const n = (S.news || []).find(x => x.id === +d.id); if (n) { delete n.rd; persist(); } VIEW.sel = null; render(); break; }
    case 'ibxdel': { const id = +d.id, l = ibxList(VIEW.ibf || 'all'), i = l.findIndex(n => n.id === id), nx = l[i + 1] || l[i - 1]; ibxDelete([id]); VIEW.sel = nx ? nx.id : null; /* v242 : on passe au message suivant (aussi sur mobile) */ if (VIEW.sel != null) { const m = S.news.find(x => x.id === VIEW.sel); if (m) m.rd = 1; } render(); break; }
    case 'ibxdelsel': { const c = new Set(VIEW.chk || []), ids = ibxList(VIEW.ibf || 'all').filter(n => c.has(n.id)).map(n => n.id); if (ids.includes(VIEW.sel)) VIEW.sel = null; ibxDelete(ids); render(); break; }
    case 'ibxreadsel': { const c = new Set(VIEW.chk || []); ibxList(VIEW.ibf || 'all').forEach(n => { if (c.has(n.id)) n.rd = 1; }); VIEW.chk = []; persist(); render(); break; }
    case 'ibxreadall': ibxList(VIEW.ibf || 'all').forEach(n => { n.rd = 1; }); persist(); render(); break;
    case 'ibxdelread': { const ids = ibxList(VIEW.ibf || 'all').filter(n => n.rd).map(n => n.id); if (ids.includes(VIEW.sel)) VIEW.sel = null; ibxDelete(ids); render(); break; }
    case 'ibxundo': ibxUndo(); render(); break;
    case 'ibxset': VIEW.ibset = !VIEW.ibset; render(); break;
    case 'ibxoff': { const o = new Set(S.ibxOff || []); o.has(d.v) ? o.delete(d.v) : o.add(d.v); S.ibxOff = Array.from(o); if (o.has(VIEW.ibf)) VIEW.ibf = 'all'; VIEW.ibset = true; persist(); render(); break; }
    case 'ptab': PTAB = d.v; render(); { const t = document.querySelector('.ptabs'); if (t && t.getBoundingClientRect().top < 0) t.scrollIntoView({ block: 'start' }); } break;
    case 'setmaj': VIEW.nmaj = ['1', '1.25', '1.5', '2'].includes(d.v) ? d.v : '1.25'; render(); break;
    case 'setfmt': VIEW.fmt = +d.v === 1 ? 1 : 2; render(); break;
    case 'wrf': VIEW.wrf = d.v; render(); break;
    case 'setpt': VIEW.pt = d.v === 'sim' ? 'sim' : 'manual'; render(); break;
    case 'setarr': VIEW.narr = d.v === 'later' ? 'later' : 'now'; render(); break;
    case 'setone': { if (S.duo || S.cur || S.t !== 0) { toast('Le format se change entre deux saisons'); break; } if (+d.v === 1) S.one = true; else delete S.one; persist(); render(); toast(S.one ? 'Tournois d\u2019une ronde' : 'Tournois de deux rondes avec coupure'); break; }
    case 'duopay': { const T = duoTotals(); if (T.due > 0) { S.duo.paid.push({ d: new Date().toLocaleDateString('fr-CA'), amt: T.due }); persist(); render(); toast(fmtCash(T.due) + ' remis. Tirelire \u00e0 z\u00e9ro'); } break; }
    case 'duounpay': { const p = S.duo.paid.pop(); if (p) { persist(); render(); toast('Paiement de ' + fmtCash(p.amt) + ' annul\u00e9'); } break; }
    case 'pickimport': { const f = document.getElementById(d.v); if (f) f.click(); break; }
    case 'importtext': { const t = document.getElementById(d.v); if (t && t.value.trim()) applyImportedJSON(t.value); break; }
    case 'playercreate': {
      const n = (document.getElementById('pcName').value || 'Toi').trim() || 'Toi';
      const a = Math.max(17, Math.min(50, +document.getElementById('pcAge').value || 22));
      const nat = (document.getElementById('pcNat').value || '').trim();
      const tierIdx = +document.getElementById('pcTier').value;
      const potIdx = +document.getElementById('pcPot').value;
      const leagueEl = document.getElementById('pcLeague');
      const league = leagueEl ? +leagueEl.value : (VIEW.league != null ? VIEW.league : 3);
      S.name = n;
      if (S.mode !== 'sim' && ptSwitchOK()) S.mode = 'sim';   // v254 : on passe au joueur simulé
      const bioPc = bioFromForm('pc', nat);
      createPlayerGolfer({ n, a, nat, tierIdx, potIdx, league });
      if (S.G[0]) { S.G[0].bio = Object.assign({}, S.G[0].bio || {}, { ct: bioPc.ct, h: bioPc.h, w: bioPc.w, lf: bioPc.lf }); persist(); }   // v434 : identité choisie
      go('home');
      break;
    }
    case 'wlsel': VIEW.wl = d.v === 'all' ? 'all' : +d.v; S.wl.sel = VIEW.wl; VIEW.wlnew = VIEW.wlren = VIEW.wldel = false; render(); break;
    case 'wlnewopen': VIEW.wlnew = !VIEW.wlnew; render(); { const i = document.getElementById('wlNew'); if (i) i.focus(); } break;
    case 'wlcreate': {
      const i = document.getElementById('wlNew'), l = wlAdd(i && i.value);
      if (!l) { toast('Donne un nom à la liste'); break; }
      S.wl.sel = VIEW.wl = l.id; VIEW.wlnew = false; persist(); render(); toast('Liste créée'); break;
    }
    case 'wltoggle': VIEW.wlopen = !VIEW.wlopen; render(); break;
    case 'wlcreateP': {
      const i = document.getElementById('wlNewP'), l = wlAdd(i && i.value);
      if (!l) { toast('Donne un nom à la liste'); break; }
      l.ids.push(+d.id); persist(); render(); toast('Ajouté à « ' + l.n + ' »'); break;
    }
    case 'wlrm': { const l = S.wl.lists.find(x => x.id === +d.l); if (l) { l.ids = l.ids.filter(x => x !== +d.id); persist(); render(); } break; }
    case 'wlrenopen': VIEW.wlren = true; VIEW.wldel = false; render(); break;
    case 'wlrenno': VIEW.wlren = false; render(); break;
    case 'wlrensave': {
      const l = S.wl.lists.find(x => x.id === VIEW.wl), i = document.getElementById('wlRen'), n = i ? i.value.trim().slice(0, 24) : '';
      if (!l || !n) { toast('Donne un nom à la liste'); break; }
      l.n = n; VIEW.wlren = false; persist(); render(); break;
    }
    case 'wldelask': VIEW.wldel = true; VIEW.wlren = false; render(); break;
    case 'wldelno': VIEW.wldel = false; render(); break;
    case 'wldelok': { S.wl.lists = S.wl.lists.filter(x => x.id !== VIEW.wl); VIEW.wl = null; VIEW.wldel = false; S.wl.sel = S.wl.lists.length ? S.wl.lists[0].id : 'all'; persist(); render(); toast('Liste supprimée'); break; }
    case 'retireask': VIEW.retAsk = true; render(); { const b = document.getElementById('retno'); if (b) b.focus(); } break;
    case 'retireno': VIEW.retAsk = false; render(); break;
    case 'manualcreate': {
      if (S.t !== 0 || S.cur || leagueOf(0) >= 0) break;
      const n = ((document.getElementById('mcName') || {}).value || 'Toi').trim() || 'Toi', lg = +((document.getElementById('mcLeague') || {}).value || 3);
      if (S.mode === 'sim') { S.mode = 'manual'; S.pk = { cur: [0, 0, 0], best: [0, 0, 0], cw: 0, earn: 0 }; }   // v254 : on passe au joueur manuel
      S.name = n; S.nat = ((document.getElementById('mcNat') || {}).value || '').trim(); S.pk = S.pk || { cur: [0, 0, 0], best: [0, 0, 0], cw: 0 }; S.pk.a = Math.max(17, Math.min(50, Math.round(+((document.getElementById('mcAge') || {}).value || 22)) || 22)); S.pk.bio = bioFromForm('mc', S.nat); if (lg === 4) plJoinRc(); else { makeRoom(lg); S.L[lg].push(0); } S.st[0] = newStanding(); S.spect = false; S.needsPlayerCreate = false;
      if (!(S.playerCareers || []).length && !golferHistory(0).length) S.joinS = S.season;   // v253 : arrivée après des saisons suivies sans joueur
      persist(); go('home'); toast('Bienvenue en ' + lgNm(lg) + ', ' + n); break;
    }
    case 'retireok': { const nm = S.name; VIEW.retAsk = false; if (retirePlayer()) { go('playerCreate', { isRecreate: true, fresh: 1 }); toast(nm + ' prend sa retraite'); } break; }
    case 'spectgo': S.spect = true; S.needsPlayerCreate = false; persist(); go('home'); break;
    case 'newgolfer': if (S.t === 0 && !S.cur) go('playerCreate', { isRecreate: true }); break;
    case 'spt': spectTournament(); break;
    case 'r1fast': if (!S.cur && (S.t < N_TOURN || finalePending())) { startRoundSim(0); finishSimRound(); render(); window.scrollTo(0, 0); } break;
    case 'spr': if (!S.cur && (S.t < N_TOURN || finalePending())) { startRoundSim(0); render(); window.scrollTo(0, 0); } break;
    case 'sps': spectRest(); break;
    case 'spn': { const n = Math.max(1, Math.min(PRESIM_MAX, Math.round(+((document.getElementById('spnum') || {}).value || 1)))); runSpect(n); break; }
    case 'tab': tabGo(d.v); break;
    case 'home': go('home'); break;
    case 'round': startRound(+d.r); render(); window.scrollTo(0, 0); if (+d.r === 1) autoBackup('r'); break;   // v441 : copie après la ronde 1
    case 'roundsim': startRoundSim(+d.r); render(); window.scrollTo(0, 0); break;
    case 'simseason': simulateSeason(); render(); window.scrollTo(0, 0); break;
    case 'simtourn': simulateTournament(); render(); window.scrollTo(0, 0); break;
    case 'spec': startSpectate(); render(); window.scrollTo(0, 0); break;
    case 'resumespec': VIEW = { name: 'spec' }; render(); window.scrollTo(0, 0); break;
    case 'simhole': {
      if (REVEAL) break;
      const newK2 = simSpectHole();
      const advance2 = () => { render(); scrollAfterHole(); };   // v391 : au trou 18, on reste sur la ronde (vWait) ; « holdgo » mène à la suite
      startReveal(newK2, advance2);
      break;
    }
    case 'teego': { const c = S.cur; if (c && c.teeSeen) { c.teeSeen[c.r] = 1; const tr = teeCur(c); if (tr && c.pw == null && !c.ps.length && !(c.k2 > 0) && (teeGrp(tr, 0) > 0 || teeGrp(tr, 0) < 0)) c.pw = 0;   /* v346 : aussi en format une ronde */   /* v308 : sans golfeur sur le terrain, on part aussi du premier départ */ persist(); } render(); window.scrollTo(0, 0); break; }
    case 'prestep': { if (REVEAL) break; const b0 = new Map(liveRows(0).map(r => [r.id, r.n])); preTeeAdv(false); const ch = liveRows(0).filter(r => r.n !== b0.get(r.id)).map(r => r.id); startReveal(0, () => { render(); scrollAfterHole(); }, ch); break; }
    case 'preall': preTeeAdv(true); render(); window.scrollTo(0, 0); break;
    case 'teesv': VIEW = { name: 'tees', back: VIEW.name }; render(); window.scrollTo(0, 0); break;
    case 'twl': { const c = S.cur, id = +el.dataset.id; if (c && id > 0) { const L = Array.isArray(c.twl) ? c.twl : (c.twl = []), i = L.indexOf(id); if (i >= 0) L.splice(i, 1); else L.push(id); persist(); } render(); break; }
    case 'tfol': { const c = S.cur, tr = teeCur(c), gi = +el.dataset.g; if (tr && gi >= 0) { const f = (tr.fol || []).filter(x => x !== gi); if (f.length === (tr.fol || []).length) { f.push(gi); while (f.length > 2) f.shift(); } tr.fol = f; persist(); } render(); break; }
    case 'teeback': { const c = S.cur; VIEW = VIEW.back === 'spec' ? { name: 'spec' } : { name: 'play', val: c && c.ps.length < 18 ? c.pars[c.ps.length] : null }; render(); window.scrollTo(0, 0); break; }
    case 'teens': S.ui.nsOpen = !S.ui.nsOpen; render(); break;
    case 'teestep': {
      const c = S.cur; if (!c || !teeCur(c) || REVEAL) break;
      const before = liveRows(18); c.tx = (c.tx || 0) + 1;
      const after = liveRows(18), ev = []; holeEvents(before, after, 18, ev, true); try { fanStep(before, after, 18); } catch (e) { }
      const left = after.filter(r => r.n < 18).length;
      c.feed.unshift({ n: '+' + c.tx, w: 1, t: (left ? left + ' golfeurs encore sur le terrain. ' : 'Tout le monde a termin\u00e9. ') + 'En t\u00eate : ' + nameOf(after[0].id) + ' (' + fmt(after[0].tot) + ').', ev: ev.slice(0, 3) });
      persist();
      const b0 = new Map(before.map(r => [r.id, r.n])), ch = after.filter(r => r.n !== b0.get(r.id)).map(r => r.id);
      startReveal(18, () => { render(); scrollAfterHole(); }, ch);
      break;
    }
    case 'teeall': if (REVEAL) { clearInterval(REVEAL.timer); REVEAL = null; } holdRound(); render(); window.scrollTo(0, 0); break;
    case 'holdgo': if (REVEAL) break; finishRound(); persist(); render(); window.scrollTo(0, 0); break;
    case 'resume': VIEW = { name: 'play', val: S.cur.pars[S.cur.ps.length] }; render(); window.scrollTo(0, 0); break;
    case 'quit': go('home'); break;
    case 'inc': { const r = holeRange(S.cur.pars[S.cur.ps.length]); VIEW.val = Math.min(r[1], VIEW.val + 1); refreshHoleUI(); if (skInOn()) skRefresh(); break; }
    case 'dec': { const r = holeRange(S.cur.pars[S.cur.ps.length]); VIEW.val = Math.max(r[0], VIEW.val - 1); refreshHoleUI(); if (skInOn()) skRefresh(); break; }
    case 'setv': VIEW.val = +d.v; refreshHoleUI(); if (skInOn()) skRefresh(); break;
    case 'skfw': VIEW.fw = VIEW.fw === +d.v ? null : +d.v; skRefresh(); break;
    case 'skpu': VIEW.pu = VIEW.pu === +d.v ? null : +d.v; skRefresh(); break;
    case 'skpe': VIEW.pe = +d.v; skRefresh(); break;
    case 'ok': {
      if (REVEAL) break;
      const v = VIEW.val, wasPlay = VIEW.name === 'play', keepAll = VIEW.all;
      if (skInOn() && S.cur) { const c0 = S.cur, k0 = c0.ps.length; c0.pst = c0.pst || []; c0.pst[k0] = [c0.pars[k0] > 3 && VIEW.fw != null ? VIEW.fw : null, VIEW.pu != null ? Math.min(VIEW.pu, Math.max(0, v - 1)) : null, Math.min(VIEW.pe || 0, Math.max(0, v - 1 - (VIEW.pu || 0)))]; }
      const newK = submitHole(v);
      const advance = () => {
        if (newK === 18 && teeWaiting()) VIEW = { name: 'play' };
        else if (newK === 18) VIEW = { name: 'play' };   // v391 : tout le monde a fini, on reste sur la ronde
        else if (wasPlay) VIEW = { name: 'play', val: S.cur.pars[S.cur.ps.length], all: keepAll };
        render(); scrollAfterHole();
      };
      startReveal(newK, advance);
      break;
    }
    case 'undo': {
      if (S.cur.phase === 'cut') { // retour sur le trou 18 de la ronde 1
        const c = S.cur; c.phase = c.r === 0 ? 'r1' : 'r2'; c.ps.pop(); c.feed.shift(); c.cut = null; c.alive = []; c.made = false; c.r1 = {}; c.tx = 0;
        VIEW = { name: 'play', val: c.pars[17] }; persist(); render(); break;
      }
      undoHole(); render(); break;
    }
    case 'toggleall': VIEW.all = !VIEW.all; render(); break;
    case 'toggleall2': VIEW.all = !VIEW.all; render(); break;
    case 'finish': if (S.cur && S.cur.phase === 'cut') { const c = S.cur; if (!S.one && (!c.made || c.sw) && c.r === 0) { c.r = 1; simAIRound(1); aiFill(18, true); if (teeCur(c)) c.tx = 999; }   /* v314 : une égalité après la ronde 2 simulée d'un coup mène aussi à la page de prolongation */
      if (!poStart(c)) finishTournament(); } else holdRound(); render(); window.scrollTo(0, 0); break;
    case 'endseason': doSeasonEnd(); render(); window.scrollTo(0, 0); autoBackup('s'); break;
    case 'offgo': VIEW = { name: 'off', s: d.s ? +d.s : (VIEW.s || S.season - 1), i: +d.i || 0 }; if (S.off) persist(); render(); window.scrollTo(0, 0); break;
    case 'offdone': S.off = null; persist(); go('home'); window.scrollTo(0, 0); break;
    case 'bkrestore': { const o = await kvOp('get', d.v); if (o && o.G) applyImportedJSON(JSON.stringify(o)); else toast('Copie introuvable'); break; }
    case 'unlock': VIEW.confirmUnlock = true; render(); break;
    case 'unlock0': VIEW.confirmUnlock = false; render(); break;
    case 'relock': if (canRelock()) { S.lockOn = true; VIEW.confirmUnlock = false; S.news.unshift({ s: S.season, t: S.t, text: '🔒 Réglages reverrouillés en ' + yr(S.season) + ' (' + (S.t >= N_TOURN ? 'fin de saison' : 'avant le tournoi ' + (S.t + 1)) + ').', l: -1, ids: [] }); persist(); render(); toast('Réglages reverrouillés'); } break;
    case 'lvladj': lvlAdj(+d.v); break;
    case 'lvlunl': VIEW.confirmUnlock = true; render(); break;
    case 'unlock2': { S.lockOn = false; (S.unl = S.unl || []).push({ s: S.season, t: S.t }); S.news.unshift({ s: S.season, t: S.t, text: '\ud83d\udd13 R\u00e9glages d\u00e9verrouill\u00e9s en ' + yr(S.season) + ' (' + (S.t >= N_TOURN ? 'fin de saison' : 'avant le tournoi ' + (S.t + 1)) + ').', l: -1, ids: [] }); VIEW.confirmUnlock = false; persist(); render(); toast('R\u00e9glages d\u00e9verrouill\u00e9s'); break; }
    case 'npre': VIEW.npre = d.v; render(); break;
    case 'lvlk': VIEW.lvlk = d.v; document.querySelectorAll('[data-a="lvlk"]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === d.v))); { const w = document.getElementById('lvlest'); if (w) w.innerHTML = lvlEstHTML(); } break;
    case 'setlang': setLang(d.v); render(); break;
    case 'cergo': go('seasonEnd', { s: +d.s }); window.scrollTo(0, 0); break;
    case 'finsim': if (finalePending() && !S.cur) { simFinale(); persist(); autoBackup(); pushNav(); go('tourn', { s: S.season, t: N_TOURN, l: 0, mode: 'res' }); } break;
    case 'league': go('leagues', { l: +(d.v), s: VIEW.name === 'leagues' ? VIEW.s : undefined }); break;
    case 'leagues': go('leagues', { l: VIEW.l }); break;
    case 'endleague': VIEW.l = +d.v; render(); break;
    case 'tourn': pushNav(); go('tourn', { s: +d.s, t: +d.t, l: +d.l, mode: d.m || 'res', from: d.f || null, fid: d.fid != null ? +d.fid : null }); break;
    case 'sl': VIEW.sl = +d.v; render(); break;
    case 'hg': VIEW.hg = d.v; render(); break;
    case 'gsall': VIEW.gsAll = !VIEW.gsAll; gsRefresh(); break;
    case 'rcs': VIEW.rcs = d.v === 'G' ? 'G' : +d.v; render(); break;
    case 'journal': pushNav(); go('journal'); break;
    case 'seasonrecap': pushNav(); go('seasonEnd', { s: +d.s, arch: true, from: d.f === 'arch' ? 'arch' : 'journal' }); break;
    case 'jf': JV.f = d.v; render(); break;
    case 'jl': JV.l = +d.v; render(); break;
    case 'jmore': JV.all = true; render(); break;
    case 'tmode': VIEW.mode = d.v; render(); break;
    case 'tss': S.ui.tss = d.v; render(); break;
    case 'pv': S.ui.pv = d.v; persist(); render(); break;
    case 'gv': VIEW.gv = d.v; render(); break;
    case 'mgrgo': mgrGo(); break;
    case 'emgo': emGo(); break;
    case 'nftee': { newFormSave(); const f = nfCrf(), all = [...new Set(BANK.map(b => b.tee))]; let s = new Set(Array.isArray(f.tees) ? f.tees : []);
      if (d.v === '*') s = new Set(); else if (s.has(d.v)) s.delete(d.v); else s.add(d.v);
      f.tees = s.size && s.size < all.length ? [...s] : null; VIEW.nfOpen = true; render(); newFormLoad(); break; }
    case 'nfneumode': { newFormSave(); const N = nfNeu(); N.auto = d.v === 'auto'; if (N.auto) { VIEW.nneu = null; nfNeu(); } VIEW.nfOpen = true; render(); newFormLoad(); break; }
    case 'spladd': { const k = d.k, el2 = document.getElementById('spl-' + k), v = ((el2 && el2.value) || '').trim(); if (!v) break;
      const first = document.querySelector('#splac-' + k + ' [data-splpick].on') || document.querySelector('#splac-' + k + ' [data-splpick]');
      if (!BANK.some(b => normName(b.name) === normName(v)) && first) splAdd(k, BANK[+first.dataset.splpick].name); else splAdd(k, v); break; }
    case 'spldel': { const f = crf(); if (f.spl && f.spl[d.k]) { f.spl[d.k].splice(+d.i, 1); persist(); crfRemember(); render(); } break; }
    case 'crftee': { const f = crf(), all = [...new Set(BANK.map(b => b.tee))]; let s = new Set(Array.isArray(f.tees) ? f.tees : []);
      if (d.v === '*') s = new Set(); else if (s.has(d.v)) s.delete(d.v); else s.add(d.v);
      f.tees = s.size && s.size < all.length ? [...s] : null; persist(); crfRemember(); render(); break; }
    case 'mt': VIEW.mt = d.v; render(); break;
    case 'advseg': { const it = ADV.reduce((a, s) => a.concat(s.items), []).find(i => i.k === d.k); const raw = d.v; advSet(d.k, isNaN(+raw) || it.k === 'purseR' ? raw : +raw); render(); break; }
    case 'advtog': { const v = S.cfg[d.k]; advSet(d.k, (v === 0 || v === false) ? 1 : 0); render(); break; }
    case 'advpre': if (d.v !== 'cus') { advPreset(d.v); toast('Préréglage : ' + ADV_PRESETS[d.v].t.replace(/^\S+ /, '')); } break;
    case 'advrst': advReset(d.v); break;
    case 'advtest': advTest(); break;
    case 'skin': SKIN = d.v; try { localStorage.setItem('golf-skin', SKIN); } catch (e) { } render(); break;
    case 'fullscr': fsToggle(); break;
    case 'zoom': { const z = parseFloat(d.v); if (ZOOMS.includes(z)) { ZOOM = z; try { localStorage.setItem('igc-zoom', String(z)); } catch (e) { } render(); } break; }
    case 'layout': LAYOUT = d.v; try { localStorage.setItem('golf-layout', LAYOUT); } catch (e) { } render(); break;
    case 'allmode': VIEW.all = d.v === '1'; render(); break;
    case 'lbmode': S.ui.lbmode = d.v; persist(); render(); break;
    case 'lgv': S.ui.lgv = +d.v; persist(); render(); break;
    case 'revealmode': S.ui.reveal = d.v; persist(); render(); break;
    case 'spwl': S.ui.spl = +d.v; persist(); render(); break;
    case 'sndtest': sndPlay('roar'); break;
    case 'wlcol': { ensureWL(); const v = d.v || ''; if (d.l === 'def') S.wl.dc = v || WL_DEF; else { const l = S.wl.lists.find(x => String(x.id) === d.l); if (l) { if (v) l.c = v; else delete l.c; } } persist(); render(); break; }
    case 'ptsadd': case 'ptsdel': case 'ptsdef': if (!settingsLocked()) ptsAct(a, d); break;
    case 'pos': if (S.cur && S.cur.po) { poRun(false); render(); } break;
    case 'poall': if (S.cur && S.cur.po) { poRun(true); render(); } break;
    case 'poh': if (S.cur && S.cur.po && poMine(S.cur) && !S.cur.po.pend) { poPend(+d.v); persist(); render(); } break;
    case 'poone': if (S.cur && S.cur.po) { poOne(); render(); } break;
    case 'poback': poBack(); render(); window.scrollTo(0, 0); break;
    case 'pofin': if (S.cur && S.cur.po && S.cur.po.w != null) { finishTournament(); render(); window.scrollTo(0, 0); } break;
    case 'poview': VIEW = { name: 'po' }; render(); window.scrollTo(0, 0); break;
    case 'tournleague': VIEW.l = +d.v; render(); break;
    case 'golfer': pushNav(); go('golfer', { id: +d.id }); break;
    case 'cres': if (VIEW.name === 'cres') go('cres', { k: +d.k }); else { pushNav(); go('cres', { k: +d.k }); } break;
    case 'cresask': cresAsk(+d.k, d.r === '1'); break;
    case 'rclass': pushNav(); go('rclass', { s: +d.s }); break;
    case 'lgseason': pushNav(); go('leagues', { l: +d.l, s: +d.s }); break;
    case 'gfxdir': { if (!GFX.dir) { if (await gfxPickDir()) { const r = await gfxSyncDir(true); if (!r) toast('Accès au dossier refusé'); } } else { const r = await gfxSyncDir(true); if (!r) toast(GFX.busy ? 'Traitement déjà en cours' : 'Accès au dossier refusé'); } render(); break; }
    case 'gfxdir2': { if (await gfxPickDir()) await gfxSyncDir(true); render(); break; }
    case 'gfxclear': VIEW.gfxClear = 1; render(); break;
    case 'gfxclear0': VIEW.gfxClear = 0; render(); break;
    case 'gfxclear2': { await gfxOp('faces', 'clear'); await gfxOp('bgs', 'clear'); GFX.faces = []; GFX.bgs = []; GFX.seen = {}; GFX.urls.forEach(u => URL.revokeObjectURL(u)); GFX.urls.clear(); await gfxSaveIndex(); if (S && S.G) Object.values(S.G).forEach(g => { delete g.ph; delete g.bg; }); persist(); VIEW.gfxClear = 0; toast('Bibliothèque vidée'); render(); break; }
    case 'phnext': { const g = S.G[VIEW.id]; if (!g) break; const k = phPick(g, phUsed(), g.ph); if (k) { g.ph = k; persist(); render(); } else toast('Aucune autre photo dans sa catégorie'); break; }
    case 'bgnext': { const g = S.G[VIEW.id]; if (!g) break; const L = GFX.bgs.filter(x => x.k !== g.bg); if (L.length) { g.bg = L[Math.floor(Math.random() * L.length)].k; persist(); render(); } break; }
    case 'phdel': { const g = S.G[VIEW.id]; if (g) { g.ph = null; persist(); render(); } break; }
    case 'rcgo': if (d.s !== '') { VIEW.s = +d.s; render(); window.scrollTo(0, 0); } break;
    case 'rcview': pushNav(); go('leagues', { l: 4, s: +d.s }); break;
    case 'rcsort': VIEW.rcsort = d.v; render(); break;
    case 'rcfol': { ensureWL(); const id = +d.id, ins = wlIn(id); if (ins.length) ins.forEach(l => { l.ids = l.ids.filter(x => x !== id); }); else S.wl.lists[0].ids.push(id); persist(); render(); toast(ins.length ? 'Retiré de ta Watchlist' : 'Ajouté à ta Watchlist (' + S.wl.lists[0].n + ')'); break; }
    case 'backview': goBack(); break;
    case 'golfers': go('golfers'); break;
    case 'rc': VIEW.rc = (d.v === 'C' || d.v === 'M') ? d.v : +d.v; render(); break;
    case 'hof': if (VIEW.name !== 'records') pushNav(); go('records', { rv: 'hof' }); break;
    case 'rv': if (d.v === 'alm') { go('almanac'); break; } if (VIEW.name === 'almanac') { go('records', { rv: d.v }); break; } VIEW.rv = d.v; render(); break;
    case 'almV': VIEW.av = d.v; VIEW.aall = false; render(); break;
    case 'almL': VIEW.al = +d.v; render(); break;
    case 'almAll': VIEW.aall = !VIEW.aall; render(); break;
    case 'archback': go('records', { rv: 'arch' }); break;
    case 'regen': regenRegularity(); toast('Nouveaux coefficients tir\u00e9s'); break;
    case 'cfgreset': S.cfg = clone(DEFAULT_CFG); setCfg(S.cfg); persist(); render(); toast('R\u00e9glages r\u00e9tablis'); break;
    case 'names': {
      const txt = document.getElementById('nm2').value, r = importNames(txt, +document.getElementById('nl').value);
      toast(r.n ? r.n + ' nom' + (r.n > 1 ? 's' : '') + ' appliqu\u00e9' + (r.n > 1 ? 's' : '') + (r.extra > 0 ? ' (' + r.extra + ' en trop ignor\u00e9s)' : '') : 'Aucun nom \u00e0 appliquer'); break;
    }
    case 'tblreset': S.settings.tables = clone(DEFAULT_TABLES); MODEL = buildModel(S.settings.tables); persist(); render(); toast('Valeurs r\u00e9tablies'); break;
    case 'csub': VIEW.csub = d.v; VIEW.cf = null; render(); break;
    case 'cyr': VIEW.cyr = +d.v || 0; VIEW.open = null; render(); break;
    case 'futclr': { const i = +d.i, c = S.courses[i]; if (!FUT || !c || c.lk) break; c.name = ''; render(); persist(); toast('Remis au tirage'); break; }
    case 'futwipe': { if (!FUT) break; const k = FUT.k; S.courses.forEach(c => { if (c && !c.lk) c.name = ''; }); render(); persist(); toast('Plan effacé'); break; }
    case 'tzfull': case 'palm': { const pid = d.id != null ? +d.id : VIEW.id; pushNav(); go('palm', { id: pid }); break; }   // v377 : le panneau des trophées ouvre le palmarès
    case 'bankadd': VIEW.cf = cfNew(); render(); window.scrollTo(0, 0); break;
    case 'bankedit': VIEW.cf = cfNew(S.courseBank[+d.i].name); VIEW.bankDel = null; render(); window.scrollTo(0, 0); break;
    case 'cfsave': cfSave(); break;
    case 'bankimptext': { const t = document.getElementById('bankText'); if (t && t.value.trim()) bankImportDone(bankFileImport(t.value)); break; }
    case 'bankexp': { const n = bankGroups().length; saveFile('terrains-' + new Date().toISOString().slice(0, 10) + '.json', bankFileJSON(), 'application/json', 'Liste de terrains', '.json', n + ' terrain' + (n > 1 ? 's' : '') + ' export\u00e9' + (n > 1 ? 's' : '')); break; }
    case 'bankexpjs': { const n = bankGroups().length; saveFile('terrains-data.js', '/* Indoor Golf Career : liste de terrains pré-importée au premier lancement (' + n + ' terrains) */\nwindow.CG_TERRAINS = ' + bankFileJSON().trim() + ';\n', 'text/javascript', 'Liste de terrains pour le jeu', '.js', n + ' terrains dans terrains-data.js'); break; }
    case 'bankmore': VIEW.bn = (VIEW.bn || 30) + 30; { const L = document.getElementById('bklist'); if (L) L.innerHTML = bankListHTML(); } break;
    case 'cfcancel': VIEW.cf = null; render(); window.scrollTo(0, 0); break;
    case 'rpurse': { const i = +d.i, c = S.courses[i]; if (!c || c.lk || (!FUT && S.cur && S.cur.t === i)) break; const o = c.purse; let v = randomPurse(); for (let k = 0; k < 5 && v === o; k++) v = randomPurse(); c.purse = v; persist(); VIEW.open = i; renderKeep(i); toast('Bourse : ' + fmtM(v)); break; }
    case 'rrand': { const i = +d.i, c = S.courses[i]; if (!c || c.lk || (!FUT && S.cur && S.cur.t === i)) break; const r2 = d.r === '2'; c[r2 ? 'pin2' : 'pin'] = randomPin(); c[r2 ? 'wind2' : 'wind'] = randomWind(); persist(); VIEW.open = i; renderKeep(i); toast('Ronde ' + (r2 ? 2 : 1) + ' : ' + PIN_LABELS[c[r2 ? 'pin2' : 'pin']] + ' \u00b7 ' + WIND_LABELS[c[r2 ? 'wind2' : 'wind']]); break; }
    case 'geopen': { const g = S.G[VIEW.id]; if (g && commOn()) { VIEW.ge = geFrom(g); render(); } break; }
    case 'gecancel': VIEW.ge = null; render(); break;
    case 'gesave': geSave(); break;
    case 'cgmake': { const n = document.getElementById('cgn'); if (n) cgState().n = n.value; if (commOn()) cgMake(); break; }
    case 'cgdel': { const P = S.cpend || [], x = P[+d.i]; if (x) { P.splice(+d.i, 1); S.used = (S.used || []).filter(n => n !== x.g.n); persist(); render(); toast(x.g.n + ' retir\u00e9'); } break; }
    case 'pigecopy': { const txt = pigeNames(), ta = (el && el.closest('.pige') && el.closest('.pige').querySelector('.pgcpy')) || document.getElementById('pgcpy'); if (!txt) break;
      if (ta) { ta.value = txt; ta.style.display = 'block'; ta.rows = Math.min(12, txt.split('\n').length); }
      const fall = () => { let ok = false; if (ta) { ta.focus(); ta.select(); ta.setSelectionRange(0, txt.length); try { ok = document.execCommand('copy'); } catch (e) {} } toast(ok ? 'Noms copiés' : 'Sélectionne le texte ci-dessous pour le copier'); };
      try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(() => toast('Noms copiés'), fall); else fall(); } catch (e) { fall(); }
      break; }
    case 'pigedraw': { const P = pigeState(), inp = document.getElementById('pgn'), lo = document.getElementById('pglo'), hi = document.getElementById('pghi'); if (inp) P.n = pgClamp(inp.value); if (lo) P.lo = pgClamp(lo.value); if (hi) P.hi = pgClamp(hi.value); if (P.lo > P.hi) { const t = P.lo; P.lo = P.hi; P.hi = t; } P.drawn = 1; const n = pigeDraw(); render(); toast(n ? n + ' terrain' + (n > 1 ? 's' : '') + ' pigé' + (n > 1 ? 's' : '') + (P.rnd ? ' (entre ' + P.lo + ' et ' + P.hi + ')' : '') : 'Aucun terrain ne correspond'); break; }
    case 'pgmode': { const P = pigeState(); P.rnd = d.v === 'rnd'; persist(); if (inPN()) pnSave(); render(); break; }
    case 'pigeadd': {
      const P = pigeState(), k = +d.k, x = P.list[k], sel = document.querySelector('[data-c="pgto"][data-k="' + k + '"]');
      if (x && sel && /^spl:/.test(sel.value)) {   // v302 : dans la liste d'un Majeur ou de la Finale, avec le tee pigé
        const key = sel.value.slice(4), bi = findBankCourse(x.name, x.tee); if (bi < 0) break;
        const nm = BANK[bi].name, f = crf(); f.spl = f.spl || {}; f.spl[key] = (f.spl[key] || []).filter(n => normName(n) !== normName(nm)).concat([nm]);
        f.splTee = f.splTee || {}; (f.splTee[key] = f.splTee[key] || {})[normName(nm)] = BANK[bi].tee;
        persist(); crfRemember(); render(); const sx = splSlots().find(z => z[1] === key); toast(nm + ' ajouté à la liste : ' + (sx ? (sx[0] >= N_TOURN ? 'Finale' : majorName(sx[0])) : key)); break;
      }
      const i = sel && sel.value !== '' ? +sel.value : (P.to && P.to[k] != null ? P.to[k] : null);
      if (!x || i == null) { toast('Choisis d’abord le tournoi'); break; }
      if (courseFrozen(i)) { toast('Ce tournoi est barré ou déjà joué'); break; }
      const bi = findBankCourse(x.name, x.tee); if (bi < 0) break;
      const c = S.courses[i]; applyBankToCourse(c, BANK[bi]); c.name = BANK[bi].name;
      P.list.forEach(y => { if (y.at === i) y.at = null; }); x.at = i; persist(); render(); toast(x.name + ' ajouté au tournoi ' + (i + 1)); break;
    }
    case 'clock': { const i = +d.i; if (!S || courseFixed(i)) break; const c = S.courses[i]; c.lk = !c.lk; if (!c.lk) delete c.lk; persist(); render(); toast('Tournoi ' + (i + 1) + (c.lk ? ' barré' : ' débarré')); break; }
    case 'voyage': { const fs = VIEW.name === 'courses' && (VIEW.csub || 'season') === 'season' && VIEW.cyr > 0 ? S.season + VIEW.cyr : S.season; pushNav(); VOY_ROT = null; go('voyage', { s: fs }); break; }   // v405 : depuis une saison future, son voyage
    case 'voysort': { if (voySortApply(false)) render(); break; }
    case 'voyfind': { geoEnqueue(voyStops(VIEW.s || S.season).filter(x => x.name && !geoTried(x.name)).map(x => x.name)); render(); break; }
    case 'voyall': { const L = (S.courseBank || []).map(b => b.name).concat(S.courses.map(c => c && c.name)).filter(n => n && !geoTried(n)); if (!L.length) { toast('Tous les terrains de ta liste ont déjà été cherchés'); break; } toast(L.length + ' terrains à chercher : environ ' + Math.ceil(L.length * 1.2 / 60) + ' min'); geoEnqueue(L); render(); break; }
    case 'voyexp': { const d = geoExportJSON(); if (!d.n) { toast('Aucun lieu trouvé pour l’instant'); break; } saveFile('lieux-terrains-' + d.exported + '.json', JSON.stringify(d), 'application/json', 'Lieux des terrains', '.json', d.n + ' lieux exportés'); break; }
    case 'voyedit': VIEW.ved = d.n; render(); setTimeout(() => { const i = document.getElementById('voyin'); if (i) i.focus(); }, 0); break;
    case 'voycancel': VIEW.ved = null; render(); break;
    case 'voyset': { const i = document.getElementById('voyin'), nm = VIEW.ved; if (i && i.value.trim() && nm) { VIEW.ved = null; geoManual(nm, i.value.trim()); } break; }
    case 'drawcourses': { const r = drawSeasonCourses(); render(); toast(r.n ? r.n + ' terrain' + (r.n > 1 ? 's' : '') + ' tiré' + (r.n > 1 ? 's' : '') + (r.short ? ' · ' + r.short + ' sans terrain : élargis les filtres' : '') : (r.short ? 'Aucun terrain ne correspond aux filtres' : 'Tous les tournois sont barrés ou joués')); break; }
    case 'randomcourses': { const n = randomizeSeasonCourses(); render(); toast(n ? 'Statistiques g\u00e9n\u00e9r\u00e9es pour ' + n + ' terrain' + (n > 1 ? 's' : '') : 'Aucun terrain disponible \u00e0 modifier'); break; }
    case 'bankdel': VIEW.bankDel = +d.i; render(); break;
    case 'bankcancel': VIEW.bankDel = null; render(); break;
    case 'bankdel2': { const n = normName(S.courseBank[+d.i].name); for (let k = BANK.length - 1; k >= 0; k--) if (normName(BANK[k].name) === n) BANK.splice(k, 1); VIEW.bankDel = null; persist(); render(); toast('Terrain retir\u00e9 de la liste'); break; }
    case 'export': exportSave(); break;
    case 'svover': saveConflictDo('over'); break;
    case 'svnew': saveConflictDo('new'); break;
    case 'svcancel': VIEW.saveConflict = null; render(); break;
    case 'savedir': { const d = await pickSaveDir(); if (d) { toast('Dossier de sauvegarde : ' + d.name); render(); } break; }
    case 'reset': VIEW.confirmReset = true; render(); break;
    case 'mainmenu': persistNow(); NAV = []; VIEW = { name: 'new', mode: S && S.duo ? 'duo' : S && S.mode === 'sim' ? 'sim' : 'manual' }; render(); window.scrollTo(0, 0); break;
    case 'menuback': VIEW = { name: 'home' }; render(); window.scrollTo(0, 0); break;
    case 'newconfno': { const cf = document.getElementById('newconf'); if (cf) cf.hidden = true; break; }
    case 'cancel': VIEW.confirmReset = false; VIEW.pending = null; render(); break;
    case 'reset2': {
      S = null; DB.ready.then(() => { try { if (DB.mode === 'idb') DB.db.transaction('kv', 'readwrite').objectStore('kv').delete(SLOT); else localStorage.removeItem(lsKey(SLOT)); } catch (e) { } });
      VIEW = { name: 'new', mode: SLOT === 'save-duo' ? 'duo' : 'manual' }; render(); break;
    }
    case 'import2': { const o = VIEW.pending; if (o) { loadState(o); persist(); go('home'); toast('Sauvegarde import\u00e9e'); } break; }
  }
}
/* v303 : un nom choisi à la main devient le nom de base ; les sauvegardes suivantes proposent « nom - 2026T3 » */
const saveTag = () => yr(S.season) + (S.t >= N_TOURN ? 'Fin' : 'T' + (S.t + 1));
const saveBaseOf = n => String(n || '').replace(/\.json$/i, '').replace(/\s*-\s*(?:\d{1,4}(?:T\d+|Fin)|s\d+t\d+)$/i, '').trim();
/* v441 : un seul nom par partie (choix de Max) : le fichier principal est remplacé à chaque sauvegarde ;
   un nom écrit à la main crée un fichier à part (un « checkpoint ») sans changer le nom par défaut. */
function defaultSaveName() {
  if (S.saveBase) return S.saveBase;
  if (S.name && S.name !== 'Toi') return S.name.replace(/[\\/:*?"<>|]+/g, ' ').trim() + (S.duo ? ' - duo' : LANG === 'en' ? ' - career' : ' - carrière');
  const slug = (S.name || 'joueur').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'joueur';
  return (S.duo ? 'duo-golf-' : LANG === 'en' ? 'golf-career-' : 'carriere-golf-') + slug + '-s' + S.season + 't' + (S.t + 1);
}
let SAVE_PICKED = null;
async function saveConflictDo(mode) {   // v306 : remplacer, ou nouvelle sauvegarde « nom-1 »
  const C = VIEW.saveConflict; if (!C) return;
  VIEW.saveConflict = null;
  const full = mode === 'over' ? C.full : await freeSaveName(C.full), json = saveJSON();
  if (await saveToDir(full, json, true)) { VIEW.exportName = ''; persist(); }
  render();
}
/* v442 : le tournoi rapide en cours voyage avec le fichier de sauvegarde (et revient au chargement) */
const saveJSON = () => JSON.stringify(PNX && PNX.cur ? Object.assign({}, S, { pnx: PNX }) : S);
async function exportSave() {
  const json = saveJSON(), typed = (VIEW.exportName || '').trim();
  const def = defaultSaveName(), filename = typed || def;
  const full = filename.toLowerCase().endsWith('.json') ? filename : filename + '.json';
  SAVE_PICKED = null;
  const keep = () => { if (!S.saveBase) S.saveBase = saveBaseOf(def); VIEW.exportName = ''; persist(); if (VIEW.name === 'more') render(); };   // v441 : le nom par défaut reste celui de la partie
  const r = await saveToDir(full, json, !typed);   // v441 : le fichier principal est remplacé sans question
  if (r === 'exists') { VIEW.saveConflict = { full, alt: await freeSaveName(full), typed }; render(); setTimeout(() => { const b = document.getElementById('svconf'); if (b) b.scrollIntoView({ block: 'center' }); }, 0); return; }
  if (r) { keep(); return; }
  const ok = await saveFile(full, json, 'application/json', 'Sauvegarde de carri\u00e8re', '.json', 'Sauvegarde enregistr\u00e9e');
  if (ok === false) { VIEW.exportText = json; render(); }   // dernier recours si le t\u00e9l\u00e9chargement direct \u00e9choue
  else keep();
}
/* Dossier \u00ab Saved Games \u00bb : choisi une seule fois (Chrome, Edge sur ordinateur), puis chaque sauvegarde y va directement.
   Le lien vers le dossier est gard\u00e9 dans le navigateur (cl\u00e9 'savedir'). Ailleurs (t\u00e9l\u00e9phone, Safari) : t\u00e9l\u00e9chargement habituel. */
let SAVEDIR = null;
function dirKv(op, v) {
  return DB.ready.then(() => new Promise(res => {
    if (DB.mode !== 'idb') { res(null); return; }
    try { const st = DB.db.transaction('kv', op === 'get' ? 'readonly' : 'readwrite').objectStore('kv'); const r = op === 'get' ? st.get('savedir') : op === 'del' ? st.delete('savedir') : st.put(v, 'savedir'); r.onsuccess = () => res(op === 'get' ? r.result || null : true); r.onerror = () => res(null); } catch (e) { res(null); }
  }));
}
const canPickDir = () => { try { return typeof window.showDirectoryPicker === 'function' && window.self === window.top; } catch (e) { return false; } };   // pas dans une page int\u00e9gr\u00e9e (aper\u00e7u Claude)
async function pickSaveDir() {
  try {
    const d = await window.showDirectoryPicker({ id: 'igc-saves', mode: 'readwrite', startIn: SAVEDIR || 'documents' });
    SAVEDIR = d; await dirKv('put', d); return d;
  } catch (e) { return null; }
}
/* ---- Sauvegarde automatique (v207) : après chaque tournoi, une copie dans ce navigateur (les 5 dernières),
   et, sur PC si un dossier « Saved Games » est choisi, un fichier auto-1 à auto-5 qui tourne. ---- */
const kvOp = (op, k, v) => DB.ready.then(() => new Promise(res => {
  if (DB.mode !== 'idb') { res(null); return; }
  try { const st = DB.db.transaction('kv', op === 'get' ? 'readonly' : 'readwrite').objectStore('kv'); const r = op === 'get' ? st.get(k) : op === 'del' ? st.delete(k) : st.put(v, k); r.onsuccess = () => res(op === 'get' ? r.result || null : true); r.onerror = () => res(null); } catch (e) { res(null); }
}));
const BK_N = 5;
let BK_Q = Promise.resolve();
/* v441 : fréquence des copies automatiques, au choix (S.bkm) : 'r' après chaque ronde, 't' après chaque tournoi (défaut),
   's' après chaque saison, 'n' jamais. when = 'r' (fin de ronde 1), 't' (fin de tournoi) ou 's' (fin de saison). */
const BK_MODES = [['r', 'Après chaque ronde'], ['t', 'Après chaque tournoi'], ['s', 'Après chaque saison'], ['n', 'Jamais']];
function autoBackup(when) {
  const m = (S && S.bkm) || 't', w = when || 't';
  if (m === 'n' || (m === 's' && w !== 's') || (m === 't' && w === 'r')) return BK_Q;
  if (m === 'r' && w === 's') return BK_Q;   // la fin de saison suit de près la Finale, déjà copiée
  BK_Q = BK_Q.then(autoBackup1, autoBackup1); return BK_Q;
}   // une copie à la fois (pas de course entre deux tournois rapprochés)
async function autoBackup1() {
  if (!S || S.presim || NOSAVE) return;
  try {
    const lk = 'bk-list-' + SLOT, list = (await kvOp('get', lk)) || [], k = 'bk-' + SLOT + '-' + Date.now();
    const ok = await kvOp('put', k, saveObj());
    if (ok) { list.unshift({ k, at: Date.now(), s: S.season, t: S.t, fin: !!(seasonHist() && seasonHist().fin) }); while (list.length > BK_N) { const x = list.pop(); kvOp('del', x.k); } await kvOp('put', lk, list); }
    if (canPickDir() && (SAVEDIR || (SAVEDIR = await dirKv('get')))) {
      let pm = await SAVEDIR.queryPermission({ mode: 'readwrite' });
      if (pm === 'prompt') { try { pm = await SAVEDIR.requestPermission({ mode: 'readwrite' }); } catch (e) { } }   // v441 : redemande l'accès au dossier (après un clic)
      if (pm === 'granted') {
        S.bkN = ((S.bkN || 0) % BK_N) + 1;
        const fh = await SAVEDIR.getFileHandle('auto - ' + defaultSaveName() + ' - ' + S.bkN + '.json', { create: true }), w = await fh.createWritable();   // v441 : au nom de la partie
        await w.write(saveJSON()); await w.close();
      }
    }
  } catch (e) { }
}
async function backupsHTML() { return (await kvOp('get', 'bk-list-' + SLOT)) || []; }
async function saveToDir(full, data, force) {
  if (!canPickDir()) return false;
  try {
    if (!SAVEDIR) SAVEDIR = await dirKv('get');
    if (!SAVEDIR) { toast('Choisis le dossier \u00ab Saved Games \u00bb du jeu (une seule fois)'); if (!(await pickSaveDir())) return false; }
    let p = await SAVEDIR.queryPermission({ mode: 'readwrite' });
    if (p !== 'granted') p = await SAVEDIR.requestPermission({ mode: 'readwrite' });
    if (p !== 'granted') return false;
    if (!force && await dirHas(full)) return 'exists';   // v306 : même nom qu'une sauvegarde existante → on demande
    const fh = await SAVEDIR.getFileHandle(full, { create: true }), w = await fh.createWritable();
    await w.write(data); await w.close();
    toast('Sauvegard\u00e9 dans ' + SAVEDIR.name + ' : ' + full); if (VIEW.name === 'more') render(); return true;
  } catch (e) { return false; }
}
async function dirHas(name) { try { await SAVEDIR.getFileHandle(name); return true; } catch (e) { return false; } }
async function freeSaveName(full) {   // « nom.json » → « nom-1.json », « nom-2.json »… le premier libre
  const b = full.replace(/\.json$/i, '');
  for (let k = 1; k < 1000; k++) { const n = b + '-' + k + '.json'; if (!(await dirHas(n))) return n; }
  return b + '-' + Date.now() + '.json';
}
/* Enregistre un fichier : bo\u00eete \u00ab Enregistrer sous \u00bb (Chrome, Edge), sinon capacit\u00e9 de t\u00e9l\u00e9chargement de Claude, sinon lien direct.
   Retourne false seulement si tout a \u00e9chou\u00e9. */
async function saveFile(full, data, mime, desc, ext, okMsg) {
  if (typeof window.showSaveFilePicker === 'function') {
    try {
      const handle = await window.showSaveFilePicker({ suggestedName: full, types: [{ description: desc, accept: { [mime]: [ext] } }] }); SAVE_PICKED = handle.name || null;
      const w = await handle.createWritable(); await w.write(data); await w.close();
      toast(okMsg); return true;
    } catch (e) { if (e && e.name === 'AbortError') return true; }
  }
  try {
    if (window.claude && typeof window.claude.use === 'function') {
      const dl = await window.claude.use('downloads');
      if (dl) { await dl.save({ filename: full, data }); toast(okMsg); return true; }
    }
  } catch (e) { if (e && e.code === 'declined') return true; }
  try {
    const blob = new Blob([data], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = full; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    toast(okMsg); return true;
  } catch (e) { return false; }
}
function applyImportedJSON(text, fname) {
  try {
    const o = JSON.parse(text);
    if (!o || !o.G || !o.L || !o.settings) throw new Error('bad');
    if (fname && !o.saveBase && !/^auto-/i.test(fname)) { const b = saveBaseOf(fname); if (b) o.saveBase = b; }   // v441
    if (!S) { loadState(o); persist(); go('home'); toast('Sauvegarde import\u00e9e'); }
    else { VIEW = { name: 'more', pending: o }; render(); window.scrollTo(0, 0); }
  } catch (e) {
    if (!S) { VIEW.importError = 'Ce fichier ne ressemble pas \u00e0 une sauvegarde valide.'; render(); }
    else toast('Fichier invalide');
  }
}
function importSave(file) {
  const fr = new FileReader();
  fr.onload = () => applyImportedJSON(fr.result, file.name);
  fr.readAsText(file);
}
document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]'); if (!el) return;
  if (el.tagName === 'A') e.preventDefault();
  act(el.dataset.a, el);
});
document.addEventListener('change', e => {
  const el = e.target, c = el.dataset && el.dataset.c;
  if (el.dataset && el.dataset.pnc) { pnChange(el); return; }
  if (el.dataset && el.dataset.cf) { cfInput(el); return; }
  if (!c) return;
  if (/^(cord|cname|loadbank|cpar|cparpaste|cidx|cidxpaste|ctee|cdist|ccr|cslope|cpin|cwind|cpin2|cwind2|cpurse)$/.test(c)) futOn();
  if (c === 'import') { const f = el.files[0]; el.value = ''; if (f) importSave(f); return; }
  if (c === 'voyimp') { const f = el.files[0]; el.value = ''; if (f) { const fr = new FileReader(); fr.onload = () => { const n = geoImportJSON(fr.result); toast(n < 0 ? 'Ce fichier n’est pas un fichier de lieux' : n + ' lieux ajoutés (ceux que tu avais déjà sont gardés)'); render(); }; fr.readAsText(f); } return; }
  if (c === 'bankimp') { const f = el.files[0]; el.value = ''; if (f && S) { const fr = new FileReader(); fr.onload = () => bankImportDone(bankFileImport(fr.result)); fr.readAsText(f); } return; }
  if (c === 'wlcb') {
    const l = S.wl.lists.find(x => x.id === +el.dataset.l), id = +el.dataset.id;
    if (l) { if (el.checked) { if (!l.ids.includes(id)) l.ids.push(id); } else l.ids = l.ids.filter(x => x !== id); persist(); render(); }
    return;
  }
  if (c === 'nfcrf' || c === 'nfneu') { const d = el.dataset;
  if (c === 'nfcrf') {
    const f = nfCrf(), k = d.k, v = parseFloat(String(el.value).replace(',', '.'));
    if (isFinite(v)) f[k] = k.startsWith('cr') ? Math.round(v * 10) / 10 : Math.round(v);
    const pair = { dmin: 'dmax', crmin: 'crmax', smin: 'smax', pmin: 'pmax' }, lo = Object.keys(pair).find(a => a === k || pair[a] === k);
    if (f[lo] > f[pair[lo]]) { const t = f[lo]; f[lo] = f[pair[lo]]; f[pair[lo]] = t; document.querySelectorAll('[data-c="nfcrf"]').forEach(x => { x.value = f[x.dataset.k]; }); }
    el.value = f[k]; nfRefresh(); return;
  }
  if (c === 'nfneu') {
    const N = nfNeu(), v = parseFloat(String(el.value).replace(',', '.')); if (!isFinite(v)) { el.value = N[d.k]; return; }
    N[d.k] = d.k === 'cr' ? clamp(Math.round(v * 10) / 10, 55, 80) : d.k === 'sl' ? clamp(Math.round(v), 55, 155) : clamp(Math.round(v), 3000, 8000); N.auto = false; el.value = N[d.k];
    document.querySelectorAll('[data-a="nfneumode"]').forEach(b => { const on = b.dataset.v === 'man'; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    const hh = document.getElementById('nfneuh'); if (hh) hh.textContent = 'Valeurs personnalisées.'; return;
  }
  }
  if (!S) return;
  const d = el.dataset;
  if (c === 'gs' || c === 'gsn') {
    const p = gsPrefs();
    if (c === 'gs') p[d.k] = d.k === 'l' ? (el.value === 'all' ? 'all' : +el.value) : el.value;
    else p[d.k] = clamp(Math.round(+el.value || p[d.k]), 15, 70);
    VIEW.gsAll = false; persist(); gsRefresh(); return;
  }
  if (c === 'crf') {
    const f = crf(), k = d.k, v = parseFloat(String(el.value).replace(',', '.'));
    if (isFinite(v)) f[k] = k.startsWith('cr') ? Math.round(v * 10) / 10 : Math.round(v);
    const pair = { dmin: 'dmax', crmin: 'crmax', smin: 'smax', pmin: 'pmax' }, lo = Object.keys(pair).find(a => a === k || pair[a] === k);
    if (f[lo] > f[pair[lo]]) { const t = f[lo]; f[lo] = f[pair[lo]]; f[pair[lo]] = t; document.querySelectorAll('[data-c="crf"]').forEach(x => { x.value = f[x.dataset.k]; }); }
    el.value = f[k]; persist(); crfRemember();
    const n = document.getElementById('crfn'); if (n) n.textContent = crfCountText() + (inPN() ? '' : ' · un terrain différent par tournoi · vent, drapeau et bourse tirés aussi');
    return;
  }
  if (c === 'pgn') { pigeState().n = Math.max(1, Math.min(30, Math.round(+el.value || 6))); el.value = pigeState().n; persist(); if (inPN()) pnSave(); return; }
  if (c === 'pglo' || c === 'pghi') { const P = pigeState(); P[c === 'pglo' ? 'lo' : 'hi'] = pgClamp(el.value); el.value = P[c === 'pglo' ? 'lo' : 'hi']; persist(); if (inPN()) pnSave(); return; }
  if (c === 'skin') { S.ui.skIn = el.checked; persist(); render(); return; }
  if (c === 'comm') { S.comm = el.checked; (S.news = S.news || []).unshift({ s: S.season, t: S.t, text: el.checked ? '\ud83d\udee0\ufe0f Mode commissaire activ\u00e9 en ' + yr(S.season) + '.' : '\ud83d\udee0\ufe0f Mode commissaire d\u00e9sactiv\u00e9 en ' + yr(S.season) + '.' }); persist(); render(); toast(el.checked ? 'Mode commissaire activ\u00e9' : 'Mode commissaire d\u00e9sactiv\u00e9'); return; }
  if (c === 'commlvl') { if (!commOn()) return; const v = parseFloat(String(el.value).replace(',', '.')); if (!isFinite(v)) return; S.cfg.lvl = clamp(Math.round(v * 10) / 10, -8, 40); el.value = S.cfg.lvl; setCfg(S.cfg); persist(); toast('Niveau du circuit enregistr\u00e9'); return; }
  if (c === 'cg') { const G = cgState(), k = d.k; if (k === 'sk') G.sk[+d.i] = +el.value; else if (k === 'bct' || k === 'bpm' || (k === 'blf' && el.value === '') || (k === 'bh' || (k === 'bw' && el.value === ''))) G[k] = el.value; else if (k === 'n' || k === 'nat' || k.startsWith('t') || k.startsWith('v')) G[k] = el.value; else G[k] = +el.value;
    if (k === 'o' || k === 'p') { G.o = clamp(Math.round(+G.o || 0), 5, 995); G.p = clamp(Math.round(+G.p || 0), 5, 1000); const t = document.getElementById('cgtier'); if (t) t.innerHTML = '<b>' + cgTierTxt(G.o, Math.max(G.o, G.p)) + '</b>'; }
    return; }
  if (c === 'spltee') { const f = crf(); f.splTee = f.splTee || {}; const m = f.splTee[d.k] = f.splTee[d.k] || {}, nk = normName(d.n); if (el.value) m[nk] = el.value; else delete m[nk]; persist(); crfRemember(); toast(el.value ? d.n + ' · tee ' + el.value : d.n + ' · tee auto'); return; }
  if (c === 'sndon') { try { localStorage.setItem('igc-snd', el.checked ? '1' : '0'); } catch (e) { } if (el.checked) sndPlay('clap'); return; }
  if (c === 'phon') { GFX.on = el.checked; try { localStorage.setItem('igc-photos', el.checked ? '1' : '0'); } catch (e) { } render(); return; }
  if (c === 'gfxfaces' || c === 'gfxbgs') { const fs = [...(el.files || [])]; el.value = ''; if (fs.length) gfxRun(fs, c === 'gfxfaces' ? 'faces' : 'bgs'); return; }
  if (c === 'rcyr') { VIEW.s = +el.value; render(); window.scrollTo(0, 0); return; }
  if (c === 'futyr') { VIEW.cyr = +el.value || 0; VIEW.open = null; render(); return; }   // v413 : saison future à préparer (Terrains)
  if (c === 'pgflt') { pigeState().flt = el.checked; persist(); if (inPN()) pnSave(); return; }
  if (c === 'pgto') return;
  if (c === 'tejump') { if (REVEAL) { clearInterval(REVEAL.timer); REVEAL = null; } teeJump(el.value); return; }
  if (c === 'crfkmmaj') { crf().lockMaj = el.checked; persist(); crfRemember(); render(); return; }
  if (c === 'crfkm') { crf().autoKm = el.checked; persist(); crfRemember(); return; }
  if (c === 'bkm') { S.bkm = el.value; persist(); render(); toast(BK_MODES.find(x => x[0] === el.value)[1]); return; }   // v441
  if (c === 'voys') { VIEW.s = +el.value; VOY_ROT = null; render(); return; }
  if (c === 'crfauto' || c === 'crfnorep') { crf()[c === 'crfauto' ? 'auto' : 'noRep'] = el.checked; persist(); crfRemember(); return; }
  if (c === 'cord') { const i = +d.i, j = +el.value; if (swapCourses(i, j)) toast(i >= N_TOURN || j >= N_TOURN ? 'Tournoi ' + (Math.min(i, j) + 1) + ' et Finale échangés' : 'Tournois ' + (i + 1) + ' et ' + (j + 1) + ' échangés'); render(); return; }
  if (c === 'season') { VIEW.s = +el.value; render(); }
  else if (c === 'cname') {
    const i = +d.i, name = el.value.trim() || (FUT ? '' : 'Terrain ' + (i + 1)); S.courses[i].name = name;
    const bi = findBankCourse(name, S.courses[i].tee);
    if (bi >= 0) { applyBankToCourse(S.courses[i], S.courseBank[bi]); S.courses[i].name = S.courseBank[bi].name; const tz = bankTeesOf(name); if (!AC_QUIET) toast(tz.length > 1 ? 'Rempli avec les tees ' + S.courseBank[bi].tee + ' (aussi : ' + tz.filter(x => x !== S.courseBank[bi].tee).join(', ') + ')' : 'Terrain rempli automatiquement depuis la liste'); }
    persist(); VIEW.open = i; renderKeep(i);
  }
  else if (c === 'loadbank') {
    const i = +d.i, bi = el.value; if (bi === '') return;
    applyBankToCourse(S.courses[i], S.courseBank[+bi]); S.courses[i].name = S.courseBank[+bi].name;
    persist(); VIEW.open = i; renderKeep(i); toast('Terrain charg\u00e9');
  }
  else if (c === 'cpar' || c === 'bpar') {
    const arr = c === 'cpar' ? S.courses[+d.i].pars : S.courseBank[+d.i].pars;
    arr[+d.h] = +el.value; persist(); if (c === 'cpar') VIEW.open = +d.i; else VIEW.bopen = +d.i; render();
  }
  else if (c === 'cparpaste' || c === 'bparpaste') {
    const nums = (el.value.match(/[345]/g) || []).map(Number);
    if (nums.length === 18) {
      if (c === 'cparpaste') { S.courses[+d.i].pars = nums; VIEW.open = +d.i; } else { S.courseBank[+d.i].pars = nums; VIEW.bopen = +d.i; }
      persist(); render(); toast('Par enregistr\u00e9s');
    } else toast('Il faut exactement 18 chiffres (3, 4 ou 5)');
  }
  else if (c === 'cidx' || c === 'bidx') {
    const arr = c === 'cidx' ? S.courses[+d.i].index : S.courseBank[+d.i].index;
    arr[+d.h] = Math.max(1, Math.min(18, +el.value || 1)); el.value = arr[+d.h]; persist();
  }
  else if (c === 'cidxpaste' || c === 'bidxpaste') {
    const nums = (el.value.match(/1[0-8]|[1-9]/g) || []).map(Number).filter(n => n >= 1 && n <= 18);
    if (nums.length === 18) {
      if (c === 'cidxpaste') { S.courses[+d.i].index = nums; VIEW.open = +d.i; } else { S.courseBank[+d.i].index = nums; VIEW.bopen = +d.i; }
      persist(); render(); toast('Index enregistr\u00e9s');
    } else toast('Il faut exactement 18 chiffres de 1 \u00e0 18');
  }
  else if (c === 'ctee') {
    const i = +d.i, cc = S.courses[i]; cc.tee = el.value.trim() || 'White';
    const bi = findBankCourse(cc.name, cc.tee);
    if (bi >= 0 && normName(S.courseBank[bi].tee) === normName(cc.tee)) { applyBankToCourse(cc, S.courseBank[bi]); VIEW.open = i; renderKeep(i); toast('Tees ' + cc.tee + ' charg\u00e9s depuis la liste'); }
    persist();
  }
  else if (c === 'btee') { S.courseBank[+d.i].tee = el.value.trim() || 'White'; persist(); VIEW.bopen = +d.i; render(); }
  else if (c === 'cdist' || c === 'bdist') { (c === 'cdist' ? S.courses : S.courseBank)[+d.i].dist = Math.max(1000, Math.min(9000, +el.value || 6070)); persist(); }
  else if (c === 'ccr' || c === 'bcr') { (c === 'ccr' ? S.courses : S.courseBank)[+d.i].cr = Math.max(40, Math.min(90, +el.value || 70)); persist(); }
  else if (c === 'cslope' || c === 'bslope') { (c === 'cslope' ? S.courses : S.courseBank)[+d.i].slope = Math.max(55, Math.min(155, +el.value || 128)); persist(); }
  else if (c === 'cpin') { S.courses[+d.i].pin = el.value; persist(); }
  else if (c === 'cwind') { S.courses[+d.i].wind = el.value; persist(); }
  else if (c === 'cpin2') { S.courses[+d.i].pin2 = el.value; persist(); }
  else if (c === 'cwind2') { S.courses[+d.i].wind2 = el.value; persist(); }
  else if (c === 'cpurse') { const v = Math.round(+el.value / 100000) * 100000; if (v > 0) { S.courses[+d.i].purse = v; persist(); VIEW.open = +d.i; renderKeep(+d.i); } }
  else if (c === 'bname') { S.courseBank[+d.i].name = el.value.trim() || 'Nouveau terrain'; persist(); VIEW.bopen = +d.i; render(); }
  else if (c === 'cut') { S.settings.cut = Math.max(20, Math.min(140, +el.value || DEFAULT_CUT)); persist(); }
  else if (c === 'tbl') {
    const p = +d.p, k = +d.k, T = S.settings.tables[p], old = T[k] || 0;
    const v = Math.max(0, Math.min(60, Math.round((+el.value || 0) * 1000) / 1000));
    T[k] = v;
    if (100 - tableSum(p) < 10) { T[k] = old; el.value = old; toast('Total trop \u00e9lev\u00e9 : le par doit rester au-dessus de 10 %'); }
    else { el.value = v; MODEL = buildModel(S.settings.tables); persist(); }
    const rt = document.getElementById('rest' + p); if (rt) rt.textContent = restText(p);
  }
  else if (c === 'cfg') { S.cfg[d.k] = +el.value; setCfg(S.cfg); persist(); }
  else if (c === 'adv') { advSet(d.k, +el.value); render(); }
  else if (c === 'cfgnum') { const mn = +d.min || 0, mx = el.max !== '' ? +el.max : Infinity; S.cfg[d.k] = Math.min(mx, Math.max(mn, Math.round((+String(el.value).replace(',', '.') || mn) * 10) / 10)); if (d.k === 'goodStep') S.cfg.goodStep = Math.min(30, S.cfg.goodStep); el.value = S.cfg[d.k]; setCfg(S.cfg); persist(); }
  else if (c === 'duo' && S.duo) { const v = Math.max(0, +String(el.value).replace(',', '.') || 0); if (d.k === 'lm') S.duo.lm[+d.i] = Math.min(100, Math.round(v)); else if (d.k === 'hc') S.duo.hc = Math.min(36, Math.round(v)); else S.duo[d.k] = v; if (S.duo.max < S.duo.min) S.duo.max = S.duo.min; persist(); }
  else if (c === 'cfgwind') { const w = (Array.isArray(S.cfg.windW) && S.cfg.windW.length === 4 ? S.cfg.windW : WIND_WEIGHTS).slice(); w[+d.i] = Math.max(0, Math.min(100, Math.round(+el.value || 0))); if (!w.some(x => x > 0)) w[0] = 100; S.cfg.windW = w; setCfg(S.cfg); persist(); }
  else if (c === 'cfgcheck') { S.cfg[d.k || 'showForm'] = el.checked ? 1 : 0; setCfg(S.cfg); persist(); }
  else if (c === 'ptsi' || c === 'ptst') { if (!settingsLocked()) ptsEdit(c, el); }
  else if (c === 'pts') {
    const nums = el.value.split(/[^0-9.]+/).filter(Boolean).map(Number).filter(n => isFinite(n) && n >= 0);
    if (nums.length) { S.settings.pts = nums; setPoints(nums, S.settings.mc); persist(); toast('Bar\u00e8me enregistr\u00e9'); } else toast('Bar\u00e8me invalide');
  }
  else if (c === 'majn') { S.settings.majN = (S.settings.majN || MAJ_DEF.slice()).slice(); S.settings.majN[+el.dataset.i] = el.value.slice(0, 40); persist(); }
  else if (c === 'mc') { S.settings.mc = Math.max(0, Math.min(100, +el.value || 0)); setPoints(S.settings.pts, S.settings.mc); persist(); }
});
/* Bulle des indicateurs ▲▼ : survol à la souris, toucher sur téléphone (un 2e toucher ou un toucher ailleurs la ferme) */
let MW_EL = null;
function mwShow(el) {
  let t = document.getElementById('mwtip'); if (!t) { t = document.createElement('div'); t.id = 'mwtip'; t.setAttribute('role', 'tooltip'); document.body.appendChild(t); }
  t.textContent = el.dataset.mw; t.hidden = false; MW_EL = el;
  const z = zf(), R = el.getBoundingClientRect(), r = { left: R.left / z, width: R.width / z, top: R.top / z, bottom: R.bottom / z }, W = window.innerWidth / z, H = window.innerHeight / z, w = t.offsetWidth, h = t.offsetHeight;   // v416 : zoom
  let x = Math.min(W - w - 12, Math.max(12, r.left + r.width / 2 - w / 2)), y = r.bottom + 8;
  if (y + h > H - 8) y = Math.max(8, r.top - h - 8);
  t.style.left = x + 'px'; t.style.top = y + 'px';
}
function mwHide() { const t = document.getElementById('mwtip'); if (t) t.hidden = true; MW_EL = null; }
let MW_TOUCH = 0;
document.addEventListener('mouseover', e => { if (Date.now() - MW_TOUCH < 900) return; const el = e.target.closest && e.target.closest('[data-mw]'); if (el) mwShow(el); });
document.addEventListener('mouseout', e => { const el = e.target.closest && e.target.closest('[data-mw]'); if (el && !el.contains(e.relatedTarget)) mwHide(); });
document.addEventListener('focusin', e => { const el = e.target.closest && e.target.closest('[data-mw]'); if (el) mwShow(el); });
document.addEventListener('focusout', e => { if (e.target.dataset && e.target.dataset.mw != null) mwHide(); });
document.addEventListener('scroll', () => { if (MW_EL) mwHide(); }, true);
document.addEventListener('pointerdown', e => {
  if (e.pointerType === 'touch') MW_TOUCH = Date.now();
  const mw = e.target.closest && e.target.closest('[data-mw]');
  if (mw) { e.preventDefault(); if (MW_EL === mw) mwHide(); else mwShow(mw); return; } else if (MW_EL) mwHide();
  const pb = e.target.closest && e.target.closest('[data-pnpick]'); if (pb) { e.preventDefault(); pnPick(+pb.dataset.pnpick); return; }
  const sp = e.target.closest && e.target.closest('[data-splpick]'); if (sp) { e.preventDefault(); splAdd(sp.dataset.k, BANK[+sp.dataset.splpick].name); return; }
  const b = e.target.closest && e.target.closest('[data-acpick]'); if (!b) return;
  e.preventDefault(); futOn(); acPick(+b.dataset.i, +b.dataset.acpick);
});
document.addEventListener('focusout', e => { const el = e.target; if (el.dataset && el.dataset.splac) setTimeout(() => { const box = document.getElementById('splac-' + el.dataset.splac); if (box && !box.contains(document.activeElement)) { box.classList.remove('open'); box.innerHTML = ''; } }, 150); if (el.dataset && el.dataset.ac != null) setTimeout(() => { const box = document.getElementById('ac' + el.dataset.ac); if (box && document.activeElement !== el) { box.classList.remove('open'); box.innerHTML = ''; } }, 150); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && VIEW && VIEW.retAsk) { VIEW.retAsk = false; render(); return; }
  const el = e.target;
  if (el.dataset && el.dataset.splac) { const box = document.getElementById('splac-' + el.dataset.splac), it = box ? [...box.querySelectorAll('[data-splpick]')] : [], k = it.findIndex(x => x.classList.contains('on'));
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && it.length) { e.preventDefault(); const n = (k + (e.key === 'ArrowDown' ? 1 : -1) + it.length) % it.length; it.forEach((x, j) => x.classList.toggle('on', j === n)); return; }
    if (e.key === 'Enter') { e.preventDefault(); const x = it[k < 0 ? 0 : k]; if (x) splAdd(el.dataset.splac, BANK[+x.dataset.splpick].name); else if (el.value.trim()) splAdd(el.dataset.splac, el.value.trim()); return; }
    if (e.key === 'Escape' && box) { box.classList.remove('open'); box.innerHTML = ''; return; } }
  if (el.id === 'topq') { const box = document.getElementById('topqres'), it = box ? [...box.querySelectorAll('.mtsr')] : [], k = it.findIndex(x => x.classList.contains('on'));   // v434 : recherche du haut
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && it.length) { e.preventDefault(); const n = (k + (e.key === 'ArrowDown' ? 1 : -1) + it.length) % it.length; it.forEach((x, j) => x.classList.toggle('on', j === n)); return; }
    if (e.key === 'Enter') { e.preventDefault(); const x = it[k < 0 ? 0 : k]; if (x) x.click(); return; }
    if (e.key === 'Escape') { el.value = ''; topqRender(''); el.blur(); return; } }
  if (el.dataset && el.dataset.pnac && e.key === 'Enter') { e.preventDefault(); const x = document.querySelector('#pnac [data-pnpick]'); if (x) pnPick(+x.dataset.pnpick); return; }
  if (!(el.dataset && el.dataset.ac != null) || !S) return;
  const box = document.getElementById('ac' + el.dataset.ac); if (!box || !box.classList.contains('open')) return;
  const it = [...box.querySelectorAll('[data-acpick]')], k = it.findIndex(x => x.classList.contains('on'));
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); const n = (k + (e.key === 'ArrowDown' ? 1 : -1) + it.length) % it.length; it.forEach((x, j) => x.classList.toggle('on', j === n)); }
  else if (e.key === 'Enter') { e.preventDefault(); const x = it[k < 0 ? 0 : k]; if (x) { futOn(); acPick(+x.dataset.i, +x.dataset.acpick); } }
  else if (e.key === 'Escape') { box.classList.remove('open'); box.innerHTML = ''; }
});
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset && el.dataset.ac != null && S) { acRender(+el.dataset.ac, el.value); return; }
  if (el.dataset && el.dataset.pnac) { pnAcRender(el.value); return; }
  if (el.id === 'topq' && S) { topqRender(el.value); return; }
  if (el.dataset && el.dataset.splac && S) { splAcRender(el.dataset.splac, el.value); return; }
  if (el.dataset && el.dataset.pnc === 'hc') { const C = pnCfg(); C.hc = el.value; pnSave(); const e = document.getElementById('pnest'); if (e) e.innerHTML = pnEstHTML(C); return; }
  if (el.id === 'bq' && S) { VIEW.bq = el.value; VIEW.bn = 30; const L = document.getElementById('bklist'); if (L) L.innerHTML = bankListHTML(); return; }
  if (el.id === 'expn') { VIEW.exportName = el.value; return; }
  if (el.id === 'nhc') { newFormSave(); const w = document.getElementById('lvlest'); if (w) w.innerHTML = lvlEstHTML(); return; }
  if (el.id === 'startyear' || el.id === 'presim') { const hn = document.getElementById('presimHint'); if (hn) hn.textContent = presimHint(); return; }
  if (el.dataset && el.dataset.c === 'tbl') {
    const p = +el.dataset.p, T = S.settings.tables[p]; let tot = 0;
    T.forEach((x, k) => { const inp = document.getElementById('t' + p + k); tot += inp ? (+inp.value || 0) : (x || 0); });
    const rt = document.getElementById('rest' + p); if (rt) { rt.textContent = (Math.round((100 - tot) * 1000) / 1000) + ' %'; rt.classList.toggle('bad', 100 - tot < 10); }
  }
  if (el.dataset && el.dataset.c === 'adv') { const it = ADV.reduce((a, s) => a.concat(s.items), []).find(i => i.k === el.dataset.k); const o = document.getElementById('ao-' + el.dataset.k); if (it && o) { o.textContent = it.f(+el.value); o.classList.toggle('chg', String(+el.value) !== String(ADV_BASE(it.k))); } const n = document.getElementById('an-' + el.dataset.k); if (it && n && typeof it.note === 'function') n.textContent = it.note(+el.value); }
  if (el.dataset && el.dataset.c === 'cfg') { const o = document.getElementById('cv-' + el.dataset.k); if (o) o.textContent = el.value + (el.dataset.u || ''); }
  if (el.id === 'q' && VIEW.name === 'golfers') { VIEW.q = el.value; document.getElementById('qres').innerHTML = qResults(el.value); const b = document.getElementById('gsblk'); if (b) b.hidden = el.value.trim().length >= 2; }
});
document.addEventListener('toggle', e => {
  const el = e.target; if (el.tagName !== 'DETAILS') return;
  if (el.dataset.i !== undefined) { if (el.open) VIEW.open = +el.dataset.i; else if (VIEW.open === +el.dataset.i) VIEW.open = null; }
  else if (el.dataset.bi !== undefined) { if (el.open) VIEW.bopen = +el.dataset.bi; else if (VIEW.bopen === +el.dataset.bi) VIEW.bopen = null; }
}, true);

try {
  const mq = window.matchMedia('(min-width:900px)'), onMq = () => { const was = document.documentElement.classList.contains('pc'); applyLayout(); if (was !== isPC() && VIEW) render(); };
  if (mq.addEventListener) mq.addEventListener('change', onMq); else mq.addListener(onMq);
} catch (e) { }
/* Démarrage : un écran « Chargement » tout de suite, et un écran de secours si quelque chose bloque (au lieu d'une page blanche). */
let BOOTED = false;
function bootRescue(why) {
  if (BOOTED) return;
  $tabs.hidden = true;
  $app.innerHTML = '<div class="wrap"><div class="top"><h1>Indoor Golf Career</h1></div><div class="narrow"><div class="block"><p><b>Le jeu n\u2019arrive pas \u00e0 d\u00e9marrer.</b></p><p class="small mute">' + esc(why) + '</p>' +
    '<button class="btn" id="rsRetry">R\u00e9essayer</button>' +
    '<button class="btn sec" id="rsSave">T\u00e9l\u00e9charger ma sauvegarde (par pr\u00e9caution)</button>' +
    '<button class="btn sec" id="rsBank">Vider la liste de terrains puis red\u00e9marrer</button>' +
    '<p class="small mute">Vider la liste de terrains ne touche pas \u00e0 ta partie : tu pourras r\u00e9importer tes terrains ensuite.</p></div></div></div>';
  const get = k => new Promise(res => { try { const r = DB.db.transaction('kv').objectStore('kv').get(k); r.onsuccess = () => res(r.result); r.onerror = () => res(null); } catch (e) { try { res(JSON.parse(localStorage.getItem(k === 'save' ? 'golf-carriere' : 'golf-bank'))); } catch (e2) { res(null); } } });
  document.getElementById('rsRetry').onclick = () => location.reload();
  document.getElementById('rsSave').onclick = async () => { const o = await get('save'); if (!o) { alert('Aucune sauvegarde trouv\u00e9e.'); return; } const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(Object.assign({}, o, { courseBank: [] }))], { type: 'application/json' })); a.download = 'carriere-golf-secours.json'; document.body.appendChild(a); a.click(); a.remove(); };
  document.getElementById('rsBank').onclick = () => { try { DB.db.transaction('kv', 'readwrite').objectStore('kv').delete('bank'); } catch (e) { } try { localStorage.removeItem('golf-bank'); } catch (e) { } setTimeout(() => location.reload(), 400); };
}
(async function boot() {
  try { $app.innerHTML = '<div class="wrap"><p class="mute" style="padding:40px 0;text-align:center">Chargement\u2026</p></div>'; } catch (e) { }
  const guard = setTimeout(() => bootRescue('Le chargement prend anormalement de temps.'), 12000);
  try {
    const gb = await bankLoad(); BANK.length = 0; bankMerge(Array.isArray(gb) ? gb : []);
    let pre = 0; try { pre = preloadCourses(); } catch (e) { }   // liste de terrains fournie avec le jeu (terrains-data.js)
    try { SAVEDIR = await dirKv('get'); } catch (e) { }
    try { await Promise.race([gfxLoadIndex(), new Promise(r => setTimeout(r, 3000))]); } catch (e) { }
    const pnx = await pnLoad(); if (pnx) PNX = { cfg: pnx.cfg || null, cur: pnx.cur || null };
    const saved = await dbGet();
    if (saved && saved.G && saved.L) {
      loadState(saved);
      if (S.presim) { BOOTED = true; clearTimeout(guard); VIEW = { name: 'home' }; runPresim(); return; }   // histoire interrompue (app ferm\u00e9e) : on la termine
      if (S.cur && S.cur.phase === 'cut') VIEW = { name: 'roundEnd' }; else VIEW = { name: 'home' };
    } else VIEW = { name: 'new', mode: SLOT === 'save-duo' ? 'duo' : 'manual' };
    try { if (S && phAssignAll()) persist(); } catch (e) { }
    render(); BOOTED = true; clearTimeout(guard);
    if (GFX.dir) gfxSyncDir(false);   // dossier Graphics déjà autorisé : nouvelles images lues en silence
    if (pre) toast('Liste de terrains à jour : ' + new Set(BANK.map(b => normName(b.name))).size + ' terrains dans ta liste');
  } catch (e) { clearTimeout(guard); bootRescue('Erreur : ' + (e && e.message || e)); }
})();

/* v434 : la liste de la recherche du haut se ferme quand on clique ailleurs */
document.addEventListener('pointerdown', e => { const b = document.getElementById('topqres'); if (b && !b.hidden && !(e.target.closest && e.target.closest('.mtsrch'))) b.hidden = true; });
