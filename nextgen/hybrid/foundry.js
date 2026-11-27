/* Batched geometry shares world coordinates with the existing collision grid. */
(function(){
 if(!window.THREE)return;
 const T=THREE;
 let palette;
 function materials(){
   if(palette)return palette;
   function texture(file,color){
     const t=new T.TextureLoader().load('./assets/foundry/'+file+'.jpg');
     t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;
     if(color)t.encoding=T.sRGBEncoding;
     return t;
   }
   function surface(color,file){
     const m=new T.MeshStandardMaterial({color,roughness:.85,side:T.DoubleSide});
     if(file)m.map=texture(file,true);
     return m;
   }
   const plaster=[0xfff1d3,0xd4e5e4,0xffd4c1,0xebeddb].map(c=>surface(c));
   const glass=surface(0x638b9d);glass.roughness=.22;glass.metalness=.32;
   const store=surface(0xffffff,'market-frontages');store.emissiveMap=store.map;store.emissive.setHex(0xffffff);store.emissiveIntensity=.18;
   function scanned(name,tint,strength){
     const mat=surface(tint,name+'-color');
     mat.normalMap=texture(name+'-normal');mat.normalScale.setScalar(strength);
     mat.roughnessMap=texture(name+'-rough');mat.roughness=.97;
     return mat;
   }
   palette={plaster,glass,store,bays:surface(0xffffff,'market-upper-bays'),road:scanned('street',0xced3d5,.65),stone:surface(0xf2e9d6),
     steel:surface(0x475b63),iron:surface(0x303436),rubber:surface(0x181b1d),paving:scanned('sidewalk',0xe1ddd4,.55),joints:surface(0x918f8b),white:surface(0xfff7df),
     yellow:surface(0xf2b344),awnings:[0x168f89,0xdd684e,0x3565a0,0x64956a].map(c=>surface(c))};
   return palette;
 }
 function block(scene,solids,cx,cz){
   const m=materials(),groups=new Map(),side=Math.sign(cx);
   function quad(mat,a,b,c,d,uv=[0,0,1,1]){
     if(!groups.has(mat))groups.set(mat,{p:[],uv:[]});
     const g=groups.get(mat),[u,v,U,V]=uv;
     for(const pt of [a,b,d,b,c,d])g.p.push(...pt);
     g.uv.push(u,v,U,v,u,V,U,v,U,V,u,V);
   }
   function box(mat,x,y,z,w,h,d,tile=0){
     const l=x-w/2,r=x+w/2,n=z-d/2,f=z+d/2,t=y+h;
     const uv=size=>tile?[0,0,size/tile,h/tile]:undefined;
     quad(mat,[l,y,f],[r,y,f],[r,t,f],[l,t,f],uv(w));
     quad(mat,[r,y,n],[l,y,n],[l,t,n],[r,t,n],uv(w));
     quad(mat,[r,y,f],[r,y,n],[r,t,n],[r,t,f],uv(d));
     quad(mat,[l,y,n],[l,y,f],[l,t,f],[l,t,n],uv(d));
     quad(mat,[l,t,f],[r,t,f],[r,t,n],[l,t,n],tile?[0,0,w/tile,d/tile]:undefined);
   }
   box(m.paving,cx,0,cz,72,.35,72,3);
   for(let z=11;z<82;z+=2.4)box(m.joints,side*12,.351,z,4,.004,.023);
   for(let z=11;z<82;z+=3)box(m.stone,side*10,.08,z,.2,.28,2.96);
   for(let z=17;z<82;z+=24){
     const x=side*9.69;
     box(m.iron,x,.027,z,.42,.012,.85);
     for(let n=-4;n<=4;n++)box(m.rubber,x,.04,z+n*.082,.31,.004,.040);
   }
   if(side>0)quad(m.road,[-10,.024,0],[-10,.024,92],[10,.024,92],[10,.024,0],[0,0,23,5]);
   if(side>0){
     for(let z=9;z<87;z+=10)box(m.white,0,.031,z,.12,.01,4);
     for(const x of [-9.4,9.4])box(m.yellow,x,.031,46,.10,.012,72);
   }
   let z=11.4;
   for(let i=0;i<4;i++){
     const w=[17,14,19,17][i],d=22+i%2*4,h=[14,21,11,17][(i+(side>0?0:1))%4];
     const front=side*(13.3+i%2*.45),x=front+side*d/2,mid=z+w/2;
     const row=(i+(side>0?0:2))%4,wall=m.plaster[row],fabric=m.awnings[row];
     box(wall,x,.35,mid,d,h,w);
     solids.push({x0:x-d/2,x1:x+d/2,z0:z,z1:z+w,top:h+.35});
     function face(mat,offset,y,top,a,b,uv){
       const px=front-side*offset,l=side>0?a:b,r=side>0?b:a;
       quad(mat,[px,y,l],[px,y,r],[px,top,r],[px,top,l],uv);
     }
     const u=(row%2)*.5,v=row<2?.5:0;
     face(m.bays,.04,4.04,h-.22,z+.20,z+w-.20,[u+.002,v+.002,u+.498,v+.498]);
     for(let floor=1;floor<3;floor++){
       const y=4.04+(h-4.26)*floor/3;
       box(m.stone,front-side*.11,y,mid,.24,.09,w-.22);
     }
     const span=w-.60,doorHalf=.78;
     const opening=[z+.30,mid-doorHalf,mid+doorHalf,z+w-.30];
     function storeU(p){return .50+side*(p-mid)*.50/span;}
     for(let bay=0;bay<3;bay++){
       const a=opening[bay],b=opening[bay+1];
       face(m.store,bay===1?.06:.32,.42,3.77,a,b,
         [Math.min(storeU(a),storeU(b)),(3-row)/4+.003,Math.max(storeU(a),storeU(b)),(4-row)/4-.003]);
       if(bay!==1){
         box(m.stone,front-side*.19,.35,(a+b)/2,.42,.23,b-a);
         box(m.steel,front-side*.34,.58,(a+b)/2,.055,.045,b-a);
         box(m.steel,front-side*.325,.59,(a+b)/2,.045,2.22,.038);
       }
     }
     for(const p of opening.slice(1,3))box(m.steel,front-side*.20,.37,p,.34,2.55,.075);
     box(m.steel,front-side*.20,2.88,mid,.34,.075,doorHalf*2);
     box(m.stone,front-side*.22,.35,mid,.44,.065,doorHalf*2);
     box(m.steel,front-side*.14,1.14,mid+side*.58,.075,.39,.036);
     for(const pz of [z+.16,z+w-.16])box(wall,front-side*.14,.4,pz,.36,h-.4,.4);
     for(const level of [3.92,h-.28,h+.04])box(m.stone,x-side*.21,level,mid,d+.48,.19,w+.34);
     box(m.steel,x+side*1.8,h+.23,mid,d*.72,.42,w*.65);
     box(m.steel,x,h+.65,mid+1.3,2.9,.92,1.6);
     // Fabric awnings and fluted valances add colour and real overhangs above the displays.
     const edge=front-side*.91;
     for(let stripe=0;stripe<18;stripe++){
       const a=z+.3+stripe*(w-.6)/18,b=a+(w-.6)/18;
       const cloth=stripe%4===0?m.white:fabric;
       quad(cloth,[front,3.81,a],[front,3.81,b],[edge,3.52,b],[edge,3.52,a]);
       box(cloth,edge,3.33,(a+b)/2,.05,.2,b-a);
     }
     if(row===2){
       for(const dz of [-4.2,4.2]){
         const tx=front-side*1.55,tz=mid+dz;
         box(m.stone,tx,1.11,tz,.7,.07,.75);box(m.steel,tx,.4,tz,.09,.73,.09);
         for(const k of [-1,1]){
           box(fabric,tx,.8,tz+k*.68,.45,.06,.4);
           box(fabric,tx,.82,tz+k*.86,.45,.39,.05);
           for(const px of [-.15,.15])for(const pz of [-.14,.14])
             box(m.steel,tx+px,.35,tz+k*.68+pz,.031,.46,.031);
         }
       }
     }
     const rear=side*61,rh=h*(i%2?.83:1.18);
     box(wall,rear,.35,mid,28,rh,w);
     for(let y=2.0;y<rh-1.2;y+=3.1)box(m.glass,rear-side*14.02,y,mid,.07,1.25,w*.91);
     box(m.steel,rear,rh+.35,mid,28.4,.36,w+.4);
     solids.push({x0:rear-14,x1:rear+14,z0:z,z1:z+w,top:rh+.35});
     z+=w+.65;
   }
   for(const [mat,g] of groups){
     const geom=new T.BufferGeometry();
     geom.setAttribute('position',new T.Float32BufferAttribute(g.p,3));
     geom.setAttribute('uv',new T.Float32BufferAttribute(g.uv,2));
     geom.computeVertexNormals();geom.computeBoundingSphere();
     const mesh=new T.Mesh(geom,mat);mesh.receiveShadow=mesh.castShadow=true;scene.add(mesh);
   }
 }
 window.FoundryRow={block};
})();
