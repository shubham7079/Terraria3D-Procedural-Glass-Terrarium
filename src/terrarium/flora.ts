import * as THREE from 'three';
import { SharedMaterials } from './materials.ts';
import { TerrariumConfig } from './types.ts';

export interface FloraEcosystem {
  group: THREE.Group;
  mushroomLights: THREE.PointLight[];
  update: (delta: number, time: number, config: TerrariumConfig) => void;
  waterPulse: (intensity: number) => void;
}

// Helper to generate a curved leaf mesh with thickness and curvature
function createCurvedLeafGeometry(width: number, length: number, curl: number): THREE.BufferGeometry {
  const geom = new THREE.PlaneGeometry(width, length, 4, 8);
  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const x = pos.getX(i);
    // Normalized 0 to 1 along length
    const t = (y + length / 2) / length;
    // Arch upward and curve down at tip
    const zOffset = Math.sin(t * Math.PI) * (length * 0.25) - Math.pow(t, 2) * curl;
    // Cup leaf along width
    const cup = (1 - (x / (width / 2)) ** 2) * (width * 0.2);
    pos.setZ(i, zOffset + cup);
  }
  geom.computeVertexNormals();
  return geom;
}

// 1. Procedural Miniature Boston Fern (Composite 3-12 parts)
function createFernGroup(materials: SharedMaterials): THREE.Group {
  const fern = new THREE.Group();
  fern.name = 'FernSpecies';
  fern.userData = { speciesId: 'ferns', name: 'Miniature Boston Fern' };

  // Central rhizome crown
  const crownGeo = new THREE.SphereGeometry(0.08, 8, 8);
  const crown = new THREE.Mesh(crownGeo, materials.driftwood);
  crown.position.y = 0.04;
  fern.add(crown);

  const frondCount = 7;
  for (let f = 0; f < frondCount; f++) {
    const frondGroup = new THREE.Group();
    const angle = (f / frondCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
    const frondLen = 0.9 + Math.random() * 0.4;
    const archAngle = 0.45 + Math.random() * 0.35;

    // Curved rachis stem
    const points: THREE.Vector3[] = [];
    const segments = 6;
    for (let s = 0; s <= segments; s++) {
      const t = s / segments;
      const x = Math.sin(archAngle * t) * frondLen * t;
      const y = Math.cos(archAngle * t) * frondLen * t;
      const z = Math.sin(t * 1.5) * 0.08;
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const stemGeo = new THREE.TubeGeometry(curve, 12, 0.015, 6, false);
    const stemMesh = new THREE.Mesh(stemGeo, materials.fernLeaf);
    stemMesh.castShadow = true;
    frondGroup.add(stemMesh);

    // Pinnae leaflets along frond
    const pinnaePairs = 6;
    for (let p = 1; p <= pinnaePairs; p++) {
      const t = p / (pinnaePairs + 1);
      const pt = curve.getPoint(t);
      const leafletLen = 0.16 * (1 - t * 0.45);
      const leafletW = 0.06 * (1 - t * 0.45);

      // Left leaflet
      const leafGeo = createCurvedLeafGeometry(leafletW, leafletLen, 0.02);
      const leafLeft = new THREE.Mesh(leafGeo, materials.fernLeaf);
      leafLeft.position.copy(pt);
      leafLeft.rotation.set(0.2, -0.6, 0.4);
      leafLeft.castShadow = true;
      frondGroup.add(leafLeft);

      // Right leaflet
      const leafRight = new THREE.Mesh(leafGeo, materials.fernLeaf);
      leafRight.position.copy(pt);
      leafRight.rotation.set(-0.2, 0.6, -0.4);
      leafRight.castShadow = true;
      frondGroup.add(leafRight);
    }

    frondGroup.rotation.y = angle;
    frondGroup.userData = { speciesId: 'ferns' };
    fern.add(frondGroup);
  }

  // 2 Baby coiled fiddleheads in center
  for (let fh = 0; fh < 2; fh++) {
    const fhPoints: THREE.Vector3[] = [];
    for (let a = 0; a < Math.PI * 3; a += 0.3) {
      const r = 0.04 * (1 - a / (Math.PI * 3.5));
      fhPoints.push(new THREE.Vector3(Math.cos(a) * r, 0.12 + (a / (Math.PI * 3)) * 0.1, Math.sin(a) * r));
    }
    const fhCurve = new THREE.CatmullRomCurve3(fhPoints);
    const fhGeo = new THREE.TubeGeometry(fhCurve, 16, 0.012, 6, false);
    const fhMesh = new THREE.Mesh(fhGeo, materials.fernLeaf);
    fhMesh.rotation.y = fh * 2.5;
    fern.add(fhMesh);
  }

  return fern;
}

// 2. Procedural Ghost Echeveria Succulent (Fibonacci rosette spiral)
function createSucculentGroup(materials: SharedMaterials): THREE.Group {
  const succulent = new THREE.Group();
  succulent.name = 'SucculentSpecies';
  succulent.userData = { speciesId: 'succulents', name: 'Ghost Echeveria' };

  // Fleshy rosette leaves arranged at the Golden Angle (137.5°)
  const goldenAngle = 2.39996; // radians
  const totalLeaves = 28;

  for (let i = 0; i < totalLeaves; i++) {
    const t = i / totalLeaves; // 0 (center) to 1 (outer)
    const angle = i * goldenAngle;
    const dist = 0.06 + Math.pow(t, 0.75) * 0.48;
    const leafScale = 0.08 + Math.pow(t, 0.65) * 0.22;
    const elevation = (1 - t) * 0.14;

    // Fleshy spoon-shaped succulent leaf
    const leafGeo = new THREE.ConeGeometry(leafScale * 0.45, leafScale, 5, 2);
    leafGeo.rotateX(Math.PI / 2);
    leafGeo.scale(1.3, 0.38, 1.0);

    const leafMesh = new THREE.Mesh(leafGeo, materials.succulentLeaf);
    leafMesh.position.set(Math.cos(angle) * dist, elevation, Math.sin(angle) * dist);

    // Aim outward and curl slightly upward
    leafMesh.rotation.y = -angle + Math.PI / 2;
    leafMesh.rotation.x = 0.35 + (1 - t) * 0.4;
    leafMesh.castShadow = true;
    leafMesh.receiveShadow = true;
    leafMesh.userData = { speciesId: 'succulents' };
    succulent.add(leafMesh);
  }

  // Small baby offset pup rosette on the side
  const pup = new THREE.Group();
  for (let p = 0; p < 12; p++) {
    const t = p / 12;
    const angle = p * goldenAngle;
    const dist = 0.03 + Math.pow(t, 0.8) * 0.15;
    const leafScale = 0.04 + t * 0.08;
    const leafGeo = new THREE.ConeGeometry(leafScale * 0.4, leafScale, 5);
    leafGeo.rotateX(Math.PI / 2);
    leafGeo.scale(1.2, 0.35, 1.0);
    const leafMesh = new THREE.Mesh(leafGeo, materials.succulentLeaf);
    leafMesh.position.set(Math.cos(angle) * dist, (1 - t) * 0.06, Math.sin(angle) * dist);
    leafMesh.rotation.y = -angle + Math.PI / 2;
    leafMesh.rotation.x = 0.4;
    pup.add(leafMesh);
  }
  pup.position.set(0.42, 0.02, 0.25);
  pup.userData = { speciesId: 'succulents' };
  succulent.add(pup);

  return succulent;
}

// 3. Procedural Tropical Fenestrated Monstera
function createMonsteraGroup(materials: SharedMaterials): THREE.Group {
  const monstera = new THREE.Group();
  monstera.name = 'MonsteraSpecies';
  monstera.userData = { speciesId: 'monstera', name: 'Mini Swiss Cheese Plant' };

  const leaves = [
    { scale: 0.85, rotY: 0.3, rotX: 0.25, stemLen: 0.9, x: 0, z: 0 },
    { scale: 1.1, rotY: 1.8, rotX: 0.35, stemLen: 1.25, x: 0.1, z: -0.1 },
    { scale: 0.95, rotY: 3.4, rotX: 0.28, stemLen: 1.05, x: -0.1, z: 0.1 },
    { scale: 0.7, rotY: 4.8, rotX: 0.4, stemLen: 0.8, x: 0.05, z: 0.15 },
  ];

  leaves.forEach((l) => {
    const leafGroup = new THREE.Group();

    // Petiole stem
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(l.x, 0, l.z),
      new THREE.Vector3(l.x + Math.sin(l.rotY) * 0.2, l.stemLen * 0.5, l.z + Math.cos(l.rotY) * 0.2),
      new THREE.Vector3(l.x + Math.sin(l.rotY) * 0.45, l.stemLen, l.z + Math.cos(l.rotY) * 0.45),
    ]);
    const stemGeo = new THREE.TubeGeometry(stemCurve, 10, 0.022, 6, false);
    const stemMesh = new THREE.Mesh(stemGeo, materials.monsteraLeaf);
    stemMesh.castShadow = true;
    leafGroup.add(stemMesh);

    // Fenestrated cordate leaf blade
    const leafW = 0.55 * l.scale;
    const leafH = 0.8 * l.scale;
    const leafGeo = createCurvedLeafGeometry(leafW, leafH, 0.08);

    const leafMesh = new THREE.Mesh(leafGeo, materials.monsteraLeaf);
    const tip = stemCurve.getPoint(1);
    leafMesh.position.copy(tip);
    leafMesh.rotation.y = l.rotY;
    leafMesh.rotation.x = l.rotX + 0.6;
    leafMesh.rotation.z = -0.15;
    leafMesh.castShadow = true;
    leafMesh.receiveShadow = true;
    leafGroup.add(leafMesh);

    leafGroup.userData = { speciesId: 'monstera' };
    monstera.add(leafGroup);
  });

  // Aerial root anchoring into soil
  const aerialCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.1, 0.6, -0.05),
    new THREE.Vector3(0.25, 0.3, 0.1),
    new THREE.Vector3(0.35, 0.02, 0.2),
  ]);
  const aerialGeo = new THREE.TubeGeometry(aerialCurve, 8, 0.015, 5, false);
  const aerialMesh = new THREE.Mesh(aerialGeo, materials.driftwood);
  monstera.add(aerialMesh);

  return monstera;
}

