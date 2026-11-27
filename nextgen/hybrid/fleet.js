/* The fleet register and source licenses are in ASSET_LICENSES.md. */
window.RedlineFleet = (() => {
  const cache = new Map();
  const materials = new Map();
  function unpack(value, Type) {
    const bytes = Uint8Array.from(atob(value), ch => ch.charCodeAt(0));
    return new Type(bytes.buffer);
  }
  function geometry(batch) {
    const g = new THREE.BufferGeometry();
    const positions = Float32Array.from(unpack(batch.p, Int16Array), x => x / 4096);
    const colors = Float32Array.from(unpack(batch.c, Uint8Array), x => (x / 255) ** 2);
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(unpack(batch.n, Int8Array), 3, true));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    if (batch.uv) g.setAttribute('uv', new THREE.BufferAttribute(unpack(batch.uv, Float32Array), 2));
    g.setIndex(new THREE.BufferAttribute(unpack(batch.i, Uint16Array), 1));
    return { kind: batch.kind, geometry: g };
  }
  function material(role, paint, asset, slug) {
    const [kind, textureId] = role.split('@');
    const key = textureId === undefined ? role : slug + '/' + role;
    if (kind === 'paint') { paint.side=THREE.DoubleSide; return paint; }
    if (materials.has(key)) return materials.get(key);
    const options = { side: THREE.DoubleSide, vertexColors: true, roughness: .64, metalness: .08 };
    if (kind === 'metal') Object.assign(options, { metalness: .68, roughness: .26 });
    if (kind === 'glass') Object.assign(options, { transparent: true, opacity: .66, depthWrite: false, roughness: .09, metalness: .25, side: THREE.DoubleSide });
    if (kind === 'lamp' || kind === 'redlamp') options.emissive = kind === 'lamp' ? 0x60635e : 0x820705;
    if (kind === 'lens' || kind === 'lensred') Object.assign(options, { transparent: true, opacity: kind === 'lens' ? .16 : .62, roughness: .04, metalness: 0, depthWrite: false });
    if (textureId !== undefined) {
      const spec = asset.maps[textureId];
      const map = new THREE.TextureLoader().load(spec.url);
      map.flipY = false;
      map.encoding = THREE.sRGBEncoding;
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      Object.assign(options, { map, roughness: spec.rough, metalness: spec.metal });
      if (spec.mask) Object.assign(options, { alphaTest: .5, side: THREE.DoubleSide });
    }
    const m = new THREE.MeshStandardMaterial(options);
    materials.set(key, m);
    return m;
  }
  async function load(slug) {
    let asset = window.RedlineFleetAssets && window.RedlineFleetAssets[slug];
    if (typeof asset === "string") asset = await window.unpackFleet(asset);
    if (!asset) {
      const res = await fetch('./assets/fleet/' + slug + '.json');
      if (!res.ok) throw Error('Vehicle download failed: ' + res.status);
      asset = await res.json();
    }
    return { maps: asset.maps, nodes: asset.nodes, roots: asset.roots, meshes: asset.meshes.map(parts => parts.map(geometry)) };
  }
  async function attach(def, parent, wheels, paint) {
    const slug = def.model;
    if (!cache.has(slug)) cache.set(slug, load(slug).catch(error => { cache.delete(slug); throw error; }));
    try {
      const asset = await cache.get(slug);
      function part(i) {
        const node = asset.nodes[i], pivot = new THREE.Group();
        pivot.name = node.name;
        if (node.translation) pivot.position.fromArray(node.translation);
        const body = new THREE.Group();
        if (/^Wheel_/.test(node.name)) {
          const spin = new THREE.Group();
          pivot.add(spin); spin.add(body);
          wheels.push({ pivot, spin, front: /^Wheel_(F|1_)/.test(node.name) });
        } else pivot.add(body);
        if (node.rotation) body.quaternion.fromArray(node.rotation);
        if (node.scale) body.scale.fromArray(node.scale);
        for (const batch of asset.meshes[node.mesh] || []) {
          const mesh = new THREE.Mesh(batch.geometry, material(batch.kind, paint, asset, slug));
          mesh.castShadow = batch.kind !== 'glass'; mesh.receiveShadow = true;
          body.add(mesh);
        }
        for (const child of node.children || []) body.add(part(child));
        return pivot;
      }
      const model = new THREE.Group();
      for (const root of asset.roots) model.add(part(root));
      const bounds = new THREE.Box3().setFromObject(model);
      const scale = def.len / (bounds.max.z - bounds.min.z);
      model.scale.setScalar(scale);
      model.position.set(-(bounds.max.x + bounds.min.x) / 2, -bounds.min.y, -(bounds.max.z + bounds.min.z) / 2).multiplyScalar(scale);
      parent.add(model);
      parent.userData.fleetModel = slug;
      window.dispatchEvent(new CustomEvent('fleetloaded', { detail: slug }));
    } catch (error) {
      console.error('Vehicle unavailable', slug, error);
      const status = document.getElementById('fleetError');
      if (status) status.textContent = 'Could not load this vehicle. Re-select it to retry.';
    }
  }
  return { attach };
})();
