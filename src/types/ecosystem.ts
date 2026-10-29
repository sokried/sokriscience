export type TrophicLevel = 'producer' | 'primary' | 'secondary' | 'tertiary';

export type EcosystemMode = 'food_chain' | 'food_web';

export interface OrganismBio {
  id: string;
  name: string;
  scientificName: string;
  level: TrophicLevel;
  levelKorean: string;
  emoji: string;
  color: string;
  badgeBg: string;
  // Real scientific stats
  avgLifespanMonths: number;
  lifespanDisplay: string;
  reproductionRate: string;
  reproductionFactor: number; // birth potential multiplier
  deathRateFactor: number;
  dietDescription: string;
  dailyIntakeDisplay: string;
  habitat: string;
  curriculumFact: string; // 4th grade science textbook concept
  defaultInitialCount: number;
  minCount: number;
  maxCount: number;
  consumptionPerTick: number; // how much food it eats per step
  biomassValue: number; // energy it provides when consumed
}

export interface FoodWebLink {
  fromId: string; // Prey (먹이)
  toId: string;   // Predator (포식자)
}

export interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  elapsedSeconds: number;
  speed: number;
  populations: Record<string, number>;
  history: Array<{
    time: number;
    populations: Record<string, number>;
  }>;
  logs: Array<{
    id: string;
    time: number;
    message: string;
    type: 'birth' | 'death' | 'predation' | 'alert' | 'balance';
  }>;
  balanceScore: number; // 0 to 100
  gameOverReason: string;
}

export interface LeaderboardRecord {
  id: string;
  sheetRowIndex?: number;
  playerName: string;
  schoolGrade?: string;
  mode: EcosystemMode;
  modeKorean: string;
  organismsSummary: string;
  survivalSeconds: number;
  formattedTime: string;
  balanceScore: number;
  createdAt: string;
}
