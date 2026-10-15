import * as THREE from 'three';
import { WeatherType } from './types.ts';

export interface WeatherSystem {
  group: THREE.Group;
  update: (delta: number, time: number, weather: WeatherType, intensity: number, isNight: boolean) => void;
  triggerLightning: () => void;
  triggerWaterMist: () => void;
  lightningIntensity: number;
}

export function createWeatherSystem(): WeatherSystem {
  const root = new THREE.Group();
  root.name = 'WeatherSystemRoot';

  // -------------------------------------------------------------
  // 1. DUST MOTES & POLLEN (Sunny/Clear atmosphere)
  // -------------------------------------------------------------
  const moteCount = 180;
  const moteGeo = new THREE.BufferGeometry();
  const motePos = new Float32Array(moteCount * 3);
  const moteSeeds = new Float32Array(moteCount * 3);

  for (let i = 0; i < moteCount; i++) {
    motePos[i * 3] = (Math.random() - 0.5) * 4.5;
    motePos[i * 3 + 1] = 0.5 + Math.random() * 4.0;
    motePos[i * 3 + 2] = (Math.random() - 0.5) * 4.5;

    moteSeeds[i * 3] = Math.random() * Math.PI * 2;
    moteSeeds[i * 3 + 1] = 0.5 + Math.random();
    moteSeeds[i * 3 + 2] = Math.random();
  }
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));

  const moteMat = new THREE.PointsMaterial({
    color: 0xfff3b0,
    size: 0.045,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const motePoints = new THREE.Points(moteGeo, moteMat);
  root.add(motePoints);

  // -------------------------------------------------------------
  // 2. RAIN PARTICLES
  // -------------------------------------------------------------
  const rainCount = 450;
  const rainGeo = new THREE.BufferGeometry();
  const rainPos = new Float32Array(rainCount * 3);
  const rainVel = new Float32Array(rainCount);

  for (let i = 0; i < rainCount; i++) {
    rainPos[i * 3] = (Math.random() - 0.5) * 6;
    rainPos[i * 3 + 1] = 1.0 + Math.random() * 6;
    rainPos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    rainVel[i] = 7.0 + Math.random() * 4.0;
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));

  const rainMat = new THREE.PointsMaterial({
    color: 0x93c5fd,
    size: 0.05,
    transparent: true,
    opacity: 0.7,
    blending: THREE.NormalBlending,
    depthWrite: false
  });
  const rainPoints = new THREE.Points(rainGeo, rainMat);
  rainPoints.visible = false;
  root.add(rainPoints);

  // -------------------------------------------------------------
  // 3. SNOW PARTICLES
  // -------------------------------------------------------------
  const snowCount = 300;
  const snowGeo = new THREE.BufferGeometry();
  const snowPos = new Float32Array(snowCount * 3);
  const snowWiggle = new Float32Array(snowCount);

  for (let i = 0; i < snowCount; i++) {
    snowPos[i * 3] = (Math.random() - 0.5) * 5.5;
    snowPos[i * 3 + 1] = 0.5 + Math.random() * 5.5;
    snowPos[i * 3 + 2] = (Math.random() - 0.5) * 5.5;
    snowWiggle[i] = Math.random() * Math.PI * 2;
  }
  snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));

  const snowMat = new THREE.PointsMaterial({
    color: 0xf8fafc,
    size: 0.065,
    transparent: true,
    opacity: 0.8,
    depthWrite: false
  });
  const snowPoints = new THREE.Points(snowGeo, snowMat);
  snowPoints.visible = false;
  root.add(snowPoints);

  // -------------------------------------------------------------
  // 4. NOCTURNAL FIREFLIES & SPORES
  // -------------------------------------------------------------
  const fireflyCount = 45;
  const fireflyGeo = new THREE.BufferGeometry();
  const fireflyPos = new Float32Array(fireflyCount * 3);
  const fireflyOffsets = new Float32Array(fireflyCount * 3);

  for (let i = 0; i < fireflyCount; i++) {
    fireflyPos[i * 3] = (Math.random() - 0.5) * 3.5;
    fireflyPos[i * 3 + 1] = 0.8 + Math.random() * 2.8;
    fireflyPos[i * 3 + 2] = (Math.random() - 0.5) * 3.5;

    fireflyOffsets[i * 3] = Math.random() * 10;
    fireflyOffsets[i * 3 + 1] = Math.random() * 10;
    fireflyOffsets[i * 3 + 2] = Math.random() * 10;
  }
  fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPos, 3));

  const fireflyMat = new THREE.PointsMaterial({
    color: 0x6ee7b7,
    size: 0.09,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const fireflyPoints = new THREE.Points(fireflyGeo, fireflyMat);
  root.add(fireflyPoints);

  // -------------------------------------------------------------
  // 5. WATERING MIST BURST
  // -------------------------------------------------------------
  const mistCount = 250;
  const mistGeo = new THREE.BufferGeometry();
  const mistPos = new Float32Array(mistCount * 3);
  const mistVels = new Float32Array(mistCount * 3);

  for (let i = 0; i < mistCount; i++) {
    mistPos[i * 3] = (Math.random() - 0.5) * 0.4;
    mistPos[i * 3 + 1] = 4.2;
    mistPos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;

    mistVels[i * 3] = (Math.random() - 0.5) * 1.5;
    mistVels[i * 3 + 1] = -3.2 - Math.random() * 2.5;
    mistVels[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
  }
  mistGeo.setAttribute('position', new THREE.BufferAttribute(mistPos, 3));

  const wateringMistMat = new THREE.PointsMaterial({
    color: 0x67e8f9,
    size: 0.05,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const wateringMistPoints = new THREE.Points(mistGeo, wateringMistMat);
  root.add(wateringMistPoints);

  let mistLife = 0;
  const triggerWaterMist = () => {
    mistLife = 1.0;
    // Reset positions to top nozzle
    const pos = mistGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < mistCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.4;
      pos[i * 3 + 1] = 4.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }
    mistGeo.attributes.position.needsUpdate = true;
  };

  // -------------------------------------------------------------
  // 6. LIGHTNING SYSTEM
  // -------------------------------------------------------------
  let lightningTimer = 0;
  let lightningFlash = 0;

  const triggerLightning = () => {
    lightningFlash = 1.0;
  };

  const update = (
    delta: number,
    time: number,
    weather: WeatherType,
    intensity: number,
    isNight: boolean
  ) => {
    // 1. Dust motes motion
    if (weather === 'clear') {
      moteMat.opacity = THREE.MathUtils.damp(moteMat.opacity, isNight ? 0.15 : 0.65, 2, delta);
      const pos = moteGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < moteCount; i++) {
        const s = moteSeeds[i * 3];
        pos[i * 3] += Math.sin(time * 0.6 + s) * 0.003;
        pos[i * 3 + 1] += Math.cos(time * 0.4 + s) * 0.002;
        pos[i * 3 + 2] += Math.cos(time * 0.5 + s) * 0.003;

        // Wrap boundaries
        if (pos[i * 3 + 1] > 4.5) pos[i * 3 + 1] = 0.5;
        if (pos[i * 3 + 1] < 0.5) pos[i * 3 + 1] = 4.5;
      }
      moteGeo.attributes.position.needsUpdate = true;
    } else {
      moteMat.opacity = THREE.MathUtils.damp(moteMat.opacity, 0.0, 3, delta);
    }

    // 2. Rain & Storm
    if (weather === 'rain' || weather === 'storm') {
      rainPoints.visible = true;
      const speedMult = weather === 'storm' ? 1.5 : 1.0;
      rainMat.opacity = THREE.MathUtils.damp(rainMat.opacity, 0.75 * intensity, 2, delta);
      const pos = rainGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < rainCount; i++) {
        pos[i * 3 + 1] -= rainVel[i] * speedMult * delta;
        // reset when hitting soil/ground
        if (pos[i * 3 + 1] < 0.6) {
          pos[i * 3 + 1] = 5.5 + Math.random() * 1.5;
          pos[i * 3] = (Math.random() - 0.5) * 5.5;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 5.5;
        }
      }
      rainGeo.attributes.position.needsUpdate = true;

      // Auto lightning in storm mode
      if (weather === 'storm') {
        lightningTimer += delta;
        if (lightningTimer > 3.5 + Math.random() * 4.0) {
          triggerLightning();
          lightningTimer = 0;
        }
      }
    } else {
      rainMat.opacity = THREE.MathUtils.damp(rainMat.opacity, 0.0, 3, delta);
      if (rainMat.opacity < 0.02) rainPoints.visible = false;
    }

    // 3. Snow
    if (weather === 'snow') {
      snowPoints.visible = true;
      snowMat.opacity = THREE.MathUtils.damp(snowMat.opacity, 0.85 * intensity, 2, delta);
      const pos = snowGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < snowCount; i++) {
        snowWiggle[i] += delta * 1.5;
        pos[i * 3] += Math.sin(snowWiggle[i]) * 0.008;
        pos[i * 3 + 1] -= 0.65 * delta;
        pos[i * 3 + 2] += Math.cos(snowWiggle[i]) * 0.008;

        if (pos[i * 3 + 1] < 0.5) {
          pos[i * 3 + 1] = 5.5;
          pos[i * 3] = (Math.random() - 0.5) * 5.0;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 5.0;
        }
      }
      snowGeo.attributes.position.needsUpdate = true;
    } else {
      snowMat.opacity = THREE.MathUtils.damp(snowMat.opacity, 0.0, 3, delta);
      if (snowMat.opacity < 0.02) snowPoints.visible = false;
    }

    // 4. Fireflies at night
    const targetFireflyOpacity = isNight ? 0.85 : 0.0;
    fireflyMat.opacity = THREE.MathUtils.damp(fireflyMat.opacity, targetFireflyOpacity, 2, delta);
    if (fireflyMat.opacity > 0.01) {
      const pos = fireflyGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < fireflyCount; i++) {
        const ox = fireflyOffsets[i * 3];
        const oy = fireflyOffsets[i * 3 + 1];
        const oz = fireflyOffsets[i * 3 + 2];
        pos[i * 3] += Math.sin(time * 0.8 + ox) * 0.006;
        pos[i * 3 + 1] += Math.cos(time * 0.6 + oy) * 0.005;
        pos[i * 3 + 2] += Math.sin(time * 0.7 + oz) * 0.006;
      }
      fireflyGeo.attributes.position.needsUpdate = true;
    }

    // 5. Water mist burst decay
    if (mistLife > 0) {
      mistLife = Math.max(0, mistLife - delta * 0.6);
      wateringMistMat.opacity = mistLife * 0.85;
      const pos = mistGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < mistCount; i++) {
        pos[i * 3] += mistVels[i * 3] * delta;
        pos[i * 3 + 1] += mistVels[i * 3 + 1] * delta;
        pos[i * 3 + 2] += mistVels[i * 3 + 2] * delta;
      }
      mistGeo.attributes.position.needsUpdate = true;
    } else {
      wateringMistMat.opacity = 0;
    }

    // Decay lightning flash
    if (lightningFlash > 0) {
      lightningFlash = Math.max(0, lightningFlash - delta * 4.5);
    }
  };

  return {
    group: root,
    update,
    triggerLightning,
    triggerWaterMist,
    get lightningIntensity() {
      return lightningFlash;
    }
  };
}
