export function validate(data){
 if(data?.type!=="FeatureCollection"||!Array.isArray(data.features)||data.features.length>10000)throw Error("FeatureCollection inválida ou mais de 10000 elementos.");
 let count=0;const points=[];
 function geometry(g){if(g===null)return;if(!g||typeof g!=="object")throw Error("Geometria inválida");
 if(g.type==="GeometryCollection"){if(!Array.isArray(g.geometries)||g.geometries.length>10000)throw Error("Coleção inválida");for(const child of g.geometries){if(child?.type==="GeometryCollection")throw Error("Coleções aninhadas não suportadas");geometry(child);}return;}
 const depth={Point:0,MultiPoint:1,LineString:1,MultiLineString:2,Polygon:2,MultiPolygon:3}[g.type];if(depth===undefined)throw Error("Tipo de geometria não suportado");
 function walk(c,d){if(!Array.isArray(c))throw Error("Coordenadas inválidas");if(d){for(const v of c)walk(v,d-1);}else{if(c.length<2||!Number.isFinite(c[0])||!Number.isFinite(c[1])||Math.abs(c[0])>180||Math.abs(c[1])>90)throw Error("Coordenadas fora de WGS84");if(++count>100000)throw Error("Mais de 100000 vértices");points.push(c);}}walk(g.coordinates,depth);}
 for(const f of data.features){if(f?.type!=="Feature"||!(f.properties===null||typeof f.properties==="object"&&!Array.isArray(f.properties)))throw Error("Feature inválida");geometry(f.geometry);}return {data,points};}
export function bounds(points){if(!points.length)return [-180,-90,180,90];let a=Infinity,b=Infinity,c=-Infinity,d=-Infinity;for(const [x,y]of points){a=Math.min(a,x);b=Math.min(b,y);c=Math.max(c,x);d=Math.max(d,y);}return [a,b,c,d];}
