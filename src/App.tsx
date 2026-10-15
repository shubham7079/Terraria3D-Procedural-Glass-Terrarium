/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TerrariumScene } from './terrarium/scene.ts';
import { TerrariumAudioEngine } from './terrarium/audio.ts';
import { TerrariumHUD } from './components/TerrariumHUD.tsx';
import { TerrariumConfig, CameraPreset } from './terrarium/types.ts';

const DEFAULT_CONFIG: TerrariumConfig = {
  vesselType: 'bell_jar',
  lidOpen: false,
  lidProgress: 0.0,
  glassTint: 'clear',
  condensation: 0.25,
  timeOfDay: 13.5, // 1:30 PM (Bright, crisp daylight)
  autoCycleTime: true,
  timeSpeed: 1.0,
  weather: 'clear',
  weatherIntensity: 0.7,
  showFerns: true,
  showSucculents: true,
  showMushrooms: true,
  showMonstera: true,
  showMoss: true,
  showCrystals: true,
  bioluminescence: 0.85,
  floraHydration: 0.8,
  seed: 1234,
  audioEnabled: false,
  audioVolume: 0.5,
};

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<TerrariumScene | null>(null);
  const audioRef = useRef<TerrariumAudioEngine | null>(null);

  const [config, setConfig] = useState<TerrariumConfig>(DEFAULT_CONFIG);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string | null>(null);

  // Keep a mutable ref of config for the animation loop
  const configRef = useRef(config);
  configRef.current = config;

  // Initialize scene and audio once on mount
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const audio = new TerrariumAudioEngine();
    audioRef.current = audio;

    const scene = new TerrariumScene(
      canvasMountRef.current,
      configRef.current,
      (speciesId: string) => {
        setSelectedSpeciesId(speciesId);
      }
    );
    sceneRef.current = scene;

    let lastTime = performance.now();
    let animId: number;

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Update time of day if auto-cycle is enabled
      if (configRef.current.autoCycleTime) {
        setConfig((prev) => {
          const deltaHours = dt * prev.timeSpeed * 0.25; // 1 full 24h cycle in ~96 seconds at 1x
          const nextTime = (prev.timeOfDay + deltaHours) % 24;
          return { ...prev, timeOfDay: nextTime };
        });
      }

      // Update scene visuals and simulation systems
      scene.update(configRef.current);
      scene.tickSystems(dt, now * 0.001, configRef.current);

      // Update procedural audio engine mix
      audio.updateState(
        configRef.current.audioEnabled,
        configRef.current.audioVolume,
        configRef.current.weather,
        configRef.current.timeOfDay
      );

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      scene.dispose();
      audio.dispose();
      sceneRef.current = null;
      audioRef.current = null;
    };
  }, []);

  const handleWaterFlora = useCallback(() => {
    if (sceneRef.current) {
      sceneRef.current.waterPlants();
    }
    if (audioRef.current) {
      audioRef.current.playWaterDroplet();
    }
  }, []);

  const handleSelectCamera = useCallback((preset: CameraPreset) => {
    if (sceneRef.current) {
      sceneRef.current.setCameraPreset(preset);
    }
  }, []);

  const handleSnapshot = useCallback(() => {
    if (!sceneRef.current) return;
    const dataUrl = sceneRef.current.captureSnapshot();
    const link = document.createElement('a');
    link.download = `terraria3d-snapshot-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* 
        WebGL Canvas Mount: Isolated in a stable container to prevent React re-renders 
        from causing canvas rebuilds.
      */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Ergonomic UI HUD Overlay (Consolidated Collapsible Bottom Dock) */}
      <TerrariumHUD
        config={config}
        onChangeConfig={setConfig}
        onWaterFlora={handleWaterFlora}
        onSnapshot={handleSnapshot}
        onSelectCamera={handleSelectCamera}
        selectedSpeciesId={selectedSpeciesId}
        onCloseInspector={() => setSelectedSpeciesId(null)}
        onOpenInspector={(id) => setSelectedSpeciesId(id)}
      />
    </main>
  );
}
