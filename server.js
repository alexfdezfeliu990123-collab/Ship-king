// NaviMar server: AIS real (aisstream.io) + posición compartida del buque (capitán -> invitado)
const http=require('http'),WebSocket=require('ws');
const KEY=process.env.AISSTREAM_KEY||'',WRITE=process.env.WRITE_CODE||'',VIEW=process.env.VIEW_CODE||'',PORT=process.env.PORT||3000;
// Zonas de escucha [[lat,lon],[lat,lon]]: Caribe/Golfo/costa este de EE. UU. y Europa occidental/Mediterráneo. Ajústalas.
const BOX=[[[5,-100],[40,-55]],[[30,-15],[62,40]]];
const vessels=new Map(),own={};
function typeName(c){return c}
function connect(){const ws=new WebSocket('wss://stream.aisstream.io/v0/stream');
  ws.on('open',()=>ws.send(JSON.stringify({APIKey:KEY,BoundingBoxes:BOX,FilterMessageTypes:['PositionReport','ShipStaticData']})));
  ws.on('message',d=>{try{const m=JSON.parse(d),M=m.Message||{},id=m.MetaData.MMSI,v=vessels.get(id)||{mmsi:id};
    v.name=(m.MetaData.ShipName||v.name||'').trim();
    if(M.PositionReport){const p=M.PositionReport;Object.assign(v,{lat:p.Latitude,lon:p.Longitude,cog:p.Cog,sog:p.Sog,t:Date.now()})}
    if(M.ShipStaticData)v.type=M.ShipStaticData.Type;
    vessels.set(id,v)}catch(e){}});
  ws.on('close',()=>setTimeout(connect,5000));ws.on('error',()=>ws.close())}
if(KEY)connect();else console.log('Falta AISSTREAM_KEY: sin buques reales');
setInterval(()=>{const c=Date.now()-3600e3;for(const[k,v]of vessels)if(!v.t||v.t<c)vessels.delete(k)},60000);
http.createServer((q,r)=>{
  const u=new URL(q.url,'http://x'),k=q.headers['x-token']||'';
  const send=(c,o)=>{r.writeHead(c,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type,x-token','Access-Control-Allow-Methods':'GET,POST,OPTIONS'});r.end(JSON.stringify(o))};
  if(q.method==='OPTIONS')return send(204,{});
  const w=!!WRITE&&k===WRITE,rd=w||(!!VIEW&&k===VIEW);
  if(!rd)return send(401,{error:'código incorrecto'});
  if(u.pathname==='/vessels'){const la=+u.searchParams.get('lat'),lo=+u.searchParams.get('lon'),R=+u.searchParams.get('r')||30,out=[];
    for(const v of vessels.values()){if(v.lat==null)continue;if(Math.hypot((v.lat-la)*60,(v.lon-lo)*60*Math.cos(la*Math.PI/180))<=R)out.push(v)}
    return send(200,out.slice(0,400))}
  if(u.pathname==='/pos'){const id=u.searchParams.get('id')||'demo';
    if(q.method==='POST'){if(!w)return send(403,{error:'solo capitán / primer oficial'});let b='';q.on('data',c=>b+=c);
      q.on('end',()=>{try{const d=JSON.parse(b),o=own[id]||(own[id]={trk:[]});Object.assign(o,d,{t:Date.now()});
        const l=o.trk[o.trk.length-1];if(!l||Math.hypot(d.lat-l[0],d.lon-l[1])>.0003)o.trk.push([d.lat,d.lon]);if(o.trk.length>1500)o.trk.shift();send(200,{ok:1})}catch(e){send(400,{})}});return}
    return send(200,own[id]||{})}
  send(200,{ok:1,vessels:vessels.size})}).listen(PORT);
