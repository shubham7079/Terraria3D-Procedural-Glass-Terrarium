export type VesselType = 'bell_jar' | 'wardian_case' | 'geometric_prism' | 'cylinder';

export type WeatherType = 'clear' | 'mist' | 'rain' | 'storm' | 'snow';

export type CameraPreset = 'default' | 'closeup' | 'topdown' | 'ground';

export interface PlantSpeciesInfo {
  id: string;
  commonName: string;
  scientificName: string;
  family: string;
  origin: string;
  humidityNeeds: string;
  lightNeeds: string;
  description: string;
  color: string;
}

export interface TerrariumConfig {
  vesselType: VesselType;
  lidOpen: boolean;
  lidProgress: number; // 0 (closed) to 1 (fully open)
  glassTint: 'clear' | 'emerald' | 'amber' | 'smoke';
  condensation: number; // 0 to 1
  
  // Day / Night
  timeOfDay: number; // 0 to 24 hours (e.g. 12 = noon, 0 = midnight, 6 = dawn, 18 = dusk)
  autoCycleTime: boolean;
  timeSpeed: number; // multiplier
  
  // Weather
  weather: WeatherType;
  weatherIntensity: number; // 0 to 1
  
  // Flora & Ecosystem
  showFerns: boolean;
  showSucculents: boolean;
  showMushrooms: boolean;
  showMonstera: boolean;
  showMoss: boolean;
  showCrystals: boolean;
  bioluminescence: number; // 0 to 1 (emissive glow)
  floraHydration: number; // 0 to 1 (watering increases this)
  seed: number;
  
  // Audio
  audioEnabled: boolean;
  audioVolume: number; // 0 to 1
}

export const PLANT_SPECIES: Record<string, PlantSpeciesInfo> = {
  ferns: {
    id: 'ferns',
    commonName: 'Miniature Boston Fern',
    scientificName: 'Nephrolepis exaltata pumila',
    family: 'Lomariopsidaceae',
    origin: 'Tropical Americas & West Indies',
    humidityNeeds: 'High (70% - 90%)',
    lightNeeds: 'Dappled / Medium indirect light',
    description: 'Graceful arching fronds with delicate pinnate leaflets. Thrives in the moisture-sealed microclimate of enclosed glass terrariums.',
    color: '#34d399'
  },
  succulents: {
    id: 'succulents',
    commonName: 'Ghost Echeveria',
    scientificName: 'Echeveria lilacina',
    family: 'Crassulaceae',
    origin: 'Nuevo León, Mexico',
    humidityNeeds: 'Low to Moderate with good airflow',
    lightNeeds: 'Bright indirect to partial direct sun',
    description: 'Chalky pale lilac-silver fleshy spoon-shaped leaves arranged in a geometric Fibonacci rosette spiral with delicate pink tips.',
    color: '#a7f3d0'
  },
  monstera: {
    id: 'monstera',
    commonName: 'Mini Swiss Cheese Plant',
    scientificName: 'Rhaphidophora tetrasperma',
    family: 'Araceae',
    origin: 'Southern Thailand & Malaysia',
    humidityNeeds: 'High (60% - 85%)',
    lightNeeds: 'Bright indirect light',
    description: 'Lush tropical climbing vine with dramatic fenestrations (natural leaf splits) that optimize light gathering in dense jungle canopies.',
    color: '#10b981'
  },
  mushrooms: {
    id: 'mushrooms',
    commonName: 'Bioluminescent Ghost Fungus',
    scientificName: 'Mycena chlorophos',
    family: 'Mycenaceae',
    origin: 'Subtropical East Asia & Australasia',
    humidityNeeds: 'Very High (80% - 95%)',
    lightNeeds: 'Low ambient / Deep canopy shade',
    description: 'Rare bioluminescent basidiomycete fungus that emits a ghostly green-cyan radiance via luciferin oxidation under nocturnal conditions.',
    color: '#6ee7b7'
  },
  moss: {
    id: 'moss',
    commonName: 'Velvet Cushion Moss',
    scientificName: 'Leucobryum glaucum',
    family: 'Leucobryaceae',
    origin: 'Temperate and Montane Holarctic',
    humidityNeeds: 'Consistently Moist / High Humidity',
    lightNeeds: 'Gentle indirect shade',
    description: 'Dense dome-shaped cushions of microscopic phyllids forming lush emerald micro-carpets that naturally filter terrarium humidity.',
    color: '#22c55e'
  },
  crystals: {
    id: 'crystals',
    commonName: 'Raw Amethyst & Quartz Geode',
    scientificName: 'Silicon Dioxide (SiO₂)',
    family: 'Silicate Mineral Specimen',
    origin: 'Hydrothermal Basalt Vugs',
    humidityNeeds: 'Inert / Non-reactive',
    lightNeeds: 'Translucent optical refraction',
    description: 'Hexagonal prismatic quartz crystals exhibiting delicate violet-indigo hue from iron irradiation, acting as a grounding mineral anchor.',
    color: '#c084fc'
  }
};