// 4. Procedural Bioluminescent Mycena Mushrooms
function createMushroomGroup(materials: SharedMaterials): { group: THREE.Group; lights: THREE.PointLight[] } {
  const group = new THREE.Group();
  group.name = 'MushroomSpecies';
  group.userData = { speciesId: 'mushrooms', name: 'Bioluminescent Ghost Fungus' };
  const lights: THREE.PointLight[] = [];

  const shrooms = [
    { x: 0, z: 0, h: 0.65, capR: 0.26, lean: 0.2 },
    { x: 0.22, z: 0.12, h: 0.85, capR: 0.32, lean: -0.15 },
    { x: -0.18, z: 0.16, h: 0.5, capR: 0.22, lean: 0.3 },
    { x: 0.15, z: -0.18, h: 0.38, capR: 0.17, lean: -0.2 },
  ];

  shrooms.forEach((s) => {
    const single = new THREE.Group();

    // Curved stipe (stalk)
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(s.lean * 0.15, s.h * 0.5, 0),
      new THREE.Vector3(s.lean * 0.35, s.h, 0),
    ]);
    const stipeGeo = new THREE.TubeGeometry(stemCurve, 10, 0.025, 8, false);
    const stipeMesh = new THREE.Mesh(stipeGeo, materials.mushroomStipe);
    stipeMesh.castShadow = true;
    single.add(stipeMesh);

    // Annulus collar
    const collarGeo = new THREE.TorusGeometry(0.04, 0.012, 8, 16);
    const collarMesh = new THREE.Mesh(collarGeo, materials.mushroomStipe);
    collarMesh.position.set(s.lean * 0.22, s.h * 0.65, 0);
    collarMesh.rotation.x = Math.PI / 2;
    single.add(collarMesh);

    // Parasol bell cap (LatheGeometry with radial profile)
    const capPoints: THREE.Vector2[] = [];
    capPoints.push(new THREE.Vector2(0, 0.22));
    capPoints.push(new THREE.Vector2(s.capR * 0.4, 0.2));
    capPoints.push(new THREE.Vector2(s.capR * 0.8, 0.12));
    capPoints.push(new THREE.Vector2(s.capR, 0));
    capPoints.push(new THREE.Vector2(s.capR * 0.95, -0.04));
    capPoints.push(new THREE.Vector2(0.02, 0.02)); // underside gills hollow

    const capGeo = new THREE.LatheGeometry(capPoints, 24);
    const capMesh = new THREE.Mesh(capGeo, materials.mushroomCap);
    capMesh.position.set(s.lean * 0.35, s.h, 0);
    capMesh.castShadow = true;
    capMesh.receiveShadow = true;
    single.add(capMesh);

    // Glow point light inside the cap that illuminates the forest floor
    const light = new THREE.PointLight(0x34d399, 0.6, 2.5);
    light.position.set(s.lean * 0.35, s.h - 0.04, 0);
    single.add(light);
    lights.push(light);

    single.position.set(s.x, 0, s.z);
    single.userData = { speciesId: 'mushrooms' };
    group.add(single);
  });

  return { group, lights };
}

