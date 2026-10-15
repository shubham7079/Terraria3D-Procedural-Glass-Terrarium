import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildSharedMaterials, SharedMaterials } from './materials.ts';
import { createTerrariumVessel, VesselBundle } from './vessel.ts';
import { buildFloraEcosystem, FloraEcosystem } from './flora.ts';
import { createWeatherSystem, WeatherSystem } from './weather.ts';
import { TerrariumConfig, CameraPreset } from './types.ts';

// Pre-allocated scratch objects to prevent garbage collection inside the render loop
const _vec3 = new THREE.Vector3();
const _camTarget = new THREE.Vector3();
const _lookTarget = new THREE.Vector3(0, 1.8, 0);
const _colorSky = new THREE.Color();
const _colorGround = new THREE.Color();

export class TerrariumScene {
  private container: HTMLDivElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;

  private materials: SharedMaterials;
  private vesselBundle: VesselBundle;
  private flora: FloraEcosystem;
  private weatherSystem: WeatherSystem;

  private sunLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private rimLight: THREE.DirectionalLight;
  private lightningLight: THREE.PointLight;

  private starsPoints: THREE.Points;
  private starsMat: THREE.PointsMaterial;

  private animFrameId: number | null = null;
  private clock = new THREE.Clock();
  private isDestroyed = false;

  private currentVesselType: string;
  private onSelectPlantCallback?: (plantId: string) => void;

  // Camera preset tracking
  private activeCameraPreset: CameraPreset = 'default';
  private targetCamPos = new THREE.Vector3(0, 3.2, 7.2);
  private targetLookAt = new THREE.Vector3(0, 1.8, 0);

  constructor(
    container: HTMLDivElement,
    initialConfig: TerrariumConfig,
    onSelectPlant?: (plantId: string) => void
  ) {
    this.container = container;
    this.onSelectPlantCallback = onSelectPlant;
    this.currentVesselType = initialConfig.vesselType;

    // 1. Renderer setup adhering to Three.js r160+ directives
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true, // Allows clean snapshots
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 2. Scene & procedural studio environment
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.04);

    const pmremGen = new THREE.PMREMGenerator(this.renderer);
    pmremGen.compileEquirectangularShader();
    const envRoom = new RoomEnvironment();
    this.scene.environment = pmremGen.fromScene(envRoom, 0.04).texture;
    pmremGen.dispose();
    envRoom.dispose();

    // 3. Camera & Damped OrbitControls
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    this.camera.position.copy(this.targetCamPos);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.copy(this.targetLookAt);
    this.controls.minDistance = 2.0;
    this.controls.maxDistance = 14.0;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // Prevent going beneath floor

    // 4. Lighting Rig (Studio PBR + Solar/Lunar Orbit)
    // Key Sun/Moon Light
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 30;
    const d = 4.5;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.sunLight.shadow.normalBias = 0.02;
    this.scene.add(this.sunLight);

