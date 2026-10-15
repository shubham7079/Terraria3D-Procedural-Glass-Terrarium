import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  CloudRain,
  CloudLightning,
  CloudFog,
  Snowflake,
  Droplets,
  Volume2,
  VolumeX,
  Camera,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Compass,
  RotateCcw,
  TreePine,
  Layers
} from 'lucide-react';
import {
  TerrariumConfig,
  VesselType,
  WeatherType,
  CameraPreset,
  PLANT_SPECIES,
  PlantSpeciesInfo
} from '../terrarium/types.ts';

interface TerrariumHUDProps {
  config: TerrariumConfig;
  onChangeConfig: (updater: (prev: TerrariumConfig) => TerrariumConfig) => void;
  onWaterFlora: () => void;
  onSnapshot: () => void;
  onSelectCamera: (preset: CameraPreset) => void;
  selectedSpeciesId: string | null;
  onCloseInspector: () => void;
  onOpenInspector: (speciesId: string) => void;
}

type TabType = 'lighting' | 'weather' | 'flora' | 'vessel' | 'audio' | 'camera';

export const TerrariumHUD: React.FC<TerrariumHUDProps> = ({
  config,
  onChangeConfig,
  onWaterFlora,
  onSnapshot,
  onSelectCamera,
  selectedSpeciesId,
  onCloseInspector,
  onOpenInspector
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('lighting');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [waterEffectActive, setWaterEffectActive] = useState(false);

  // Keyboard shortcut H to toggle HUD
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleWaterClick = () => {
    onWaterFlora();
    setWaterEffectActive(true);
    onChangeConfig((prev) => ({
      ...prev,
      condensation: Math.min(1.0, prev.condensation + 0.25),
      floraHydration: Math.min(1.0, prev.floraHydration + 0.35)
    }));
    setTimeout(() => setWaterEffectActive(false), 1200);
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time) % 24;
    const minutes = Math.floor((time % 1) * 60);
    const hStr = hours.toString().padStart(2, '0');
    const mStr = minutes.toString().padStart(2, '0');
    return `${hStr}:${mStr}`;
  };

  const getTimePhase = (time: number) => {
    if (time >= 5 && time < 7.5) return 'Apricot Dawn';
    if (time >= 7.5 && time < 11.5) return 'Morning Sun';
    if (time >= 11.5 && time < 14.5) return 'High Noon';
    if (time >= 14.5 && time < 17.5) return 'Golden Afternoon';
    if (time >= 17.5 && time < 19.5) return 'Crimson Dusk';
    if (time >= 19.5 && time < 22) return 'Twilight Starlight';
    return 'Midnight Moonlight';
  };

  const selectedSpecies: PlantSpeciesInfo | null = selectedSpeciesId
    ? PLANT_SPECIES[selectedSpeciesId] || null
    : null;

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden font-sans text-slate-100">
      {/* ------------------------------------------------------------- */}
      {/* TOP BAR: Minimalist, Unobtrusive Brand & Environmental Gauges  */}
      {/* ------------------------------------------------------------- */}
      <header className="absolute top-0 left-0 right-0 p-4 sm:p-5 flex items-start justify-between pointer-events-auto">
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/70 px-4 py-2.5 rounded-xl shadow-xl">
          <div className="w-8 h-8 rounded-lg bg-emerald-700/80 border border-emerald-400/50 flex items-center justify-center text-emerald-200">
            <TreePine className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-wide text-white uppercase">Terraria3D</h1>
              <span className="text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                ECOSYSTEM LIVE
              </span>
            </div>
            <p className="text-xs text-slate-300">Procedural Botanical Biome</p>
          </div>
        </div>

        {/* Center: Live Time & Microclimate Readout */}
        <div className="hidden md:flex items-center gap-4 bg-slate-900/90 border border-slate-700/70 px-4 py-2 rounded-xl shadow-xl text-xs">
          <div className="flex items-center gap-2">
            {config.timeOfDay >= 6 && config.timeOfDay <= 18 ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-sky-300" />
            )}
            <span className="font-mono font-medium text-slate-100">{formatTime(config.timeOfDay)}</span>
            <span className="text-slate-400">• {getTimePhase(config.timeOfDay)}</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="flex items-center gap-1.5 text-slate-300">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span>Humidity: {Math.round(65 + config.condensation * 30)}%</span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          {/* Water Flora Quick Button */}
          <button
            onClick={handleWaterClick}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border shadow-lg transition-all ${
              waterEffectActive
                ? 'bg-cyan-600 border-cyan-400 text-white'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-cyan-300 hover:text-cyan-200'
            }`}
            title="Spray gentle water mist over the plants"
          >
            <Droplets className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Water Flora</span>
          </button>

          {/* Snapshot Button */}
          <button
            onClick={onSnapshot}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white shadow-lg transition-all flex items-center gap-1.5"
            title="Capture high-resolution snapshot"
          >
            <Camera className="w-4 h-4 text-slate-300" />
            <span className="hidden sm:inline">Snapshot</span>
          </button>

          {/* Toggle Zen Mode Button */}
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white shadow-lg transition-all flex items-center gap-1.5"
            title="Toggle cinema/zen view (H)"
          >
            <Maximize2 className="w-4 h-4 text-slate-300" />
            <span className="hidden sm:inline">{isCollapsed ? 'Show HUD' : 'Zen View'}</span>
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* SPECIES INSPECTION MODAL (When flora is clicked or selected)  */}
      {/* ------------------------------------------------------------- */}
      {selectedSpecies && (
        <div className="absolute top-20 right-4 sm:right-6 w-80 sm:w-96 max-w-[calc(100vw-32px)] bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl p-5 pointer-events-auto z-30 transition-all">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: selectedSpecies.color }}
                />
                <h3 className="text-sm font-semibold text-white">{selectedSpecies.commonName}</h3>
              </div>
              <p className="text-xs italic text-slate-400">{selectedSpecies.scientificName}</p>
            </div>
            <button
              onClick={onCloseInspector}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">{selectedSpecies.description}</p>

          <div className="grid grid-cols-2 gap-2 text-[11px] mb-4">
            <div className="bg-slate-800/80 border border-slate-700/60 p-2.5 rounded-lg">
              <span className="text-slate-400 block mb-0.5">Family</span>
              <span className="font-medium text-slate-200">{selectedSpecies.family}</span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 p-2.5 rounded-lg">
              <span className="text-slate-400 block mb-0.5">Geographic Origin</span>
              <span className="font-medium text-slate-200">{selectedSpecies.origin}</span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 p-2.5 rounded-lg">
              <span className="text-slate-400 block mb-0.5">Moisture Need</span>
              <span className="font-medium text-cyan-300">{selectedSpecies.humidityNeeds}</span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 p-2.5 rounded-lg">
              <span className="text-slate-400 block mb-0.5">Lighting Need</span>
              <span className="font-medium text-amber-300">{selectedSpecies.lightNeeds}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-400">Terrarium Health:</span>
            <span className="font-mono text-emerald-400 font-medium">Optimal 100%</span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* COLLAPSIBLE BOTTOM CONTROL DOCK (Strict Three.js Directive)   */}
      {/* ------------------------------------------------------------- */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-[94vw] max-w-4xl pointer-events-auto transition-transform duration-300 ease-out z-20 ${
          isCollapsed ? 'translate-y-[calc(100%+16px)]' : 'translate-y-0'
        }`}
      >
        {/* Collapse / Expand Tab Button Attached to Top Edge */}
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="bg-slate-900 border border-slate-700 border-b-0 px-4 py-1.5 rounded-t-xl text-xs text-slate-300 hover:text-white flex items-center gap-1.5 shadow-lg"
          >
            {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{isCollapsed ? 'Show Controls (H)' : 'Hide Controls (H)'}</span>
          </button>
        </div>

        {/* Unified Solid Dock Container (No backdrop-filter over WebGL) */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 sm:p-5">
          {/* Top Row: Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 overflow-x-auto gap-1">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('lighting')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'lighting'
                    ? 'bg-slate-800 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Day & Night</span>
              </button>

              <button
                onClick={() => setActiveTab('weather')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'weather'
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CloudRain className="w-3.5 h-3.5" />
                <span>Weather</span>
              </button>

              <button
                onClick={() => setActiveTab('flora')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'flora'
                    ? 'bg-slate-800 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TreePine className="w-3.5 h-3.5" />
                <span>Flora & Soil</span>
              </button>

              <button
                onClick={() => setActiveTab('vessel')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'vessel'
                    ? 'bg-slate-800 text-purple-300 border border-purple-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Vessel & Lid</span>
              </button>

              <button
                onClick={() => setActiveTab('audio')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'audio'
                    ? 'bg-slate-800 text-blue-300 border border-blue-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Audio</span>
              </button>

              <button
                onClick={() => setActiveTab('camera')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'camera'
                    ? 'bg-slate-800 text-rose-300 border border-rose-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Camera</span>
              </button>
            </div>

            {/* Quick Inspect species list pill */}
            <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Click plant in 3D to inspect</span>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* TAB 1: DAY & NIGHT CONTROLS                                  */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'lighting' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 font-medium">Time of Day:</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                    {formatTime(config.timeOfDay)}
                  </span>
                  <span className="text-xs text-slate-400">({getTimePhase(config.timeOfDay)})</span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.autoCycleTime}
                      onChange={(e) =>
                        onChangeConfig((p) => ({ ...p, autoCycleTime: e.target.checked }))
                      }
                      className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
                    />
                    <span>Auto-Cycle Orbit</span>
                  </label>

                  {config.autoCycleTime && (
                    <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                      {[0.5, 1, 2, 4].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => onChangeConfig((p) => ({ ...p, timeSpeed: spd }))}
                          className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                            config.timeSpeed === spd ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Slider for Solar Elevation */}
              <div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="0.1"
                  value={config.timeOfDay}
                  onChange={(e) =>
                    onChangeConfig((p) => ({ ...p, timeOfDay: parseFloat(e.target.value) }))
                  }
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>00:00 Midnight</span>
                  <span>06:00 Dawn</span>
                  <span>12:00 High Noon</span>
                  <span>18:00 Sunset</span>
                  <span>24:00 Night</span>
                </div>
              </div>

              {/* Quick Lighting Presets */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-xs text-slate-400">Presets:</span>
                {[
                  { label: 'Dawn (06:00)', val: 6.0, icon: Sun },
                  { label: 'Noon (12:00)', val: 12.0, icon: Sun },
                  { label: 'Sunset (18:00)', val: 18.0, icon: Sun },
                  { label: 'Midnight (00:00)', val: 0.0, icon: Moon },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => onChangeConfig((p) => ({ ...p, timeOfDay: item.val }))}
                    className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-colors flex items-center gap-1.5"
                  >
                    <item.icon className="w-3 h-3 text-amber-400" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2: WEATHER CONTROLS                                       */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'weather' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-300 font-medium mr-2">Weather Condition:</span>
                {[
                  { id: 'clear', label: 'Clear & Sunny', icon: Sun },
                  { id: 'mist', label: 'Morning Mist', icon: CloudFog },
                  { id: 'rain', label: 'Gentle Rain', icon: CloudRain },
                  { id: 'storm', label: 'Thunderstorm', icon: CloudLightning },
                  { id: 'snow', label: 'Winter Frost', icon: Snowflake },
                ].map((w) => (
                  <button
                    key={w.id}
                    onClick={() =>
                      onChangeConfig((p) => ({
                        ...p,
                        weather: w.id as WeatherType,
                        condensation: w.id === 'mist' || w.id === 'rain' ? Math.max(0.5, p.condensation) : p.condensation
                      }))
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                      config.weather === w.id
                        ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/60'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    <w.icon className="w-3.5 h-3.5" />
                    <span>{w.label}</span>
                  </button>
                ))}
              </div>

              {/* Weather Intensity & Glass Condensation Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Precipitation / Fog Density:</span>
                    <span className="font-mono text-cyan-400">{Math.round(config.weatherIntensity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={config.weatherIntensity}
                    onChange={(e) =>
                      onChangeConfig((p) => ({ ...p, weatherIntensity: parseFloat(e.target.value) }))
                    }
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs text-slate-300 mb-1">
                    <span>Glass Wall Condensation:</span>
                    <button
                      onClick={() => onChangeConfig((p) => ({ ...p, condensation: 0.0 }))}
                      className="text-[10px] text-slate-400 hover:text-white underline"
                    >
                      Wipe Clean
                    </button>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.0"
                    step="0.05"
                    value={config.condensation}
                    onChange={(e) =>
                      onChangeConfig((p) => ({ ...p, condensation: parseFloat(e.target.value) }))
                    }
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 3: FLORA & ECOSYSTEM                                      */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'flora' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs text-slate-300 font-medium">Botanical Species:</span>
                <button
                  onClick={handleWaterClick}
                  className="px-3 py-1 rounded-lg text-xs bg-cyan-700/80 hover:bg-cyan-600 text-white flex items-center gap-1.5 transition-colors"
                >
                  <Droplets className="w-3.5 h-3.5" />
                  <span>Water Terrarium</span>
                </button>
              </div>

              {/* Plant Species Toggles & Quick Inspector links */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  { id: 'ferns', name: 'Boston Fern', key: 'showFerns' as const, color: '#34d399' },
                  { id: 'succulents', name: 'Echeveria', key: 'showSucculents' as const, color: '#a7f3d0' },
                  { id: 'monstera', name: 'Monstera', key: 'showMonstera' as const, color: '#10b981' },
                  { id: 'mushrooms', name: 'Ghost Fungus', key: 'showMushrooms' as const, color: '#6ee7b7' },
                  { id: 'moss', name: 'Cushion Moss', key: 'showMoss' as const, color: '#22c55e' },
                  { id: 'crystals', name: 'Quartz Geode', key: 'showCrystals' as const, color: '#c084fc' },
                ].map((plant) => (
                  <div
                    key={plant.id}
                    className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-xl flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: plant.color }} />
                        <span className="text-xs font-medium text-slate-200">{plant.name}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={config[plant.key]}
                        onChange={(e) =>
                          onChangeConfig((p) => ({ ...p, [plant.key]: e.target.checked }))
                        }
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                      />
                    </div>
                    <button
                      onClick={() => onOpenInspector(plant.id)}
                      className="text-[10px] text-slate-400 hover:text-emerald-300 text-left transition-colors flex items-center gap-1"
                    >
                      <Info className="w-2.5 h-2.5" />
                      <span>Inspect</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Bioluminescence & Hydration Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Fungal Bioluminescence Glow:</span>
                    <span className="font-mono text-emerald-400">{Math.round(config.bioluminescence * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.0"
                    step="0.05"
                    value={config.bioluminescence}
                    onChange={(e) =>
                      onChangeConfig((p) => ({ ...p, bioluminescence: parseFloat(e.target.value) }))
                    }
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Soil Hydration:</span>
                    <span className="font-mono text-cyan-400">{Math.round(config.floraHydration * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={config.floraHydration}
                    onChange={(e) =>
                      onChangeConfig((p) => ({ ...p, floraHydration: parseFloat(e.target.value) }))
                    }
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 4: VESSEL & LID                                           */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'vessel' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-300 font-medium mr-2">Vessel Architecture:</span>
                {[
                  { id: 'bell_jar', label: 'Classic Bell Jar' },
                  { id: 'wardian_case', label: 'Wardian Case' },
                  { id: 'geometric_prism', label: 'Geometric Prism' },
                  { id: 'cylinder', label: 'Borosilicate Cylinder' },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => onChangeConfig((p) => ({ ...p, vesselType: v.id as VesselType }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      config.vesselType === v.id
                        ? 'bg-purple-950/80 text-purple-300 border-purple-500/60'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              {/* Lid Position and Glass Tint */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <div className="flex justify-between items-center text-xs text-slate-300 mb-1">
                    <span>Glass Lid Lift Height:</span>
                    <button
                      onClick={() =>
                        onChangeConfig((p) => ({
                          ...p,
                          lidOpen: !p.lidOpen,
                          lidProgress: p.lidOpen ? 0 : 1
                        }))
                      }
                      className="text-[10px] text-purple-400 hover:text-purple-300 font-medium"
                    >
                      {config.lidProgress > 0.05 ? 'Close Lid' : 'Lift Lid Off'}
                    </button>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.0"
                    step="0.02"
                    value={config.lidProgress}
                    onChange={(e) =>
                      onChangeConfig((p) => ({
                        ...p,
                        lidProgress: parseFloat(e.target.value),
                        lidOpen: parseFloat(e.target.value) > 0.05
                      }))
                    }
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                  />
                </div>

                <div>
                  <span className="text-xs text-slate-300 block mb-1">Glass Formulation Tint:</span>
                  <div className="flex items-center gap-2">
                    {[
                      { id: 'clear', label: 'Clear Crystal' },
                      { id: 'emerald', label: 'Seafoam Emerald' },
                      { id: 'amber', label: 'Vintage Amber' },
                      { id: 'smoke', label: 'Smoked Quartz' },
                    ].map((tint) => (
                      <button
                        key={tint.id}
                        onClick={() =>
                          onChangeConfig((p) => ({ ...p, glassTint: tint.id as TerrariumConfig['glassTint'] }))
                        }
                        className={`flex-1 py-1 rounded text-[11px] border text-center transition-colors ${
                          config.glassTint === tint.id
                            ? 'bg-slate-800 text-purple-300 border-purple-400'
                            : 'bg-slate-850 hover:bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {tint.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 5: AUDIO SOUNDSCAPE                                       */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'audio' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      onChangeConfig((p) => ({ ...p, audioEnabled: !p.audioEnabled }))
                    }
                    className={`p-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                      config.audioEnabled
                        ? 'bg-blue-600 text-white border-blue-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {config.audioEnabled ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                    <span>{config.audioEnabled ? 'Sound Enabled' : 'Audio Muted'}</span>
                  </button>

                  <span className="text-xs text-slate-400">
                    100% Procedural Web Audio Synthesis (zero external files)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-300">Volume:</span>
                  <input
                    type="range"
                    min="0"
                    max="1.0"
                    step="0.05"
                    value={config.audioVolume}
                    disabled={!config.audioEnabled}
                    onChange={(e) =>
                      onChangeConfig((p) => ({ ...p, audioVolume: parseFloat(e.target.value) }))
                    }
                    className="w-28 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-400 disabled:opacity-40"
                  />
                  <span className="font-mono text-xs text-slate-400 w-8">
                    {Math.round(config.audioVolume * 100)}%
                  </span>
                </div>
              </div>

              {/* Synthesized sound layers indicator */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-800/80 border border-slate-700/60 p-2.5 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Rain & Drops</span>
                  <span className="font-medium text-blue-300">
                    {config.weather === 'rain' || config.weather === 'storm' ? 'Active Pink Noise' : 'Inactive'}
                  </span>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/60 p-2.5 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Atmospheric Breeze</span>
                  <span className="font-medium text-teal-300">Active (Bandpass Filter)</span>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/60 p-2.5 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Daytime Songbirds</span>
                  <span className="font-medium text-amber-300">
                    {config.timeOfDay >= 6 && config.timeOfDay <= 18 && config.weather === 'clear'
                      ? 'Chirping'
                      : 'Silent'}
                  </span>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/60 p-2.5 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Nocturnal Crickets</span>
                  <span className="font-medium text-emerald-300">
                    {config.timeOfDay < 5.5 || config.timeOfDay > 19.5 ? 'Active Stridulation' : 'Silent'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 6: CAMERA PRESETS & NAVIGATION                            */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'camera' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-300 font-medium mr-2">Cinematic Angle:</span>
                {[
                  { id: 'default', label: 'Orbital Overview' },
                  { id: 'closeup', label: 'Macro Flora Close-Up' },
                  { id: 'topdown', label: 'Canopy Bird\'s-Eye' },
                  { id: 'ground', label: 'Forest Floor Macro' },
                ].map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => onSelectCamera(cam.id as CameraPreset)}
                    className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <Compass className="w-3.5 h-3.5 text-rose-400" />
                    <span>{cam.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs text-slate-300 flex items-center justify-between">
                <span>Viewport Controls: Click & Drag to Orbit • Right-Click to Pan • Scroll to Zoom • Click Plant to Inspect</span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">60 FPS Damped Motion</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