// 5. Procedural Gnarled Driftwood & River Stones
function createDriftwoodAndStones(materials: SharedMaterials): THREE.Group {
  const group = new THREE.Group();
  group.name = 'DriftwoodStones';

  // Twisted main branch
  const branchCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.9, 0.05, -0.4),
    new THREE.Vector3(-0.4, 0.28, -0.2),
    new THREE.Vector3(0.1, 0.42, -0.15),
    new THREE.Vector3(0.65, 0.18, 0.1),
    new THREE.Vector3(1.1, 0.04, 0.3),
  ]);
  const branchGeo = new THREE.TubeGeometry(branchCurve, 16, 0.07, 8, false);
  const branchMesh = new THREE.Mesh(branchGeo, materials.driftwood);
  branchMesh.castShadow = true;
  branchMesh.receiveShadow = true;
  group.add(branchMesh);

  // Sub-branch
  const subCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.05, 0.38, -0.15),
    new THREE.Vector3(0.2, 0.58, -0.45),
    new THREE.Vector3(0.35, 0.72, -0.6),
  ]);
  const subGeo = new THREE.TubeGeometry(subCurve, 10, 0.035, 6, false);
  const subMesh = new THREE.Mesh(subGeo, materials.driftwood);
  subMesh.castShadow = true;
  group.add(subMesh);

  // Smooth River Stones
  const stones = [
    { x: -0.85, z: -0.25, rx: 0.18, ry: 0.12, rz: 0.14 },
    { x: -0.65, z: 0.1, rx: 0.22, ry: 0.14, rz: 0.18 },
    { x: 0.75, z: 0.45, rx: 0.25, ry: 0.15, rz: 0.2 },
    { x: 0.95, z: 0.2, rx: 0.16, ry: 0.1, rz: 0.12 },
    { x: -0.15, z: -0.65, rx: 0.28, ry: 0.18, rz: 0.24 },
  ];

  stones.forEach((s) => {
    const pebbleGeo = new THREE.DodecahedronGeometry(1, 2);
    pebbleGeo.scale(s.rx, s.ry, s.rz);
    const pebbleMesh = new THREE.Mesh(pebbleGeo, materials.pebble);
    pebbleMesh.position.set(s.x, s.ry * 0.7, s.z);
    pebbleMesh.rotation.set(Math.random(), Math.random(), Math.random());
    pebbleMesh.castShadow = true;
    pebbleMesh.receiveShadow = true;
    group.add(pebbleMesh);
  });

  return group;
}

