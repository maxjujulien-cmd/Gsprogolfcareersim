/* Vérifier les positions des terrains (v457)
   Compare la position de chaque terrain de public/terrains-data.js avec les coordonnées de Simulator Golf Tour
   et liste ceux qui sont à plus de 25 km (ou sans position). Les positions notées src "max" (choisies par Max) sont ignorées.
   Utilisation : télécharger https://simulatorgolftour.com/courses/ dans un fichier, puis
     node tools/verifier-positions.cjs page-sgt.html ecarts.json
   Attention : SGT met parfois un terrain au centre d'une grande ville (London GC au centre de Londres, et non à Ash) :
   vérifier à la main les corrections qui tombent pile sur un centre-ville. Voir docs/terrains.md. */
const fs=require('fs');
const s=fs.readFileSync('public/terrains-data.js','utf8');const L=JSON.parse(s.slice(s.indexOf('{'),s.lastIndexOf('}')+1)).courses;
const h=fs.readFileSync(process.argv[2],'utf8');const S=JSON.parse(h.match(/<script id='courses-data' type='application\/json'>([\s\S]*?)<\/script>/)[1]).courses;
const norm=x=>String(x).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').trim();
const M=new Map();for(const c of S){const k=norm(c[1]);if(!M.has(k))M.set(k,[]);M.get(k).push(c)}
const km=(a,b,c,d)=>{const r=Math.PI/180,x=Math.sin((c-a)*r/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin((d-b)*r/2)**2;return 12742*Math.asin(Math.sqrt(x))};
let st={match:0,nosgt:0,nocoord:0,max:0,ok:0,bad:[]};
for(const t of L){const m=M.get(norm(t.name));if(!m){st.nosgt++;continue}st.match++;
 const c=m.find(c=>c[11]!=null)||m[0]; if(c[11]==null){st.nocoord++;continue}
 if(!t.geo||t.geo.la==null){st.bad.push({n:t.name,d:-1,g:'aucune',sgt:c[2]});continue}
 if(t.geo.src==='max'){st.max++;continue}
 const d=km(t.geo.la,t.geo.lo,c[11],c[12]); if(d>25)st.bad.push({n:t.name,d:Math.round(d),g:(t.geo.pl||'')+', '+(t.geo.cc||''),sgt:c[2],la:c[11],lo:c[12],multi:m.length}); else st.ok++}
st.bad.sort((a,b)=>b.d-a.d);
console.log(JSON.stringify({match:st.match,nosgt:st.nosgt,nocoord:st.nocoord,max:st.max,ok:st.ok,bad:st.bad.length}));
fs.writeFileSync(process.argv[3],JSON.stringify(st.bad,null,0).replace(/\},\{/g,'},\n{'));
