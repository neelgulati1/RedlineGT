function patchLegacy(html,scriptURL){
 const replace=(a,b)=>{if(html.split(a).length!==2)throw Error("Legacy compatibility check failed: "+a.slice(0,70));html=html.replace(a,b)};
 replace('<title>RedlineGT V0.6.2</title>','<title>RedlineGT — Hybrid Preview</title>');
 replace('<script>\n','<script src="'+scriptURL+'"></script>\n<script>\n');
 replace('antialias:true,powerPreference:\'high-performance\'','antialias:false,powerPreference:\'default\'');
 replace("level:(window.matchMedia&&window.matchMedia('(pointer:coarse)').matches)?'low':'high'","level:RedlineHybrid.lowHardware()?'low':'high',scale:RedlineHybrid.lowHardware()?.72:1");
 replace("if(composer){composer.setPixelRatio(renderer.getPixelRatio());composer.setSize(w,h);}","if(composer&&Q.level==='high'){composer.setPixelRatio(renderer.getPixelRatio());composer.setSize(w,h);}");
 replace('moon.shadow.mapSize.set(1536,1536)','moon.shadow.mapSize.set(1024,1024)');
 replace('rt.samples=4','rt.samples=2');
 replace('const FOGC=0xbfe3ff;','const FOGC=0xa9c4d8;');
 replace("day:{fog:0xbfe3ff,fogD:0.0013,hemiSky:0xbfe3ff,hemiGrd:0xd8c9a0,hemiI:0.72,sunCol:0xfff6e0,sunI:0.82","day:{fog:0xa9c4d8,fogD:0.0015,hemiSky:0xc0d8ef,hemiGrd:0x8f8373,hemiI:0.88,sunCol:0xffedcf,sunI:1.18");
 replace("night:{fog:0x121833,fogD:0.0032,hemiSky:0x8ea0e0,hemiGrd:0x2a2233,hemiI:1.45,sunCol:0x9db0ff,sunI:0.55","night:{fog:0x101926,fogD:0.0025,hemiSky:0x91b2d8,hemiGrd:0x35343b,hemiI:1.08,sunCol:0xb2c9eb,sunI:0.72");
 replace("roadBase:'#8b8f99'","roadBase:'#55585b'");
 replace("roadBase:'#171a24'","roadBase:'#343942'");
 replace('function roadTexture(rx,ry,base){','function legacyRoadTexture(rx,ry,base){');
 replace('const roadTexDay=[','const roadTexture=(rx,ry,base)=>RedlineHybrid.roadTexture(THREE,renderer,rx,ry,base);\nconst roadTexDay=[');
 const start=html.indexOf('(function envMap(){'),end=html.indexOf('/* ================= TERRAIN',start);
 if(start<0||end<start)throw Error("Environment anchor missing");
 html=html.slice(0,start)+'RedlineHybrid.environment(THREE,renderer,scene,MODE);\n'+html.slice(end);
 replace("MODE=mode;const T=THEME[mode];saveTheme();","MODE=mode;const T=THEME[mode];saveTheme();RedlineHybrid.environment(THREE,renderer,scene,MODE);");
 const carStart=html.indexOf('  add(GEO[key].body,pm,0,0,0);'),carEnd=html.indexOf('  let copParts=null;',carStart);
 if(carStart<0||carEnd<carStart)throw Error("Car anchors missing");
 const original=html.slice(carStart,carEnd);
 // Keep dimensional variables available to the existing police/wheel code.
 const decl='  const r=prof.roof,cabHalf=W*prof.cabW/2,bodyHalf=W*0.475+0.07;\n  const noseY=prof.body[prof.body.length-2][1],tailY=prof.body[1][1];\n';
 const originalBody=original.replace('  const r=prof.roof,cabHalf=W*prof.cabW/2,bodyHalf=W*0.475+0.07;\n','').replace('  const noseY=prof.body[prof.body.length-2][1],tailY=prof.body[1][1];\n','');
 html=html.slice(0,carStart)+decl+'  const hybridBody=isPlayer&&!cop&&RedlineHybrid.supports(shape);\n  if(hybridBody){RedlineHybrid.body(THREE,inner,def,prof,pm,MAT);}else{\n'+originalBody+'  }\n'+html.slice(carEnd);
 replace('pivot.add(spin);spin.add(new THREE.Mesh(TIRE_G,MAT.tire));spin.add(new THREE.Mesh(RIM_G,MAT.rim));inner.add(pivot);','pivot.add(spin);if(hybridBody){RedlineHybrid.wheel(THREE,spin,MAT);}else{spin.add(new THREE.Mesh(TIRE_G,MAT.tire));spin.add(new THREE.Mesh(RIM_G,MAT.rim));}inner.add(pivot);');
 replace('add(ARCH_G,MAT.dark,sx*(bodyHalf+0.0),0.36,sz*L*0.33);','if(!hybridBody)add(ARCH_G,MAT.dark,sx*(bodyHalf+0.0),0.36,sz*L*0.33);');
 replace('opacity:cop?0.32:0.28','opacity:cop?0.32:0.05');
 replace('const latLim=pl?Math.max(2.5,grip*3.8):1e9;','const latLim=pl?RedlineHybrid.lateralLimit(d.grip,X.gripMul,flat,c.ice,!!I.hb,c.upGrip||1,a):1e9;');
 replace('if(!I.hb)vf+=(vf<0?-1:1)*Math.abs(dl)*0.5;','if(!I.hb){if(pl)vf=RedlineHybrid.scrub(vf,dl);else vf+=(vf<0?-1:1)*Math.abs(dl)*0.5;}');
 replace('if(sp>6&&!I.hb)yaw=clamp(yaw,-latLim/sp*1.25,latLim/sp*1.25);','if(sp>6&&!I.hb)yaw=clamp(yaw,-latLim/sp*1.12,latLim/sp*1.12);');
 replace('const steps=Math.max(1,Math.ceil(dt/0.0125))','const steps=Math.max(1,Math.ceil(dt/0.0125))'); // explicit compatibility guard, keep original AI timing
 replace('const raw=Math.min(0.05,Math.max(0,(now-last)/1000));last=now;','const realFrame=Math.max(0,(now-last)/1000),raw=Math.min(0.05,realFrame);last=now;');
 replace('Q.ema=Q.ema?Q.ema*0.96+raw*0.04:raw;','Q.ema=Q.ema?Q.ema*0.96+Math.min(realFrame,.25)*0.04:Math.min(realFrame,.25);RedlineHybrid.stats(realFrame,renderer,Q);');
 replace('if(fps<44&&sc>0.55)sc=Math.max(0.55,sc-0.12);else if(fps>57&&sc<1)sc=Math.min(1,sc+0.06);','if(fps<(Q.level===\'low\'?28:43)&&sc>0.45)sc=Math.max(0.45,sc-0.10);else if(fps>(Q.level===\'low\'?39:57)&&sc<1)sc=Math.min(1,sc+0.04);');
 replace("Q.level='low';Q.lowT=0;Q.scale=1;applyQuality();","Q.level='low';Q.lowT=0;Q.scale=Math.min(Q.scale||1,.72);applyQuality();");
 replace("const BLDCOL=[[1.0,0.62,0.66],[0.55,0.82,1.0],[1.0,0.82,0.42],[0.62,0.88,0.66],[0.78,0.65,1.0],[1.0,0.72,0.5],[0.6,0.9,0.88],[1.0,0.92,0.6]];","const BLDCOL=[[.83,.79,.76],[.64,.73,.82],[.84,.79,.69],[.72,.77,.72],[.83,.79,.75],[.80,.80,.76]];");
 replace("x.fillStyle=emissive?'#000':'#eef3fa'","x.fillStyle=emissive?'#000':'#a9afb2'");
 replace("x.fillStyle=emissive?'#000':'#8fd6f2'","x.fillStyle=emissive?'#000':'#557080'");
 // Never overwrite the original game's saves.
 html=html.replace(/(['"])redline-(theme|bank|money|owned|cheat|vol|x|name|story)\1/g,(_,q,k)=>q+'redline-hybrid-'+k+q);
 return html;
}
const iframe=document.getElementById('game'),status=document.getElementById('status');
try{
 const response=await fetch(new URL('../classic.html',location.href),{cache:'no-cache'});
 if(!response.ok)throw Error('Original game HTTP '+response.status);
 const html=patchLegacy(await response.text(),new URL('./hybrid/upgrade.js',import.meta.url).href);
 iframe.srcdoc=html;iframe.hidden=false;status.hidden=true;
}catch(error){status.textContent='Hybrid preview could not load: '+error.message;}