// 6. Procedural Amethyst & Quartz Crystal Cluster
function createCrystalCluster(materials: SharedMaterials): THREE.Group {
  const cluster = new THREE.Group();
  cluster.name = 'CrystalSpecies';
  cluster.userData = { speciesId: 'crystals', name: 'Raw Amethyst & Quartz Geode' };

  // Hexagonal crystal prisms with pyramid terminations
  const crystals = [
    { h: 0.75, r: 0.12, x: 0, z: 0, rx: 0.05, rz: 0.08 },
    { h: 0.55, r: 0.09, x: 0.12, z: 0.08, rx: 0.25, rz: -0.2 },
    { h: 0.48, r: 0.08, x: -0.1, z: 0.09, rx: -0.18, rz: 0.3 },
    { h: 0.38, r: 0.07, x: 0.05, z: -0.12, rx: 0.15, rz: 0.22 },
    { h: 0.32, r: 0.06, x: -0.09, z: -0.08, rx: -0.3, rz: -0.15 },
  ];

  crystals.forEach((c) => {
    const single = new THREE.Group();

    // Prism column (6-sided)
    const prismGeo = new THREE.CylinderGeometry(c.r, c.r, c.h * 0.75, 6);
    const prismMesh = new THREE.Mesh(prismGeo, materials.crystal);
    prismMesh.position.y = (c.h * 0.75) / 2;
    prismMesh.castShadow = true;
    single.add(prismMesh);

    // Pyramidal point termination
    const pointGeo = new THREE.ConeGeometry(c.r, c.h * 0.25, 6);
    const pointMesh = new THREE.Mesh(pointGeo, materials.crystal);
    pointMesh.position.y = c.h * 0.75 + (c.h * 0.25) / 2;
    pointMesh.castShadow = true;
    single.add(pointMesh);

    single.position.set(c.x, 0, c.z);
    single.rotation.set(c.rx, 0, c.rz);
    single.userData = { speciesId: 'crystals' };
    cluster.add(single);
  });

  return cluster;
}

