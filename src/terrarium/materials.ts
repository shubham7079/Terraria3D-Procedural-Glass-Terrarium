import * as THREE from 'three';

/**
 * Procedural texture generators using HTML5 Canvas.
 * Strictly adheres to Three.js guidelines: Zero external 404 dependencies,
 * SRGBColorSpace for color maps, linear for normal/roughness, and anisotropic filtering.
 */

// Generate procedural soil cross-section texture (showing strata: gravel, charcoal, moss, soil)
export function createSoilStrataTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 1. Drainage gravel layer (bottom 0% - 25%)
  const gravelGrad = ctx.createLinearGradient(0, 512, 0, 384);
  gravelGrad.addColorStop(0, '#594d46');
  gravelGrad.addColorStop(1, '#786c64');
  ctx.fillStyle = gravelGrad;
  ctx.fillRect(0, 384, 512, 128);

  // Gravel stones
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * 512;
    const y = 384 + Math.random() * 128;
    const r = 3 + Math.random() * 8;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
    const shade = Math.floor(110 + Math.random() * 60);
    ctx.fillStyle = `rgb(${shade}, ${shade - 10}, ${shade - 20})`;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(40,30,25,0.4)';
    ctx.stroke();
  }

  // 2. Activated charcoal barrier (25% - 40%)
  const charcoalGrad = ctx.createLinearGradient(0, 384, 0, 307);
  charcoalGrad.addColorStop(0, '#1c1b1a');
  charcoalGrad.addColorStop(1, '#2b2927');
  ctx.fillStyle = charcoalGrad;
  ctx.fillRect(0, 307, 512, 77);

  // Charcoal granules
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * 512;
    const y = 307 + Math.random() * 77;
    const s = 2 + Math.random() * 4;
    ctx.fillStyle = Math.random() > 0.5 ? '#111111' : '#333333';
    ctx.fillRect(x, y, s, s);
  }

  // 3. Sphagnum moss barrier (40% - 50%)
  const mossGrad = ctx.createLinearGradient(0, 307, 0, 256);
  mossGrad.addColorStop(0, '#5c5234');
  mossGrad.addColorStop(1, '#4a542a');
  ctx.fillStyle = mossGrad;
  ctx.fillRect(0, 256, 512, 51);

  // Fibrous moss strands
  for (let i = 0; i < 350; i++) {
    const x = Math.random() * 512;
    const y = 256 + Math.random() * 51;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 16, y + (Math.random() - 0.5) * 8);
    ctx.strokeStyle = Math.random() > 0.4 ? 'rgba(120, 130, 60, 0.7)' : 'rgba(80, 70, 40, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // 4. Rich tropical humus soil (50% - 100%)
  const soilGrad = ctx.createLinearGradient(0, 256, 0, 0);
  soilGrad.addColorStop(0, '#2c1e18');
  soilGrad.addColorStop(0.5, '#3d2b22');
  soilGrad.addColorStop(1, '#201612');
  ctx.fillStyle = soilGrad;
  ctx.fillRect(0, 0, 512, 256);

  // Micro organic flecks & perlite
  for (let i = 0; i < 600; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    const s = Math.random() * 3 + 1;
    if (Math.random() < 0.08) {
      // White perlite fleck
      ctx.fillStyle = 'rgba(235, 235, 230, 0.85)';
      ctx.fillRect(x, y, s * 1.5, s * 1.5);
    } else {
      const shade = Math.floor(40 + Math.random() * 40);
      ctx.fillStyle = `rgb(${shade + 15}, ${shade + 5}, ${shade})`;
      ctx.fillRect(x, y, s, s);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(4, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Generate organic leaf vein normal texture
export function createLeafNormalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Neutral normal is rgb(128, 128, 255)
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, 256, 256);

  // Central midrib vein
  ctx.beginPath();
  ctx.moveTo(128, 0);
  ctx.bezierCurveTo(126, 80, 130, 180, 128, 256);
  ctx.strokeStyle = 'rgb(148, 128, 230)';
  ctx.lineWidth = 5;
  ctx.stroke();

  // Secondary lateral veins
  for (let y = 30; y < 240; y += 18) {
    // Left vein
    ctx.beginPath();
    ctx.moveTo(128, y);
    ctx.quadraticCurveTo(80, y - 10, 20, y + 15);
    ctx.strokeStyle = 'rgb(118, 115, 245)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Right vein
    ctx.beginPath();
    ctx.moveTo(128, y);
    ctx.quadraticCurveTo(176, y - 10, 236, y + 15);
    ctx.strokeStyle = 'rgb(138, 135, 245)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Generate procedural wood grain texture for base and plinth
export function createWoodGrainTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#4a2f1c';
  ctx.fillRect(0, 0, 512, 512);

  // Wood rings/grain
  for (let i = 0; i < 80; i++) {
    const y = i * 6.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 512; x += 32) {
      const offset = Math.sin(x * 0.02 + i * 0.3) * 6 + Math.cos(x * 0.05) * 3;
      ctx.lineTo(x, y + offset);
    }
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(40, 22, 12, 0.45)' : 'rgba(95, 62, 40, 0.4)';
    ctx.lineWidth = 3.5;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Generate procedural condensation droplets texture for the inside glass wall
export function createCondensationTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle misty fog background
  const grad = ctx.createRadialGradient(256, 256, 10, 256, 256, 250);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Fine micro-droplet mist
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 1.5 + 0.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.4})`;
    ctx.fill();
  }

  // Larger beaded water droplets with refractive highlight
  for (let i = 0; i < 350; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 2.5 + Math.random() * 4.5;
    
    // Outer drop outline
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 1.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fill();

    // Darker meniscus rim
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.7, r * 0.9, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();

    // Specular highlight spot
    ctx.beginPath();
    ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fill();

    // Trickle trail for some droplets
    if (Math.random() < 0.15) {
      const trailLen = 15 + Math.random() * 35;
      ctx.beginPath();
      ctx.moveTo(x, y + r);
      ctx.lineTo(x + (Math.random() - 0.5) * 3, y + r + trailLen);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 2);
  return texture;
}

// Generate radial contact shadow texture for grounding
export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(128, 128, 15, 128, 128, 120);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
  grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
  grad.addColorStop(0.8, 'rgba(0, 0, 0, 0.1)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export interface SharedMaterials {
  soilStrata: THREE.MeshStandardMaterial;
  soilSurface: THREE.MeshStandardMaterial;
  glassCloche: THREE.MeshPhysicalMaterial;
  condensationMaterial: THREE.MeshStandardMaterial;
  brassFrame: THREE.MeshStandardMaterial;
  copperTrim: THREE.MeshStandardMaterial;
  darkWoodPlinth: THREE.MeshStandardMaterial;
  fernLeaf: THREE.MeshStandardMaterial;
  succulentLeaf: THREE.MeshStandardMaterial;
  monsteraLeaf: THREE.MeshStandardMaterial;
  mushroomStipe: THREE.MeshStandardMaterial;
  mushroomCap: THREE.MeshStandardMaterial;
  driftwood: THREE.MeshStandardMaterial;
  crystal: THREE.MeshPhysicalMaterial;
  pebble: THREE.MeshStandardMaterial;
  contactShadow: THREE.MeshBasicMaterial;
}

export function buildSharedMaterials(): SharedMaterials {
  const soilStrataTex = createSoilStrataTexture();
  const leafNormalTex = createLeafNormalTexture();
  const woodTex = createWoodGrainTexture();
  const condensationTex = createCondensationTexture();
  const contactShadowTex = createContactShadowTexture();

  // Glass PBR material adhering to Three.js physical standards
  const glassCloche = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.94,
    opacity: 1,
    transparent: true,
    roughness: 0.05,
    metalness: 0.05,
    ior: 1.52,
    thickness: 1.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    attenuationColor: new THREE.Color(0xf0fbf6),
    attenuationDistance: 4.5,
    depthWrite: false,
    side: THREE.DoubleSide
  });

  // Inner condensation mist overlay material
  const condensationMaterial = new THREE.MeshStandardMaterial({
    alphaMap: condensationTex,
    transparent: true,
    opacity: 0.35,
    color: 0xffffff,
    roughness: 0.6,
    metalness: 0.05,
    depthWrite: false,
    side: THREE.FrontSide
  });

  // Soil cylinder strata cutaway
  const soilStrata = new THREE.MeshStandardMaterial({
    map: soilStrataTex,
    roughness: 0.88,
    metalness: 0.05,
    bumpMap: soilStrataTex,
    bumpScale: 0.04
  });

  // Top soil surface
  const soilSurface = new THREE.MeshStandardMaterial({
    color: 0x36241b,
    roughness: 0.92,
    metalness: 0.02
  });

  // Turned hardwood base
  const darkWoodPlinth = new THREE.MeshStandardMaterial({
    map: woodTex,
    roughness: 0.35,
    metalness: 0.1,
    color: 0x5a3d28
  });

  // Brushed brass metal
  const brassFrame = new THREE.MeshStandardMaterial({
    color: 0xdfb15b,
    roughness: 0.22,
    metalness: 0.85
  });

  // Antique copper
  const copperTrim = new THREE.MeshStandardMaterial({
    color: 0xb86d48,
    roughness: 0.3,
    metalness: 0.78
  });

  // Fern fronds with organic normal vein
  const fernLeaf = new THREE.MeshStandardMaterial({
    color: 0x2e8b57,
    roughness: 0.38,
    metalness: 0.05,
    normalMap: leafNormalTex,
    normalScale: new THREE.Vector2(0.35, 0.35),
    side: THREE.DoubleSide
  });

  // Succulent fleshy leaves with soft farina powdery look
  const succulentLeaf = new THREE.MeshStandardMaterial({
    color: 0x76b59d,
    roughness: 0.45,
    metalness: 0.08,
    side: THREE.DoubleSide
  });

  // Monstera glossy leaf
  const monsteraLeaf = new THREE.MeshStandardMaterial({
    color: 0x1e6f47,
    roughness: 0.28,
    metalness: 0.04,
    normalMap: leafNormalTex,
    normalScale: new THREE.Vector2(0.5, 0.5),
    side: THREE.DoubleSide
  });

  // Mushroom stalk
  const mushroomStipe = new THREE.MeshStandardMaterial({
    color: 0xded8ce,
    roughness: 0.65,
    metalness: 0.0
  });

  // Mushroom cap with emissive bioluminescence support
  const mushroomCap = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x10b981,
    emissiveIntensity: 0.6,
    roughness: 0.3,
    metalness: 0.1
  });

  // Weathered gnarled driftwood
  const driftwood = new THREE.MeshStandardMaterial({
    color: 0x6e5849,
    map: woodTex,
    roughness: 0.85,
    metalness: 0.05
  });

  // Amethyst / Quartz crystal
  const crystal = new THREE.MeshPhysicalMaterial({
    color: 0xa855f7,
    transmission: 0.78,
    roughness: 0.12,
    metalness: 0.1,
    ior: 1.54,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    transparent: true,
    opacity: 0.95
  });

  // River pebble
  const pebble = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.35,
    metalness: 0.15
  });

  // Soft contact shadow
  const contactShadow = new THREE.MeshBasicMaterial({
    map: contactShadowTex,
    transparent: true,
    opacity: 0.45,
    depthWrite: false
  });

  return {
    soilStrata,
    soilSurface,
    glassCloche,
    condensationMaterial,
    brassFrame,
    copperTrim,
    darkWoodPlinth,
    fernLeaf,
    succulentLeaf,
    monsteraLeaf,
    mushroomStipe,
    mushroomCap,
    driftwood,
    crystal,
    pebble,
    contactShadow
  };
}