    // Cool Hemisphere fill
    this.hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.8);
    this.scene.add(this.hemiLight);

    // Rim / Backlight for glass edge highlights
    this.rimLight = new THREE.DirectionalLight(0xa7f3d0, 0.9);
    this.rimLight.position.set(-5, 6, -5);
    this.scene.add(this.rimLight);

    // Lightning burst light
    this.lightningLight = new THREE.PointLight(0xdbeafe, 0, 30);
    this.lightningLight.position.set(0, 8, 0);
    this.scene.add(this.lightningLight);

    // 5. Starfield & Galaxy Dust Dome
    const starCount = 1200;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 40 + Math.random() * 10;
      // Hemisphere above ground
      const sinPhi = Math.sin(phi);
      starPositions[i * 3] = r * sinPhi * Math.cos(theta);
      starPositions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 1.0;
      starPositions[i * 3 + 2] = r * sinPhi * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    this.starsMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.15,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.starsPoints = new THREE.Points(starGeo, this.starsMat);
    this.scene.add(this.starsPoints);

    // 6. Build Materials, Vessel, Flora & Weather
    this.materials = buildSharedMaterials();

    this.vesselBundle = createTerrariumVessel(initialConfig.vesselType, this.materials);
    this.scene.add(this.vesselBundle.group);

    this.flora = buildFloraEcosystem(
      this.materials,
      this.vesselBundle.soilHeight,
      this.vesselBundle.baseRadius
    );
    this.scene.add(this.flora.group);

    this.weatherSystem = createWeatherSystem();
    this.scene.add(this.weatherSystem.group);

    // 7. Event listeners
    window.addEventListener('resize', this.onResize);
    this.renderer.domElement.addEventListener('pointerup', this.onPointerUp);

    // Pre-warm shaders
    this.renderer.compile(this.scene, this.camera);

    // Start render loop
    this.animate();
  }

  private onResize = () => {
    if (this.isDestroyed || !this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private onPointerUp = (e: MouseEvent) => {
    // Only inspect plant on clean click (not drag/orbit)
    if (!this.onSelectPlantCallback) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObjects(this.flora.group.children, true);
    for (const hit of intersects) {
      let cur: THREE.Object3D | null = hit.object;
      while (cur && cur !== this.flora.group) {
        if (cur.userData && cur.userData.speciesId) {
          this.onSelectPlantCallback(cur.userData.speciesId);
          return;
        }
        cur = cur.parent;
      }
    }
  };

  public setCameraPreset(preset: CameraPreset) {
    this.activeCameraPreset = preset;
    switch (preset) {
      case 'default':
        this.targetCamPos.set(0, 3.2, 7.2);
        this.targetLookAt.set(0, 1.8, 0);
        break;
      case 'closeup':
        this.targetCamPos.set(0.6, 1.9, 2.6);
        this.targetLookAt.set(0.1, 1.5, 0.2);
        break;
      case 'topdown':
        this.targetCamPos.set(0.01, 8.5, 0.01);
        this.targetLookAt.set(0, 1.2, 0);
        break;
      case 'ground':
        this.targetCamPos.set(-1.8, 1.4, 2.2);
        this.targetLookAt.set(0, 1.4, 0);
        break;
    }
  }

  public setVesselType(type: TerrariumConfig['vesselType']) {
    if (type === this.currentVesselType) return;
    this.currentVesselType = type;

    // Remove old vessel and flora
    this.scene.remove(this.vesselBundle.group);
    this.scene.remove(this.flora.group);

    // Recreate vessel
    this.vesselBundle = createTerrariumVessel(type, this.materials);
    this.scene.add(this.vesselBundle.group);

    // Recreate flora with updated soil parameters
    this.flora = buildFloraEcosystem(
      this.materials,
      this.vesselBundle.soilHeight,
      this.vesselBundle.baseRadius
    );
    this.scene.add(this.flora.group);
  }

  public waterPlants() {
    this.flora.waterPulse(1.0);
    this.weatherSystem.triggerWaterMist();
  }

  public triggerStormLightning() {
    this.weatherSystem.triggerLightning();
  }

  public captureSnapshot(): string {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  public update(config: TerrariumConfig) {
    if (this.isDestroyed) return;

    // Check vessel switch
    if (config.vesselType !== this.currentVesselType) {
      this.setVesselType(config.vesselType);
    }

    // Update vessel properties
    this.vesselBundle.updateLid(config.lidProgress);
    this.vesselBundle.updateCondensation(config.condensation);
    this.vesselBundle.updateTint(config.glassTint);

    // Calculate celestial day/night orbit
    // 0 = midnight, 6 = dawn, 12 = noon, 18 = dusk, 24 = midnight
    const hour = config.timeOfDay % 24;
    const celestialAngle = ((hour - 6) / 24) * Math.PI * 2;
    const sunHeight = Math.sin(celestialAngle);
    const sunAzimuth = Math.cos(celestialAngle);

    // Position sun light
    this.sunLight.position.set(sunAzimuth * 12, Math.max(0.2, sunHeight * 12), sunAzimuth * 4);

    const isNight = hour < 5.5 || hour > 19.0;
    const isTwilight = (hour >= 5.0 && hour <= 6.5) || (hour >= 17.5 && hour <= 19.0);

    // Sky, fog and light temperature interpolation
    if (isNight) {
      // Midnight moonlight
      _colorSky.set(0x060b18);
      _colorGround.set(0x0a1122);
      this.sunLight.color.set(0x93c5fd);
      this.sunLight.intensity = 0.55;
      this.hemiLight.color.set(0x1e293b);
      this.hemiLight.groundColor.set(0x0b1120);
      this.hemiLight.intensity = 0.45;
      this.rimLight.color.set(0x60a5fa);
      this.rimLight.intensity = 0.5;
      this.starsMat.opacity = 0.85;
    } else if (isTwilight) {
      // Warm golden dusk / apricot dawn
      _colorSky.set(0x451a28);
      _colorGround.set(0x1c121e);
      this.sunLight.color.set(0xfb923c);
      this.sunLight.intensity = 2.4;
      this.hemiLight.color.set(0xf472b6);
      this.hemiLight.groundColor.set(0x3b1d28);
      this.hemiLight.intensity = 0.9;
      this.rimLight.color.set(0xfde047);
      this.rimLight.intensity = 1.2;
      this.starsMat.opacity = 0.15;
    } else {
      // High noon / crisp daytime
      _colorSky.set(0x1e293b);
      _colorGround.set(0x0f172a);
      this.sunLight.color.set(0xfffaed);
      this.sunLight.intensity = 2.8;
      this.hemiLight.color.set(0xbae6fd);
      this.hemiLight.groundColor.set(0x334155);
      this.hemiLight.intensity = 1.0;
      this.rimLight.color.set(0xa7f3d0);
      this.rimLight.intensity = 0.9;
      this.starsMat.opacity = 0.0;
    }

    // Adjust for weather conditions
    if (config.weather === 'storm') {
      _colorSky.set(0x090d16);
      this.sunLight.intensity *= 0.25;
      this.hemiLight.intensity *= 0.35;
      (this.scene.fog as THREE.FogExp2).density = 0.08 * config.weatherIntensity;
    } else if (config.weather === 'mist') {
      _colorSky.lerp(new THREE.Color(0x334155), 0.45);
      (this.scene.fog as THREE.FogExp2).density = 0.07 * config.weatherIntensity;
    } else if (config.weather === 'snow') {
      _colorSky.lerp(new THREE.Color(0x1e293b), 0.3);
      (this.scene.fog as THREE.FogExp2).density = 0.05 * config.weatherIntensity;
    } else {
      (this.scene.fog as THREE.FogExp2).density = 0.035;
    }

    this.scene.background = _colorSky;
    (this.scene.fog as THREE.FogExp2).color.copy(_colorSky);

    // Lightning illumination
    const lightning = this.weatherSystem.lightningIntensity;
    this.lightningLight.intensity = lightning * 12.0;
  }

  private animate = () => {
    if (this.isDestroyed) return;
    this.animFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsed = this.clock.getElapsedTime();

    // Smoothly damp camera toward target preset if active
    if (this.activeCameraPreset !== 'default' || this.camera.position.distanceTo(this.targetCamPos) > 0.05) {
      this.camera.position.lerp(this.targetCamPos, 0.06);
      this.controls.target.lerp(this.targetLookAt, 0.06);
    }

    // Update OrbitControls with damping
    this.controls.update();

    // Rotate starfield slowly
    this.starsPoints.rotation.y = elapsed * 0.005;

    // Render frame
    this.renderer.render(this.scene, this.camera);
  };

  public tickSystems(delta: number, elapsed: number, config: TerrariumConfig) {
    if (this.isDestroyed) return;
    const isNight = config.timeOfDay < 5.5 || config.timeOfDay > 19.0;
    this.flora.update(delta, elapsed, config);
    this.weatherSystem.update(delta, elapsed, config.weather, config.weatherIntensity, isNight);
  }

  public dispose() {
    this.isDestroyed = true;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onResize);
    this.renderer.domElement.removeEventListener('pointerup', this.onPointerUp);

    this.controls.dispose();
    this.renderer.dispose();
    if (this.container && this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
