export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type CharacterId = 'kai' | 'nova' | 'cipher' | 'volt';

export interface CharacterDef {
  id: CharacterId;
  name: string;
  tagline: string;
  gender: 'male' | 'female';
  themeColor: string;
  secondaryColor: string;
  accentHex: string;
  glowClass: string;
  avatarImage: string;
  stats: {
    speed: number;    // 1-5
    agility: number;  // 1-5 (jump & recovery)
    perkPower: number; // 1-5
  };
  specialPerk: string;
  perkDescription: string;
}

export type ScenarioId = 'road' | 'desert' | 'track' | 'forest';

export interface ScenarioDef {
  id: ScenarioId;
  name: string;
  location: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Extremo';
  themeColor: string;
  accentHex: string;
  description: string;
  hazards: string[];
  skyColors: [string, string, string];
  groundColor: string;
  laneColor: string;
}

export interface UpgradesState {
  shieldDuration: number;   // level 0 - 4
  magnetRadius: number;     // level 0 - 4
  scoreMultiplier: number;  // level 0 - 4
  boostDuration: number;    // level 0 - 4
}

export interface RunRecord {
  id: string;
  date: string;
  score: number;
  level: number;
  orbs: number;
  scenarioId: ScenarioId;
  characterId: CharacterId;
  maxCombo: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
  targetCount: number;
  currentCount: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  sfxVolume: number;
  musicVolume: number;
  showOnScreenControls: boolean;
}

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  kai: {
    id: 'kai',
    name: 'Kai',
    tagline: 'O Veloz Cibernético',
    gender: 'male',
    themeColor: 'cyan',
    secondaryColor: '#00f0ff',
    accentHex: '#00f0ff',
    glowClass: 'cyber-glow-blue',
    avatarImage: '/assets/images/char_kai_runner_1793214463622.jpg',
    stats: { speed: 4, agility: 4, perkPower: 3 },
    specialPerk: 'Impulso Hiper-Sônico',
    perkDescription: 'Aceleração de solo balanceada com arranque dinâmico em saltos.',
  },
  nova: {
    id: 'nova',
    name: 'Nova',
    tagline: 'Valkíria de Plasma',
    gender: 'female',
    themeColor: 'pink',
    secondaryColor: '#ff0055',
    accentHex: '#ff0055',
    glowClass: 'cyber-glow-pink',
    avatarImage: '/assets/images/char_nova_runner_1793214463569.jpg',
    stats: { speed: 4, agility: 5, perkPower: 4 },
    specialPerk: 'Salto Duplo Gravitacional',
    perkDescription: 'Gravidade atenuada e arco de super salto 15% mais amplo.',
  },
  cipher: {
    id: 'cipher',
    name: 'Cipher',
    tagline: 'Fantasma Hacker',
    gender: 'male',
    themeColor: 'emerald',
    secondaryColor: '#10b981',
    accentHex: '#10b981',
    glowClass: 'cyber-glow-emerald',
    avatarImage: '/assets/images/char_cipher_runner_1793214465069.jpg',
    stats: { speed: 3, agility: 4, perkPower: 5 },
    specialPerk: 'Varredura de Nano-Orbs',
    perkDescription: 'Gera +25% de orbs coletáveis e atrai orbs distantes com facilidade.',
  },
  volt: {
    id: 'volt',
    name: 'Volt',
    tagline: 'Titã Blindado',
    gender: 'female',
    themeColor: 'amber',
    secondaryColor: '#f59e0b',
    accentHex: '#f59e0b',
    glowClass: 'cyber-glow-gold',
    avatarImage: '/assets/images/char_volt_runner_1793214464827.jpg',
    stats: { speed: 3, agility: 3, perkPower: 5 },
    specialPerk: 'Escudo Cinético Inicial',
    perkDescription: 'Inicia cada corrida com 1 Escudo de Energia grátis ativo!',
  },
};

export const SCENARIOS: Record<ScenarioId, ScenarioDef> = {
  road: {
    id: 'road',
    name: 'Estrada Cibernética',
    location: 'Neo Tóquio - Setor 7',
    difficulty: 'Intermediário',
    themeColor: 'cyan',
    accentHex: '#00f0ff',
    description: 'Autoestrada futurista com hovercars em alta velocidade, cones holográficos e pontes elevadas.',
    hazards: ['Carros velozes', 'Caminhões e teto baixo', 'Cones de trânsito neon'],
    skyColors: ['#070814', '#10132b', '#1a1d3f'],
    groundColor: '#181b2a',
    laneColor: 'rgba(0, 240, 255, 0.4)',
  },
  desert: {
    id: 'desert',
    name: 'Deserto Solaris',
    location: 'Dunas de Cobre - Área 0',
    difficulty: 'Iniciante',
    themeColor: 'amber',
    accentHex: '#f59e0b',
    description: 'Vastidão árida com dunas douradas, cactos biônicos, drones de sucata e tempestades solares.',
    hazards: ['Cactos biônicos', 'Drones abutres aéreos', 'Rochas monolíticas'],
    skyColors: ['#3b1808', '#78350f', '#d97706'],
    groundColor: '#b45309',
    laneColor: 'rgba(254, 215, 170, 0.45)',
  },
  track: {
    id: 'track',
    name: 'Pista de Atletismo',
    location: 'Velódromo Apex Stadium',
    difficulty: 'Avançado',
    themeColor: 'rose',
    accentHex: '#f43f5e',
    description: 'Circuito competitivo de altíssima precisão com barreiras laser, faixas de chegada e poças sintéticas.',
    hazards: ['Barreiras olímpicas', 'Banners aéreos suspensos', 'Lâminas de água'],
    skyColors: ['#0c1926', '#1e293b', '#334155'],
    groundColor: '#991b1b',
    laneColor: 'rgba(255, 255, 255, 0.7)',
  },
  forest: {
    id: 'forest',
    name: 'Floresta Bio-Luz',
    location: 'Bosque de Silício & Hera',
    difficulty: 'Extremo',
    themeColor: 'emerald',
    accentHex: '#10b981',
    description: 'Selva densa com troncos cobertos de musgo condutor, galhos baixos e pontes quebradas sobre rios de plasma.',
    hazards: ['Troncos com musgo', 'Galhos baixos com cipós', 'Fendas de ponte quebrada'],
    skyColors: ['#06241a', '#064e3b', '#047857'],
    groundColor: '#27272a',
    laneColor: 'rgba(52, 211, 153, 0.5)',
  },
};
