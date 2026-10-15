import * as THREE from 'three';
import { SharedMaterials } from './materials.ts';
import { VesselType } from './types.ts';

export interface VesselBundle {
  group: THREE.Group;
  lidGroup: THREE.Group;
  soilSurfaceMesh: THREE.Mesh;
  condensationMesh: THREE.Mesh | null;
  baseRadius: number;
  soilHeight: number;
  updateLid: (progress: number) => void;
  updateCondensation: (opacity: number) => void;
  updateTint: (tint: 'clear' | 'emerald' | 'amber' | 'smoke') => void;
}

export function createTerrariumVessel(
  vesselType: VesselType,
  materials: SharedMaterials
): VesselBundle {
  const root = new THREE.Group();
  root.name = 'TerrariumVesselRoot';

  // Contact shadow disc at y = 0
  const shadowGeo = new THREE.PlaneGeometry(8, 8);
  const shadowMesh = new THREE.Mesh(shadowGeo, materials.contactShadow);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.01;
  root.add(shadowMesh);

  let lidGroup = new THREE.Group();
  let soilSurfaceMesh: THREE.Mesh;
  let condensationMesh: THREE.Mesh | null = null;
  let baseRadius = 2.4;
  let soilHeight = 0.8;

  // Clone glass material so tint adjustments don't affect other components
  const glassMat = materials.glassCloche.clone();
  const condensationMat = materials.condensationMaterial.clone();

  const updateTint = (tint: 'clear' | 'emerald' | 'amber' | 'smoke') => {
    switch (tint) {
      case 'clear':
        glassMat.color.set(0xffffff);
        glassMat.attenuationColor.set(0xf0fbf6);
        break;
      case 'emerald':
        glassMat.color.set(0xecfdf5);
        glassMat.attenuationColor.set(0x059669);
        break;
      case 'amber':
        glassMat.color.set(0xfffbeb);
        glassMat.attenuationColor.set(0xd97706);
        break;
      case 'smoke':
        glassMat.color.set(0xd1d5db);
        glassMat.attenuationColor.set(0x374151);
        break;
    }
  };

  const updateCondensation = (opacity: number) => {
    condensationMat.opacity = opacity * 0.75;
    if (condensationMesh) {
      condensationMesh.visible = opacity > 0.01;
    }
  };

  if (vesselType === 'bell_jar') {
    // -------------------------------------------------------------
    // CLASSIC BELL JAR (CLOCHE)
    // -------------------------------------------------------------
    baseRadius = 2.3;
    soilHeight = 0.9;

    // 1. Turned Walnut Plinth Base (LatheGeometry with rich profile)
    const basePoints: THREE.Vector2[] = [];
    basePoints.push(new THREE.Vector2(0, 0));
    basePoints.push(new THREE.Vector2(2.7, 0));
    basePoints.push(new THREE.Vector2(2.7, 0.12));
    basePoints.push(new THREE.Vector2(2.55, 0.22));
    basePoints.push(new THREE.Vector2(2.55, 0.35));
    basePoints.push(new THREE.Vector2(2.4, 0.45));
    basePoints.push(new THREE.Vector2(2.35, 0.5));
    basePoints.push(new THREE.Vector2(2.2, 0.5));
    basePoints.push(new THREE.Vector2(0, 0.5));

    const baseGeo = new THREE.LatheGeometry(basePoints, 48);
    const baseMesh = new THREE.Mesh(baseGeo, materials.darkWoodPlinth);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    root.add(baseMesh);

    // 2. Brass rim accent bezel ring
    const brassRingGeo = new THREE.TorusGeometry(2.36, 0.05, 16, 48);
    const brassRing = new THREE.Mesh(brassRingGeo, materials.brassFrame);
    brassRing.rotation.x = Math.PI / 2;
    brassRing.position.y = 0.5;
    brassRing.castShadow = true;
    root.add(brassRing);

    // 3. Soil container & strata layers
    const strataGeo = new THREE.CylinderGeometry(2.18, 2.18, 0.65, 48, 1, true);
    const strataMesh = new THREE.Mesh(strataGeo, materials.soilStrata);
    strataMesh.position.y = 0.5 + 0.65 / 2;
    strataMesh.castShadow = true;
    root.add(strataMesh);

    // Top soil surface with subtle micro-relief
    const soilTopGeo = new THREE.CircleGeometry(2.18, 48);
    soilSurfaceMesh = new THREE.Mesh(soilTopGeo, materials.soilSurface);
    soilSurfaceMesh.rotation.x = -Math.PI / 2;
    soilSurfaceMesh.position.y = 0.5 + 0.65;
    soilSurfaceMesh.receiveShadow = true;
    root.add(soilSurfaceMesh);

    // 4. Glass Bell Cloche Lid (LatheGeometry with dome & finial)
    lidGroup = new THREE.Group();
    lidGroup.name = 'BellJarLid';

    const clochePoints: THREE.Vector2[] = [];
    clochePoints.push(new THREE.Vector2(2.25, 0)); // Bottom rim
    clochePoints.push(new THREE.Vector2(2.25, 2.8)); // Main cylinder
    // Dome curve
    for (let a = 0; a <= Math.PI / 2; a += Math.PI / 16) {
      const r = 2.25 * Math.cos(a);
      const y = 2.8 + 1.2 * Math.sin(a);
      clochePoints.push(new THREE.Vector2(Math.max(0.01, r), y));
    }
    const clocheGeo = new THREE.LatheGeometry(clochePoints, 48);
    const clocheMesh = new THREE.Mesh(clocheGeo, glassMat);
    clocheMesh.castShadow = true;
    clocheMesh.renderOrder = 20;
    lidGroup.add(clocheMesh);

    // Inner condensation layer slightly offset inwards
    const condPoints: THREE.Vector2[] = [];
    for (let i = 0; i < clochePoints.length; i++) {
      condPoints.push(new THREE.Vector2(Math.max(0.01, clochePoints[i].x - 0.04), clochePoints[i].y));
    }
    const condGeo = new THREE.LatheGeometry(condPoints, 48);
    condensationMesh = new THREE.Mesh(condGeo, condensationMat);
    condensationMesh.renderOrder = 21;
    lidGroup.add(condensationMesh);

    // Turned brass finial handle at top
    const finialPoints: THREE.Vector2[] = [];
    finialPoints.push(new THREE.Vector2(0, 4.0));
    finialPoints.push(new THREE.Vector2(0.25, 4.0));
    finialPoints.push(new THREE.Vector2(0.12, 4.2));
    finialPoints.push(new THREE.Vector2(0.3, 4.4));
    finialPoints.push(new THREE.Vector2(0.25, 4.6));
    finialPoints.push(new THREE.Vector2(0.05, 4.75));
    finialPoints.push(new THREE.Vector2(0, 4.8));

    const finialGeo = new THREE.LatheGeometry(finialPoints, 24);
    const finialMesh = new THREE.Mesh(finialGeo, materials.brassFrame);
    finialMesh.castShadow = true;
    lidGroup.add(finialMesh);

    lidGroup.position.y = 0.5;
    root.add(lidGroup);

  } else if (vesselType === 'wardian_case') {
    // -------------------------------------------------------------
    // VICTORIAN WARDIAN CASE (GREENHOUSE ARCHITECTURE)
    // -------------------------------------------------------------
    baseRadius = 2.2;
    soilHeight = 0.85;

    // 1. Ornate Timber base box
    const baseW = 4.0;
    const baseD = 3.2;
    const baseH = 0.5;
    const timberGeo = new THREE.BoxGeometry(baseW, baseH, baseD);
    const timberMesh = new THREE.Mesh(timberGeo, materials.darkWoodPlinth);
    timberMesh.position.y = baseH / 2 + 0.15;
    timberMesh.castShadow = true;
    timberMesh.receiveShadow = true;
    root.add(timberMesh);

    // 4 Brass paw/lion feet
    const feetPositions = [
      [-baseW / 2 + 0.25, -baseD / 2 + 0.25],
      [baseW / 2 - 0.25, -baseD / 2 + 0.25],
      [-baseW / 2 + 0.25, baseD / 2 - 0.25],
      [baseW / 2 - 0.25, baseD / 2 - 0.25],
    ];
    feetPositions.forEach(([fx, fz]) => {
      const footGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.2, 12);
      const footMesh = new THREE.Mesh(footGeo, materials.brassFrame);
      footMesh.position.set(fx, 0.1, fz);
      footMesh.castShadow = true;
      root.add(footMesh);
    });

    // Copper perimeter molding around base
    const trimGeo = new THREE.BoxGeometry(baseW + 0.08, 0.08, baseD + 0.08);
    const trimMesh = new THREE.Mesh(trimGeo, materials.copperTrim);
    trimMesh.position.y = baseH + 0.15;
    root.add(trimMesh);

    // Soil block inside case
    const soilBoxGeo = new THREE.BoxGeometry(baseW - 0.25, 0.45, baseD - 0.25);
    const soilSidesMesh = new THREE.Mesh(soilBoxGeo, materials.soilStrata);
    soilSidesMesh.position.y = baseH + 0.15 + 0.45 / 2;
    root.add(soilSidesMesh);

    const soilTopGeo = new THREE.PlaneGeometry(baseW - 0.25, baseD - 0.25);
    soilSurfaceMesh = new THREE.Mesh(soilTopGeo, materials.soilSurface);
    soilSurfaceMesh.rotation.x = -Math.PI / 2;
    soilSurfaceMesh.position.y = baseH + 0.15 + 0.45;
    soilSurfaceMesh.receiveShadow = true;
    root.add(soilSurfaceMesh);

    // Wardian Greenhouse Lid (Pitched Roof + Glass Walls + Soldered Mullions)
    lidGroup = new THREE.Group();
    lidGroup.name = 'WardianLid';

    const wallH = 2.0;
    const roofH = 1.2;
    const bodyW = baseW - 0.1;
    const bodyD = baseD - 0.1;

    // Glass walls
    const glassWallsGeo = new THREE.BoxGeometry(bodyW, wallH, bodyD);
    const glassWallsMesh = new THREE.Mesh(glassWallsGeo, glassMat);
    glassWallsMesh.position.y = wallH / 2;
    glassWallsMesh.renderOrder = 20;
    lidGroup.add(glassWallsMesh);

    // Inner condensation for wardian case
    const condGeo = new THREE.BoxGeometry(bodyW - 0.06, wallH - 0.06, bodyD - 0.06);
    condensationMesh = new THREE.Mesh(condGeo, condensationMat);
    condensationMesh.position.y = wallH / 2;
    condensationMesh.renderOrder = 21;
    lidGroup.add(condensationMesh);

    // Soldered copper frame uprights (4 corners + 4 middle mullions)
    const mullionRadius = 0.035;
    const cornerPosts = [
      [-bodyW / 2, -bodyD / 2],
      [bodyW / 2, -bodyD / 2],
      [-bodyW / 2, bodyD / 2],
      [bodyW / 2, bodyD / 2],
      [0, -bodyD / 2],
      [0, bodyD / 2],
      [-bodyW / 2, 0],
      [bodyW / 2, 0],
    ];
    cornerPosts.forEach(([mx, mz]) => {
      const postGeo = new THREE.CylinderGeometry(mullionRadius, mullionRadius, wallH, 8);
      const postMesh = new THREE.Mesh(postGeo, materials.copperTrim);
      postMesh.position.set(mx, wallH / 2, mz);
      postMesh.castShadow = true;
      lidGroup.add(postMesh);
    });

    // Pitched Gable Glass Roof Structure
    // Left roof panel
    const roofPanelLen = Math.hypot(bodyD / 2, roofH);
    const roofAngle = Math.atan2(roofH, bodyD / 2);
    const roofGeo = new THREE.PlaneGeometry(bodyW, roofPanelLen);

    const roofMeshFront = new THREE.Mesh(roofGeo, glassMat);
    roofMeshFront.position.set(0, wallH + roofH / 2, bodyD / 4);
    roofMeshFront.rotation.x = -roofAngle;
    roofMeshFront.renderOrder = 20;
    lidGroup.add(roofMeshFront);

    const roofMeshBack = new THREE.Mesh(roofGeo, glassMat);
    roofMeshBack.position.set(0, wallH + roofH / 2, -bodyD / 4);
    roofMeshBack.rotation.x = roofAngle;
    roofMeshBack.renderOrder = 20;
    lidGroup.add(roofMeshBack);

    // Brass ridge finial along top of pitched roof
    const ridgeGeo = new THREE.CylinderGeometry(0.04, 0.04, bodyW + 0.1, 12);
    const ridgeMesh = new THREE.Mesh(ridgeGeo, materials.brassFrame);
    ridgeMesh.rotation.z = Math.PI / 2;
    ridgeMesh.position.set(0, wallH + roofH, 0);
    ridgeMesh.castShadow = true;
    lidGroup.add(ridgeMesh);

    // Finial crest spikes
    for (let i = -bodyW / 2 + 0.4; i <= bodyW / 2 - 0.4; i += 0.8) {
      const spikeGeo = new THREE.ConeGeometry(0.04, 0.16, 8);
      const spikeMesh = new THREE.Mesh(spikeGeo, materials.brassFrame);
      spikeMesh.position.set(i, wallH + roofH + 0.08, 0);
      lidGroup.add(spikeMesh);
    }

    lidGroup.position.y = baseH + 0.15;
    root.add(lidGroup);

  } else if (vesselType === 'geometric_prism') {
    // -------------------------------------------------------------
    // GEOMETRIC DODECAHEDRON / FACETED PRISM
    // -------------------------------------------------------------
    baseRadius = 2.1;
    soilHeight = 0.75;

    // 1. Minimal geometric brass pedestal
    const pedestalGeo = new THREE.CylinderGeometry(1.4, 1.8, 0.35, 6);
    const pedestalMesh = new THREE.Mesh(pedestalGeo, materials.brassFrame);
    pedestalMesh.position.y = 0.35 / 2;
    pedestalMesh.castShadow = true;
    pedestalMesh.receiveShadow = true;
    root.add(pedestalMesh);

    // Soil layer in faceted basin
    const soilBaseGeo = new THREE.CylinderGeometry(1.9, 1.4, 0.5, 6);
    const soilBaseMesh = new THREE.Mesh(soilBaseGeo, materials.soilStrata);
    soilBaseMesh.position.y = 0.35 + 0.25;
    root.add(soilBaseMesh);

    const soilTopGeo = new THREE.CircleGeometry(1.9, 6);
    soilSurfaceMesh = new THREE.Mesh(soilTopGeo, materials.soilSurface);
    soilSurfaceMesh.rotation.x = -Math.PI / 2;
    soilSurfaceMesh.position.y = 0.35 + 0.5;
    root.add(soilSurfaceMesh);

    // Geometric faceted glass cage
    lidGroup = new THREE.Group();
    lidGroup.name = 'PrismLid';

    const prismGeo = new THREE.IcosahedronGeometry(2.35, 1);
    const prismMesh = new THREE.Mesh(prismGeo, glassMat);
    prismMesh.position.y = 2.1;
    prismMesh.renderOrder = 20;
    lidGroup.add(prismMesh);

    // Wireframe brass strut edges
    const wireframeGeo = new THREE.WireframeGeometry(prismGeo);
    const wireframeMat = new THREE.LineBasicMaterial({
      color: 0xdfb15b,
      linewidth: 2
    });
    const wireframe = new THREE.LineSegments(wireframeGeo, wireframeMat);
    wireframe.position.y = 2.1;
    lidGroup.add(wireframe);

    // Inner condensation for prism
    const condGeo = new THREE.IcosahedronGeometry(2.3, 1);
    condensationMesh = new THREE.Mesh(condGeo, condensationMat);
    condensationMesh.position.y = 2.1;
    condensationMesh.renderOrder = 21;
    lidGroup.add(condensationMesh);

    lidGroup.position.y = 0.35;
    root.add(lidGroup);

  } else {
    // -------------------------------------------------------------
    // MODERN CYLINDER WITH NATURAL CORK LID
    // -------------------------------------------------------------
    baseRadius = 2.1;
    soilHeight = 0.8;

    // 1. Minimal matte wood rim base
    const basePoints: THREE.Vector2[] = [];
    basePoints.push(new THREE.Vector2(0, 0));
    basePoints.push(new THREE.Vector2(2.35, 0));
    basePoints.push(new THREE.Vector2(2.35, 0.3));
    basePoints.push(new THREE.Vector2(2.1, 0.35));
    basePoints.push(new THREE.Vector2(0, 0.35));

    const baseGeo = new THREE.LatheGeometry(basePoints, 48);
    const baseMesh = new THREE.Mesh(baseGeo, materials.darkWoodPlinth);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    root.add(baseMesh);

    // Soil strata cylinder
    const strataGeo = new THREE.CylinderGeometry(2.0, 2.0, 0.65, 48, 1, true);
    const strataMesh = new THREE.Mesh(strataGeo, materials.soilStrata);
    strataMesh.position.y = 0.35 + 0.65 / 2;
    strataMesh.castShadow = true;
    root.add(strataMesh);

    const soilTopGeo = new THREE.CircleGeometry(2.0, 48);
    soilSurfaceMesh = new THREE.Mesh(soilTopGeo, materials.soilSurface);
    soilSurfaceMesh.rotation.x = -Math.PI / 2;
    soilSurfaceMesh.position.y = 0.35 + 0.65;
    root.add(soilSurfaceMesh);

    // Borosilicate glass cylinder body (fixed)
    const glassTubeGeo = new THREE.CylinderGeometry(2.05, 2.05, 3.2, 48, 1, true);
    const glassTubeMesh = new THREE.Mesh(glassTubeGeo, glassMat);
    glassTubeMesh.position.y = 0.35 + 3.2 / 2;
    glassTubeMesh.renderOrder = 20;
    root.add(glassTubeMesh);

    // Condensation sleeve inside
    const condGeo = new THREE.CylinderGeometry(2.02, 2.02, 3.1, 48, 1, true);
    condensationMesh = new THREE.Mesh(condGeo, condensationMat);
    condensationMesh.position.y = 0.35 + 3.2 / 2;
    condensationMesh.renderOrder = 21;
    root.add(condensationMesh);

    // Removable Cork Stopper Lid
    lidGroup = new THREE.Group();
    lidGroup.name = 'CylinderCorkLid';

    const corkGeo = new THREE.CylinderGeometry(2.15, 2.0, 0.45, 48);
    const corkMesh = new THREE.Mesh(corkGeo, materials.darkWoodPlinth);
    corkMesh.castShadow = true;
    lidGroup.add(corkMesh);

    // Leather / brass pull loop
    const loopGeo = new THREE.TorusGeometry(0.25, 0.04, 16, 32);
    const loopMesh = new THREE.Mesh(loopGeo, materials.brassFrame);
    loopMesh.rotation.x = Math.PI / 2;
    loopMesh.position.y = 0.28;
    loopMesh.castShadow = true;
    lidGroup.add(loopMesh);

    lidGroup.position.y = 0.35 + 3.2 + 0.15;
    root.add(lidGroup);
  }

  // Animation function for opening/closing the lid smoothly
  const initialLidY = lidGroup.position.y;
  const updateLid = (progress: number) => {
    // Lift up and gently tilt back
    lidGroup.position.y = initialLidY + progress * 3.5;
    lidGroup.rotation.z = progress * 0.25;
    lidGroup.rotation.x = progress * 0.15;
  };

  return {
    group: root,
    lidGroup,
    soilSurfaceMesh,
    condensationMesh,
    baseRadius,
    soilHeight,
    updateLid,
    updateCondensation,
    updateTint
  };
}