// 7. Velvet Cushion Moss using InstancedMesh
function createCushionMoss(materials: SharedMaterials, soilRadius: number): THREE.InstancedMesh {
  const count = 120;
  // Hemispherical cushion geometry
  const moundGeo = new THREE.SphereGeometry(0.12, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  const moundMat = new THREE.MeshStandardMaterial({
    color: 0x4ade80,
    roughness: 0.9,
    metalness: 0.02,
  });

  const instancedMesh = new THREE.InstancedMesh(moundGeo, moundMat, count);
  instancedMesh.name = 'MossSpecies';
  instancedMesh.userData = { speciesId: 'moss', name: 'Velvet Cushion Moss' };
  instancedMesh.castShadow = true;
  instancedMesh.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const baseColor = new THREE.Color(0x38a169);
  const colorVariation = new THREE.Color();

  for (let i = 0; i < count; i++) {
    // Distribute randomly across disc
    const r = Math.sqrt(Math.random()) * (soilRadius * 0.88);
    const theta = Math.random() * Math.PI * 2;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    // Height offset with slight mound elevation
    const y = 0.01;
    const scaleY = 0.5 + Math.random() * 0.8;
    const scaleXZ = 0.7 + Math.random() * 0.9;

    dummy.position.set(x, y, z);
    dummy.scale.set(scaleXZ, scaleY, scaleXZ);
    dummy.rotation.y = Math.random() * Math.PI * 2;
    dummy.updateMatrix();

    instancedMesh.setMatrixAt(i, dummy.matrix);

    // Subtle natural moss tint variation (deep emerald, moss green, olive chartreuse)
    const tintOffset = (Math.random() - 0.5) * 0.16;
    colorVariation.copy(baseColor);
    colorVariation.offsetHSL(tintOffset * 0.5, 0.05, tintOffset);
    instancedMesh.setColorAt(i, colorVariation);
  }

  instancedMesh.instanceMatrix.needsUpdate = true;
  if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;
  instancedMesh.computeBoundingSphere();

  return instancedMesh;
}

export function buildFloraEcosystem(
  materials: SharedMaterials,
  soilY: number,
  soilRadius: number
): FloraEcosystem {
  const root = new THREE.Group();
  root.name = 'FloraEcosystemRoot';
  root.position.y = soilY;

  // 1. Driftwood and stones foundation
  const driftwoodGroup = createDriftwoodAndStones(materials);
  root.add(driftwoodGroup);

  // 2. Velvet Cushion Moss carpet
  const moss = createCushionMoss(materials, soilRadius);
  root.add(moss);

  // 3. Fern (positioned left-back)
  const fern = createFernGroup(materials);
  fern.position.set(-0.75, 0, -0.6);
  fern.scale.setScalar(1.2);
  root.add(fern);

  // 4. Ghost Echeveria Succulent (positioned front-right)
  const succulent = createSucculentGroup(materials);
  succulent.position.set(0.7, 0, 0.45);
  succulent.scale.setScalar(1.15);
  root.add(succulent);

  // 5. Tropical Monstera (positioned rear-center climbing)
  const monstera = createMonsteraGroup(materials);
  monstera.position.set(0.1, 0, -0.7);
  monstera.scale.setScalar(1.1);
  root.add(monstera);

  // 6. Bioluminescent Mushrooms (tucked under the driftwood arch)
  const mushroomData = createMushroomGroup(materials);
  mushroomData.group.position.set(-0.35, 0, 0.25);
  mushroomData.group.scale.setScalar(1.05);
  root.add(mushroomData.group);

  // 7. Amethyst Crystals (nestled among moss and stones)
  const crystals = createCrystalCluster(materials);
  crystals.position.set(0.55, 0, -0.4);
  crystals.scale.setScalar(0.9);
  root.add(crystals);

  // Water spring physics variables
  let hydrationEffect = 0;

  const waterPulse = (intensity: number) => {
    hydrationEffect = Math.min(1, hydrationEffect + intensity);
  };

  const update = (delta: number, time: number, config: TerrariumConfig) => {
    // Visibility toggles
    fern.visible = config.showFerns;
    succulent.visible = config.showSucculents;
    monstera.visible = config.showMonstera;
    mushroomData.group.visible = config.showMushrooms;
    moss.visible = config.showMoss;
    crystals.visible = config.showCrystals;

    // Decay hydration spring effect slowly
    hydrationEffect = THREE.MathUtils.damp(hydrationEffect, 0, 0.5, delta);

    // Natural gentle wind sway (procedural breathing motion)
    const windSpeed = config.weather === 'storm' ? 3.5 : 1.2;
    const windStrength = config.weather === 'storm' ? 0.08 : 0.02;

    // Fern fronds gentle sway
    if (fern.visible) {
      fern.children.forEach((child, idx) => {
        if (child instanceof THREE.Group) {
          const sway = Math.sin(time * windSpeed + idx * 0.8) * windStrength;
          child.rotation.z = sway;
          // Water perk-up response
          child.rotation.x = -hydrationEffect * 0.08;
        }
      });
    }

    // Monstera leaves breathing sway
    if (monstera.visible) {
      monstera.children.forEach((child, idx) => {
        if (child instanceof THREE.Group) {
          const sway = Math.cos(time * windSpeed * 0.8 + idx) * (windStrength * 0.6);
          child.rotation.x = sway;
        }
      });
    }

    // Mushroom bioluminescence: glows intensely at night or when bioluminescence slider is adjusted
    const isNight = config.timeOfDay < 5.5 || config.timeOfDay > 19.5;
    const nightMultiplier = isNight ? 1.0 : Math.max(0.05, 1 - Math.abs(config.timeOfDay - 12) / 6);
    const targetGlow = config.bioluminescence * nightMultiplier;

    materials.mushroomCap.emissiveIntensity = THREE.MathUtils.damp(
      materials.mushroomCap.emissiveIntensity,
      targetGlow * 2.2,
      2.0,
      delta
    );

    mushroomData.lights.forEach((light) => {
      light.intensity = THREE.MathUtils.damp(
        light.intensity,
        targetGlow * 1.5,
        2.0,
        delta
      );
    });
  };

  return {
    group: root,
    mushroomLights: mushroomData.lights,
    update,
    waterPulse
  };
}
