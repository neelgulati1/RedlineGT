/* Two instanced exterior meshes per vehicle type share geometry across the traffic stream. */
window.createRoadFleet = function (scene, definitions, capacity) {
  const root = new THREE.Group(), batches = [], tint = new THREE.Color();
  scene.add(root);
  const closeCars=new WeakMap(),active=new Set();
  function closeVehicle(car,matrix,paint,dt){
    let visual=closeCars.get(car);
    if(!visual){
      const group=new THREE.Group(),wheels=[];
      visual={group,wheels,rotation:0};closeCars.set(car,visual);
      RedlineFleet.attach(car.def,group,wheels,paint);
    }
    if(!visual.group.userData.fleetModel)return false;
    if(!active.has(visual)){root.add(visual.group);active.add(visual);}
    visual.used=true;
    visual.group.matrixAutoUpdate=false;visual.group.matrix.copy(matrix);visual.group.matrixWorldNeedsUpdate=true;
    visual.rotation+=(car.vfwd||0)*dt/.36;
    for(const w of visual.wheels){w.spin.rotation.x=visual.rotation;if(w.front)w.pivot.rotation.y=(car.steer||0)*.42;}
    return true;
  }
  const painted = new THREE.MeshStandardMaterial({side:THREE.DoubleSide,roughness:.32,metalness:.38});
  const details = new THREE.MeshStandardMaterial({side:THREE.DoubleSide,vertexColors:true,roughness:.48,metalness:.18});
  function array(encoded, Type) {
    return new Type(Uint8Array.from(atob(encoded), c=>c.charCodeAt(0)).buffer);
  }
  async function load() {
    const source = window.RedlineTrafficAssets ? await window.unpackFleet(window.RedlineTrafficAssets) : await fetch('./assets/traffic/models.json').then(r=>{
      if(!r.ok) throw Error('Traffic model download failed');
      return r.json();
    });
    definitions.forEach((def,i)=>{
      const parts=source[def.model].map((part,k)=>{
        const geo=new THREE.BufferGeometry();
        geo.setAttribute('position',new THREE.BufferAttribute(Float32Array.from(array(part.p,Int16Array),v=>v*def.len/16384),3));
        geo.setAttribute('color',new THREE.BufferAttribute(array(part.c,Uint8Array),3,true));
        geo.setIndex(new THREE.BufferAttribute(array(part.i,part.wide?Uint32Array:Uint16Array),1));
        geo.computeVertexNormals();
        const mesh=new THREE.InstancedMesh(geo,k?details:painted,capacity);
        for(let n=0;n<capacity;n++)mesh.setColorAt(n,new THREE.Color(0xffffff));
        mesh.frustumCulled=false;mesh.count=0;root.add(mesh);
        return mesh;
      });
      batches[i]=parts;
    });
  }
  load().catch(e=>console.warn('Using distant traffic shapes',e));
  return {root,closeVehicle,begin(){for(const v of active)v.used=false;for(const parts of batches)for(const m of parts)m.count=0;},
    add(index,matrix,color){
      const parts=batches[index];
      if(!parts || parts[0].count>=capacity)return false;
      parts[0].setColorAt(parts[0].count,tint.setHex(color));
      for(const m of parts)m.setMatrixAt(m.count++,matrix);
      return true;
    },
    end(){for(const v of active)if(!v.used){root.remove(v.group);active.delete(v);}for(const parts of batches)for(const m of parts){if(!m.count)continue;m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;}}
  };
};
