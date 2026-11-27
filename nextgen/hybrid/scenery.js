/* Render-only additions. No layout RNG or collision records are touched here. */
window.WorldArt=(()=>{
  const cache=new Map(),loader=new THREE.TextureLoader();
  function texture(file){
    if(!cache.has(file)){
      const t=loader.load(window.RedlineWorldPhotos?.[file]||'./assets/world/'+file);
      t.encoding=THREE.sRGBEncoding;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;cache.set(file,t);
    }return cache.get(file);
  }
  function surface(color,file,roughness=.84){return new THREE.MeshStandardMaterial({color,map:file?texture(file):null,roughness});}
  function combine(parts){
    const pos=[],norm=[],uv=[];
    for(const mesh of parts){
      const g=mesh.index?mesh.toNonIndexed():mesh;
      pos.push(...g.attributes.position.array);norm.push(...g.attributes.normal.array);uv.push(...g.attributes.uv.array);
    }
    const g=new THREE.BufferGeometry();
    for(const [key,array,size] of [['position',pos,3],['normal',norm,3],['uv',uv,2]])g.setAttribute(key,new THREE.Float32BufferAttribute(array,size));
    return g;
  }
  const treeMeshes=new Map();
  const treeMaterial=new THREE.MeshLambertMaterial({map:texture('tree-surfaces.jpg'),vertexColors:true});
  function tree(type,distant=false){
    const key=type+(distant?'-far':'');
    if(treeMeshes.has(key))return treeMeshes.get(key);
    const parts=[],colors=[],oak=type==='oak',snow=type==='snowpine';
    // Each species shares an indexed model across all its instances.
    function add(g,tile,tint){
      const uv=g.attributes.uv,p=g.attributes.position;
      for(let i=0;i<uv.count;i++){
        uv.setXY(i,(tile+.015+.97*uv.getX(i))/3,.015+.97*uv.getY(i));
        const light=(.83+.17*Math.max(0,p.getY(i)))*tint;
        colors.push(light,light,snow&&tile===1?light*1.18:light);
      }
      parts.push(g);
    }
    function branch(x,y,z,tx,ty,tz,base,tip){
      const axis=new THREE.Vector3(tx-x,ty-y,tz-z);
      const g=new THREE.CylinderGeometry(tip,base,axis.length(),distant?4:6,1,false);
      g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),axis.normalize())));
      g.translate((tx+x)/2,(ty+y)/2,(tz+z)/2);add(g,2,1);
    }
    branch(0,0,0,oak?.025:0,oak?.79:.96,0,oak?.038:.032,.009);
    if(oak){
      const count=distant?5:9;
      for(let i=0;i<count;i++){
        const a=i*2.4,level=i/(count-1),r=(1-level)*.25+.035;
        const x=Math.cos(a)*r,z=Math.sin(a)*r,y=.49+.34*level;
        if(!distant)branch(.013,.24+.28*level,0,x,y,z,.022-.008*level,.007);
        const g=new THREE.SphereGeometry(1,distant?5:8,distant?3:5);
        const p=g.attributes.position;
        for(let j=0;j<p.count;j++){
          const vx=p.getX(j),vy=p.getY(j),vz=p.getZ(j);
          const ripple=1+.10*Math.sin(vx*7+vz*4+i)*Math.cos(vy*8-vz*5);
          p.setXYZ(j,x+vx*.235*ripple,y+vy*(.17+.027*Math.sin(a))*ripple,z+vz*.23*ripple);
        }
        g.computeVertexNormals();add(g,0,.92+.07*Math.cos(a));
      }
    }else{
      const tiers=distant?5:8,segments=distant?10:18;
      for(let i=0;i<tiers;i++){
        const t=i/tiers,base=.16+.79*t,radius=.47*(1-.90*t);
        const g=new THREE.ConeGeometry(1,1,segments,2),p=g.attributes.position;
        for(let j=0;j<p.count;j++){
          const x=p.getX(j),z=p.getZ(j),h=p.getY(j)+.5;
          const a=Math.atan2(z,x),tooth=Math.cos(a*(segments/2));
          const spread=radius*(.80+.17*tooth+.05*Math.sin(3*a+i));
          p.setXYZ(j,x*spread,base+h*Math.min(.33,1-base)-.028*(1-h)*tooth,z*spread);
        }
        g.rotateY(i*1.63);g.computeVertexNormals();add(g,1,snow?1.33:1.10);
      }
    }
    const pos=[],normal=[],uv=[],indices=[];let offset=0;
    for(const g of parts){
      pos.push(...g.attributes.position.array);normal.push(...g.attributes.normal.array);
      uv.push(...g.attributes.uv.array);for(const i of g.index.array)indices.push(offset+i);
      offset+=g.attributes.position.count;g.dispose();
    }
    const geo=new THREE.BufferGeometry();
    for(const [name,array,size] of [['position',pos,3],['normal',normal,3],['uv',uv,2],['color',colors,3]])
      geo.setAttribute(name,new THREE.Float32BufferAttribute(array,size));
    geo.setIndex(indices);geo.computeBoundingSphere();
    const mesh=[geo,treeMaterial];treeMeshes.set(key,mesh);return mesh;
  }

  function terrain(mat){
    mat.onBeforeCompile=shader=>{
      for(const [k,file] of [['meadow','meadow.jpg'],['loam','earth.jpg'],['needles','forest-floor.jpg']])shader.uniforms[k]={value:texture(file)};
      shader.vertexShader='attribute vec2 habitat; varying vec2 landMix; varying vec2 landXZ;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nlandMix=habitat;landXZ=position.xz;');
      shader.fragmentShader='uniform sampler2D meadow,loam,needles; varying vec2 landMix; varying vec2 landXZ;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        vec3 grass=texture2D(meadow,landXZ*.11).rgb;
        vec3 leaf=texture2D(needles,landXZ*.29).rgb;
        vec3 soil=texture2D(loam,landXZ*.19).rgb;
        float field=mod(floor(landXZ.x/70.)+floor(landXZ.y/90.),2.);
        float row=smoothstep(.30,.73,abs(sin(landXZ.x*3.4+landXZ.y*.18)));
        vec3 farm=mix(soil*vec3(.91,.79,.61),grass*vec3(.91,.94,.7),mix(row, .20+.55*row,field));
        vec3 cover=mix(mix(grass,leaf,landMix.x),farm,landMix.y);
        float luma=dot(diffuseColor.rgb,vec3(.30,.52,.18));
        diffuseColor.rgb=mix(vec3(luma)*vec3(1.04,.96,.86),diffuseColor.rgb,.38);
        diffuseColor.rgb*=mix(vec3(.26),cover*.86,.91);`);
    };
  }
  function sky(scene){
    const t=loader.load(window.foundryPhotos?.['harbor-sky']||'./assets/foundry/harbor-sky.jpg');t.encoding=THREE.sRGBEncoding;
    const dome=new THREE.Mesh(new THREE.SphereGeometry(1700,44,22),new THREE.MeshBasicMaterial({map:t,side:THREE.BackSide,fog:false,depthWrite:false}));
    dome.rotation.y=.85;dome.renderOrder=-20;scene.add(dome);return dome;
  }
  function buildings(PK,PF){
    const glazing=surface(0x53626a,null,.22),trim=surface(0xd0c8b3),door=surface(0x4e4437,'boards.jpg'),metal=surface(0x777c78);
    for(const name of ['house1','house2','house3','farmhouse','barn','cabinForest','cabinSnow','lodge','apt','shop','tower','church','hutMud','adobeTall','domeHouse']){
      const k=PF.kinds[PK[name]],wall=k.parts[0], [w,h,d]=wall.scl;
      const rural=['barn','farmhouse','cabinForest','cabinSnow','lodge'].includes(name);
      wall.mat=surface(name==='barn'?0xbb6856:rural?0xb5afa5:0xabb3ac,rural?'boards.jpg':'siding.jpg');
      if(k.parts[1]?.geo.attributes.position.count===24||k.parts[1]?.geo.attributes.position.count===18){
        const roof=k.parts[1];if(!roof.geo.attributes.uv){
          const g=roof.geo.clone(),uv=[];const p=g.attributes.position;
          for(let i=0;i<p.count;i++)uv.push(p.getZ(i)*3,p.getY(i)*2+p.getX(i));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));roof.geo=g;
        }
        roof.mat=surface(name==='cabinSnow'?0xd4d6d2:0xb1a496,'tiles.jpg');roof.mat.side=THREE.DoubleSide;
      }
      const groups=new Map();
      const box=(m,x,y,z,w,h,d)=>{if(!groups.has(m))groups.set(m,[]);const g=new THREE.BoxGeometry(w,h,d);g.translate(x,y,z);groups.get(m).push(g);};
      const floors=Math.max(1,Math.floor(h/3.15)),cols=Math.max(2,Math.floor(w/2.3));
      for(let f=0;f<floors;f++)for(let i=0;i<cols;i++){
        const x=(i+.5)*w/cols-w/2,y=Math.min(h-.7,1.68+f*3.05),z=d/2;
        if(f===0&&i===Math.floor(cols/2))continue;
        for(const side of [-1,1]){
          box(trim,x,y,side*(z+.025),1.2,1.35,.13);box(glazing,x,y,side*(z+.11),.98,1.11,.07);
          box(trim,x,y,side*(z+.16),.045,1.12,.035);box(trim,x,y-.68,side*(z+.09),1.32,.08,.28);
        }
      }
      for(const side of [-1,1])for(let j=0;j<Math.max(2,Math.floor(d/2.5));j++){
        const z=-d/2+1.25+j*2.5;if(z>d/2-.7)continue;
        for(let f=0;f<floors;f++){box(trim,side*(w/2+.025),1.7+f*3.02,z,.14,1.4,1.15);box(glazing,side*(w/2+.105),1.7+f*3.02,z,.055,1.17,.93);}
      }
      if(rural || name.startsWith('house')){
        // Rain gutters, downpipes, and a covered front stoop add depth at driving height.
        for(const side of [-1,1]){box(metal,side*(w/2+.19),h-.03,0,.12,.11,d+.6);box(metal,side*(w/2+.16),h/2,d*.44,.09,h,.09);}
        if(name!=='barn'){
          box(door,0,2.66,d/2+.65,3.20,.18,1.35);
          for(const side of [-1,1])box(trim,side*1.39,1.30,d/2+1.17,.12,2.6,.12);
          box(metal,0,.10,d/2+.65,3.22,.20,1.43);
        }
      }
      const dw=name==='barn'?3:1.05;box(trim,0,1.12,d/2+.06,dw+.20,2.24,.14);box(door,0,1.03,d/2+.16,dw,2.06,.09);
      box(metal,0,2.34,d/2+.23,dw+.45,.13,.49);box(trim,0,.1,d/2+.28,dw+.38,.2,.53);
      for(const [mat,parts] of groups)k.parts.push({geo:combine(parts),mat,nearDetail:true,off:[0,0,0],scl:[1,1,1],mesh:null,cap:0});
      const apron=new THREE.BoxGeometry(w+2.6,.30,d+2.6);apron.translate(0,.04,0);
      k.parts.push({geo:apron,mat:trim,nearDetail:true,off:[0,0,0],scl:[1,1,1],mesh:null,cap:0});
    }
    const silo=PF.kinds[PK.silo],r=2.2,metalBand=surface(0x7c8079);const rings=[];
    for(let i=1;i<10;i++){const g=new THREE.TorusGeometry(r,.045,4,28);g.rotateX(Math.PI/2);g.translate(0,i,0);rings.push(g);}
    silo.parts.push({geo:combine(rings),mat:metalBand,off:[0,0,0],scl:[1,1,1],mesh:null,cap:0});
  }
  function downtown(scene){
    const batches=new Map(),mats=[surface(0x736f69),surface(0x4e575b),surface(0xb9b5a7),surface(0x30424c,null,.26)];
    function box(i,x,y,z,w,h,d){
      const key=[i,Math.floor(x/190),Math.floor(z/190)].join('/');
      if(!batches.has(key))batches.set(key,{i,parts:[]});
      const g=new THREE.BoxGeometry(w,h,d);g.translate(x,y,z);batches.get(key).parts.push(g);
    }
    return {detail(x,z,w,d,h,sx,sz){
      const front=z+sz*d*.5,edge=x+sx*w*.5;box(0,x,3.8,front+sz*.19,w,.23,.44);
      box(0,edge+sx*.19,3.8,z,.44,.23,d);
      for(let q=-1;q<=1;q++){box(1,x+q*w*.30,1.69,front+sz*.04,w*.23,2.65,.12);box(3,x+q*w*.30,1.71,front+sz*.125,w*.21,2.37,.07);}
      for(let q=-1;q<=1;q++)box(2,x+q*w*.30,1.68,front+sz*.17,.10,2.55,.12);
      for(let y=8;y<h-1;y+=8){box(0,x,y,front+sz*.17,w,.21,.37);box(0,edge+sx*.17,y,z,.37,.21,d);}
      for(const q of [-.47,.47]){box(2,x+q*w,h/2,front+sz*.10,.32,h,.24);box(2,edge+sx*.10,h/2,z+q*d,.24,h,.32);}
      if(h>24){box(1,x,h+.54,z,w*.47,1.1,d*.22);box(0,x,h+1.19,z,w*.48,.20,d*.23);}
    },finish(){for(const {i,parts} of batches.values()){const m=new THREE.Mesh(combine(parts),mats[i]);m.geometry.computeBoundingSphere();streetDetails.push(m);m.receiveShadow=true;scene.add(m);}batches.clear();}};
  }
  function groundUV(geo,scale){
    const p=geo.attributes.position,uv=new Float32Array(p.count*2);
    for(let i=0;i<p.count;i++){uv[2*i]=p.getX(i)*scale;uv[2*i+1]=p.getZ(i)*scale;}
    geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  }
  const streetDetails=[];
  function updateDetails(x,z,radius){
    for(const mesh of streetDetails){const b=mesh.geometry.boundingSphere;
      mesh.visible=(x-b.center.x)**2+(z-b.center.z)**2<(radius+b.radius)**2;}
  }
  return {tree,terrain,sky,buildings,downtown,surface,texture,groundUV,updateDetails};
})();
