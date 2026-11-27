(function(){
'use strict';
const H=window.RedlineHybrid={};
H.lowHardware=()=> (navigator.deviceMemory||8)<=4||(navigator.hardwareConcurrency||8)<=4||matchMedia('(pointer:coarse)').matches;
H.lateralLimit=function lateralLimit(grip,weather,flat,ice,hand,upgrade,acceleration){
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const mu=clamp(.86+grip*.043,.9,1.34)*clamp(weather,.35,1.2)*(flat?.65:1)*(ice?.4:1)*(hand?.60:1)*clamp(upgrade,.7,1.25);
 const total=9.81*mu,drive=Math.min(Math.abs(acceleration||0),total*.82);
 return Math.sqrt(Math.max(total*total-drive*drive,total*total*.32));
};
H.scrub=function scrub(vf,dl){return Math.sign(vf)*Math.max(0,Math.abs(vf)-Math.abs(dl)*.12);};
const rand=seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
const envCache={};
H.environment=(T,renderer,scene,mode)=>{
 if(envCache[mode]){scene.environment=envCache[mode];return;}
 try{const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const c=canvas.getContext('2d'),w=1024,h=512,night=mode==='night',r=rand(31);
 const g=c.createLinearGradient(0,0,0,h);for(const [p,col] of (night?[[0,'#111c35'],[.43,'#40536f'],[.5,'#78818c'],[.53,'#30343c'],[1,'#17191d']]:[[0,'#648ebd'],[.32,'#b1cce1'],[.48,'#e9e1d3'],[.52,'#77736b'],[1,'#343738']]))g.addColorStop(p,col);c.fillStyle=g;c.fillRect(0,0,w,h);
 if(!night){const sun=c.createRadialGradient(740,155,3,740,155,88);sun.addColorStop(0,'rgba(255,249,221,1)');sun.addColorStop(.15,'rgba(255,245,216,.95)');sun.addColorStop(1,'rgba(255,245,216,0)');c.fillStyle=sun;c.fillRect(650,65,180,180);}
 for(let i=0;i<86;i++){const x=i*12,b=6+r()*50,ww=8+r()*9;c.fillStyle=night?'#202b3d':'#7f8990';c.fillRect(x,260-b,ww,b);if(night){c.fillStyle=r()<.6?'#e7bd80':'#94b6d5';for(let y=264-b;y<254;y+=7)if(r()<.65)c.fillRect(x+2,y,3,2);}}
 const tex=new T.CanvasTexture(canvas);tex.encoding=T.sRGBEncoding;tex.mapping=T.EquirectangularReflectionMapping;const pm=new T.PMREMGenerator(renderer),rt=pm.fromEquirectangular(tex);scene.environment=envCache[mode]=rt.texture;pm.dispose();tex.dispose();
 if(!night){
   const fallback=rt.texture;
   new T.TextureLoader().load('./assets/foundry/street-light.jpg',image=>{
     image.encoding=T.sRGBEncoding;image.mapping=T.EquirectangularReflectionMapping;
     const filter=new T.PMREMGenerator(renderer);
     const photo=filter.fromEquirectangular(image).texture;
     envCache.day=photo;
     if(scene.environment===fallback)scene.environment=photo;
     filter.dispose();image.dispose();rt.dispose();
   });
 }
 }catch(e){console.warn('Environment lighting unavailable',e);}
};
H.roadTexture=(T,renderer,rx,ry,base)=>{
 const size=512,canvas=document.createElement('canvas');canvas.width=canvas.height=size;const c=canvas.getContext('2d'),im=c.createImageData(size,size),r=rand(172),rgb=[1,3,5].map(i=>parseInt(base.slice(i,i+2),16));
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=4*(y*size+x),n=(r()-.5)*24+(r()<.05?15:0)+3*Math.sin(x*.12)*Math.cos(y*.15);for(let k=0;k<3;k++)im.data[i+k]=Math.max(0,Math.min(255,rgb[k]+n));im.data[i+3]=255;}c.putImageData(im,0,0);
 c.strokeStyle='rgba(16,17,18,.19)';c.lineWidth=.75;for(let i=0;i<5;i++){let x=r()*size,y=r()*size;c.beginPath();c.moveTo(x,y);for(let j=0;j<5;j++){x+=(r()-.5)*35;y+=(r()-.5)*35;c.lineTo(x,y);}c.stroke();}
 const t=new T.CanvasTexture(canvas);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return t;
};
H.supports=s=>['coupe','sport','muscle','hatch','sedan','suv','pickup'].includes(s);
const cache=new Map(),shared={};
const interp=(pts,t)=>{for(let i=1;i<pts.length;i++)if(t<=pts[i][0]){const a=pts[i-1],b=pts[i],q=(t-a[0])/(b[0]-a[0]||1);return a[1]+(b[1]-a[1])*q;}return pts[pts.length-1][1];};
function shell(T,rings,materials){
 const p=[],idx=[];for(const ring of rings)for(const v of ring)p.push(...v);const n=rings[0].length;
 const g=new T.BufferGeometry();let offset=0;
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n,c=(j+1)*n+i,d=(j+1)*n+(i+1)%n;idx.push(a,c,d,a,d,b);if(materials)g.addGroup(offset,6,materials(i,j));offset+=6;}
 for(let i=1;i<n-1;i++){idx.push(0,i,i+1);if(materials)g.addGroup(offset,3,0);offset+=3;const b=(rings.length-1)*n;idx.push(b,b+i+1,b+i);if(materials)g.addGroup(offset,3,0);offset+=3;}
 g.setAttribute('position',new T.Float32BufferAttribute(p,3));if(materials){const old=g.groups.slice(),ordered=[];g.clearGroups();for(const mat of [0,1]){const start=ordered.length;for(const q of old)if(q.materialIndex===mat)ordered.push(...idx.slice(q.start,q.start+q.count));if(ordered.length>start)g.addGroup(start,ordered.length-start,mat);}g.setIndex(ordered);}else g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();return g;
}
function add(T,parent,geo,mat,x=0,y=0,z=0){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;}
function bodyGeometry(T,def,prof){
 const key=def.shape+'|'+def.len+'|'+def.wid;if(cache.has(key))return cache.get(key);
 const L=def.len,W=def.wid,half=W*.5,shape=def.shape,suv=shape==='suv'||shape==='pickup',muscle=shape==='muscle';
 const pts=prof.body.slice(1,-1),topAt=t=>interp(pts,t);
 const zs=new Set([-.5,.5]);for(let j=0;j<=48;j++)zs.add(-.5+j/48);for(const center of [-.33,.33])for(let j=-8;j<=8;j++)zs.add(Math.max(-.5,Math.min(.5,center+j*.44/(8*L))));
 const rings=[...zs].sort((a,b)=>a-b).map(t=>{const z=t*L,wheelD=Math.min(Math.abs(z-L*.33),Math.abs(z+L*.33)),arch=wheelD<.405?Math.sqrt(.405*.405-wheelD*wheelD)+.36:.32;
 const lo=Math.max(suv?.40:.30,arch),top=Math.max(topAt(t),lo+.075),end=Math.pow(Math.abs(t)*2,6),flare=Math.exp(-Math.pow(wheelD/.5,2)),width=half*(.91+.065*flare-.105*end),shoulder=width*(muscle?.92:.88);
 return [[-width*.74,.31,z],[-width*.99,lo,z],[-width,Math.max(lo+.02,top-.17),z],[-shoulder,top-.045,z],[-width*.57,top,z],[0,top+.025,z],[width*.57,top,z],[shoulder,top-.045,z],[width,Math.max(lo+.02,top-.17),z],[width*.99,lo,z],[width*.74,.31,z]];});
 const body=shell(T,rings);
 const cp=prof.cab,back=cp[0][0],front=cp[cp.length-1][0],r0=prof.roof[0],r1=prof.roof[1],rY=prof.roof[2],cw=W*prof.cabW*.48;
 const cabZ=[back,back+(r0-back)*.42,r0,r0+(r1-r0)*.45,r1,r1+(front-r1)*.48,front];
 const cabRings=cabZ.map((t,i)=>{const floor=topAt(t)-.035,top=i===0||i===6?floor+.025:i===1?floor+(rY-floor)*.50:i===5?floor+(rY-floor)*.56:rY,width=cw*(i===0||i===6?1:.85);return [[-cw,floor,t*L],[-width,top-.035,t*L],[-width*.74,top,t*L],[width*.74,top,t*L],[width,top-.035,t*L],[cw,floor,t*L]]});
 const cab=shell(T,cabRings,(i,j)=>i===2&&j>=2&&j<=3?1:0);
 const result={body,cab,topAt};cache.set(key,result);return result;
}
// Merge static detail meshes by material.
function merged(T,meshes){const positions=[],normals=[];for(const m of meshes){m.updateMatrix();const q=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();q.applyMatrix4(m.matrix);const p=q.attributes.position.array,n=q.attributes.normal.array;for(let i=0;i<p.length;i++){positions.push(p[i]);normals.push(n[i]);}q.dispose();}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.computeBoundingSphere();return g;}
function parts(T){if(shared.box)return;shared.box=new T.BoxGeometry(1,1,1);shared.black=new T.MeshStandardMaterial({color:0x15191e,roughness:.72,metalness:.2});shared.chrome=new T.MeshStandardMaterial({color:0x9ba0a6,roughness:.28,metalness:.85});shared.red=new T.MeshStandardMaterial({color:0x831821,emissive:0xff1321,emissiveIntensity:.48,roughness:.23});shared.white=new T.MeshStandardMaterial({color:0xe1e9ee,emissive:0xc8e8ff,emissiveIntensity:.52,roughness:.2});shared.rubber=new T.MeshStandardMaterial({color:0x151619,roughness:.88});shared.brake=new T.MeshStandardMaterial({color:0x9d342b,roughness:.4,metalness:.4});}
function box(T,parent,w,h,d,mat,x,y,z){const m=add(T,parent,shared.box,mat,x,y,z);m.scale.set(w,h,d);return m;}
H.body=(T,inner,def,prof,paint,MAT)=>{
 parts(T);const {body,cab,topAt}=bodyGeometry(T,def,prof),L=def.len,W=def.wid,half=L*.5,front=topAt(.5),rear=topAt(-.5);
 paint.roughness=.22;paint.metalness=.56;paint.envMapIntensity=.95;if('clearcoat'in paint){paint.clearcoat=1;paint.clearcoatRoughness=.12;}
 const m=add(T,inner,body,paint);m.castShadow=true;
 const glass=MAT.glass;glass.color.setHex(0x263642);glass.roughness=.15;glass.metalness=.55;glass.envMapIntensity=1.05;
 add(T,inner,cab,[glass,paint]);const detailStart=inner.children.length;
 box(T,inner,W*.73,.08,L*.94,shared.black,0,.27,0);
 for(const side of [-1,1]){
  const x=side*W*.315;
  const head=box(T,inner,W*.26,.078,.035,shared.white,x,front-.105,half-.002);head.rotation.z=side*-.12;head.rotation.y=side*.16;
  const housing=box(T,inner,W*.29,.14,.025,shared.black,x,front-.105,half-.016);housing.rotation.z=side*-.12;
  const tail=box(T,inner,W*.27,.06,.045,shared.red,x,rear-.10,-half-.012);tail.rotation.z=side*.065;
  box(T,inner,W*.18,.035,.05,shared.red,x,rear-.17,-half-.015);
  box(T,inner,W*.16,.13,.035,shared.black,side*W*.32,front-.27,half-.008);
  box(T,inner,.17,.10,.23,paint,side*W*.48,prof.cab[prof.cab.length-1][1]+.16,prof.cab[prof.cab.length-1][0]*L-.28);
  box(T,inner,.045,.075,L*.34,shared.black,side*W*.465,.36,0);
  box(T,inner,.018,.027,.16,shared.chrome,side*W*.463,topAt(-.04)-.13,-L*.06);
  box(T,inner,.17,.07,.11,shared.chrome,side*W*.28,.37,-half-.025);
 }
 box(T,inner,W*.48,.16,.045,shared.black,0,front-.25,half-.012);
 box(T,inner,W*.86,.045,.21,shared.black,0,.32,half-.11);
 box(T,inner,W*.78,.10,.18,shared.black,0,.32,-half+.07);
 if(def.shape==='sport'){const wing=box(T,inner,W*.88,.045,.32,paint,0,rear+.24,-half+.23);wing.rotation.x=-.08;for(const s of [-1,1])box(T,inner,.055,.22,.15,shared.black,s*W*.27,rear+.115,-half+.23);}
 const groups=new Map();for(const m of inner.children.slice(detailStart)){if(!groups.has(m.material))groups.set(m.material,[]);groups.get(m.material).push(m);inner.remove(m);}for(const [mat,meshes] of groups){const g=merged(T,meshes);add(T,inner,g,mat);}
};
H.wheel=(T,spin,MAT)=>{
 parts(T);if(!shared.tire){shared.tire=new T.LatheGeometry([[.23,-.155],[.31,-.155],[.347,-.128],[.36,-.075],[.36,.075],[.347,.128],[.31,.155],[.23,.155]].map(p=>new T.Vector2(...p)),28);shared.tire.rotateZ(Math.PI/2);shared.rim=new T.CylinderGeometry(.235,.235,.25,24);shared.rim.rotateZ(Math.PI/2);shared.hub=new T.CylinderGeometry(.084,.084,.32,16);shared.hub.rotateZ(Math.PI/2);}
 add(T,spin,shared.tire,shared.rubber);add(T,spin,shared.rim,shared.black);add(T,spin,shared.hub,shared.chrome);
 if(!shared.spokes){const tmp=new T.Group();for(let i=0;i<5;i++){const a=i*Math.PI*2/5;for(const side of [-1,1]){const sp=box(T,tmp,.022,.14,.035,shared.chrome,side*.139,.15*Math.cos(a),.15*Math.sin(a));sp.rotation.x=a;}}shared.spokes=merged(T,tmp.children);}add(T,spin,shared.spokes,shared.chrome);
};
let count=0,time=0,el;
H.stats=(dt,renderer,Q)=>{count++;time+=dt;if(time<1)return;if(!el){el=document.createElement('div');el.style.cssText='position:fixed;bottom:7px;left:50%;transform:translateX(-50%);z-index:20;pointer-events:none;font:11px system-ui;color:#e3ecf5;background:#0b1421bb;padding:5px 10px;border-radius:4px;white-space:nowrap';document.body.appendChild(el);}el.textContent='HYBRID · '+Math.round(count/time)+' FPS · '+renderer.domElement.width+'×'+renderer.domElement.height+' · '+Q.level.toUpperCase()+' · '+renderer.info.render.calls+' calls';count=0;time=0;};
})();