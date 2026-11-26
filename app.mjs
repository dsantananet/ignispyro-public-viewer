import {validate,bounds} from './geojson.mjs';
const status=document.querySelector('#status'),map=document.querySelector('#map'),details=document.querySelector('#details');
const ns='http://www.w3.org/2000/svg';
function render(input){
 const {data,points}=validate(input),[a,b,c,d]=bounds(points),scale=Math.min(860/(c-a||1),460/(d-b||1));
 const project=([x,y])=>[450+(x-(a+c)/2)*scale,250-(y-(b+d)/2)*scale];
 map.replaceChildren();details.replaceChildren();
 function draw(g){
  if(!g)return;
  if(g.type==='GeometryCollection'){g.geometries.forEach(draw);return;}
  if(g.type==='Point'||g.type==='MultiPoint'){
   for(const p of g.type==='Point'?[g.coordinates]:g.coordinates){const [x,y]=project(p),el=document.createElementNS(ns,'circle');el.setAttribute('cx',x);el.setAttribute('cy',y);el.setAttribute('r',4);el.setAttribute('fill','#d96d17');map.append(el);}return;
  }
  const lines=g.type==='LineString'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates.flat():g.coordinates;
  const el=document.createElementNS(ns,'path');
  el.setAttribute('d',lines.map(line=>line.map((p,i)=>(i?'L':'M')+project(p).join(',')).join(' ')+(/Polygon/.test(g.type)?' Z':'')).join(' '));
  el.setAttribute('fill',/Polygon/.test(g.type)?'#df8c4433':'none');el.setAttribute('fill-rule','evenodd');el.setAttribute('stroke','#246b58');map.append(el);
 }
 data.features.forEach(f=>draw(f.geometry));
 for(const [i,f]of data.features.slice(0,100).entries()){
  const h=document.createElement('h3');h.textContent='Elemento '+(i+1);details.append(h);
  const table=document.createElement('table');
  for(const [key,value]of Object.entries(f.properties||{})){const tr=document.createElement('tr'),th=document.createElement('th'),td=document.createElement('td');th.textContent=key;td.textContent=typeof value==='object'?JSON.stringify(value):String(value);tr.append(th,td);table.append(tr);}details.append(table);
 }
 status.textContent=`${data.features.length} elementos; ${points.length} vértices. Propriedades dos primeiros 100 elementos.`;
}
document.querySelector('#file').addEventListener('change',async(e)=>{
 map.replaceChildren();details.replaceChildren();
 try{const file=e.target.files[0];if(!file)return;if(file.size>10000000)throw Error('Limite de 10 MB');render(JSON.parse(await file.text()));}
 catch(error){map.replaceChildren();details.replaceChildren();status.textContent=error.message;}
});
async function getPublic(path,limit){
 const response=await fetch(path,{credentials:'omit',redirect:'error',cache:'no-cache',signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('Produto público indisponível');
 const bytes=new Uint8Array(await response.arrayBuffer());if(bytes.length>limit)throw Error('Produto demasiado grande');return bytes;
}
document.querySelector('#load-ipma').addEventListener('click',async(e)=>{
 const button=e.currentTarget;button.disabled=true;status.textContent='A verificar produto público…';
 try{
  const base='/ignispyro-public-products/',raw=await getPublic(base+'manifest.json',50000),m=JSON.parse(new TextDecoder().decode(raw));
  if(m.schema!=='ignispyro-public-products/1'||!Array.isArray(m.products)||m.products.length!==1||!Number.isFinite(Date.parse(m.published_at)))throw Error('Manifesto público inválido');
  const item=m.products[0];
  if(item.id!=='ipma-stations'||item.kind!=='station-catalogue'||!/^products\/ipma-stations-[a-f0-9]{64}\.geojson$/.test(item.path)||!Number.isInteger(item.bytes)||item.bytes>2000000||item.path!=='products/ipma-stations-'+item.sha256+'.geojson')throw Error('Produto não autorizado');
  const bytes=await getPublic(base+item.path,2000000),digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
  if(bytes.length!==item.bytes||digest!==item.sha256)throw Error('Integridade do produto não confirmada');
  render(JSON.parse(new TextDecoder().decode(bytes)));
  status.textContent+=' Catálogo IPMA · publicação '+m.published_at+' · SHA-256 verificado. Sem observações em tempo real.';
 }catch(error){status.textContent=error.message+'. A vista anterior foi preservada.';}finally{button.disabled=false;}
});
