export interface PlayerParams {
  scoring: number;
  playmaking: number;
  defense: number;
  stamina: number;
}

export interface Player {
  id: string;
  name: string;
  team: string;
  pos: string;
  isForeign: boolean;
  params: PlayerParams;
  currentStamina: number;
}

export interface GameState {
  homeScore: number;
  awayScore: number;
  quarter: number;
  timeRemaining: number; // in seconds
  logs: string[];
  homeOnCourt: Player[];
  awayOnCourt: Player[];
}

export const createPlayer = (data: any): Player => ({
  ...data,
  currentStamina: data.params.stamina,
});

export const simulatePossession = (
  offense: Player[],
  defense: Player[]
): { pts: number; log: string } => {
  // Select shooter based on scoring power
  const shooterIndex = weightedRandom(offense.map(p => p.params.scoring * (p.currentStamina / p.params.stamina)));
  const shooter = offense[shooterIndex];
  
  // Select defender (random for now)
  const defender = defense[Math.floor(Math.random() * defense.length)];
  
  // Decide 2pt or 3pt (mock logic)
  const isThree = Math.random() < 0.3;
  const baseProb = isThree ? 0.33 : 0.45;
  
  // Success probability
  const staminaFactor = shooter.currentStamina / shooter.params.stamina;
  const diff = (shooter.params.scoring - defender.params.defense) * 0.005;
  const prob = Math.max(0.1, Math.min(0.8, (baseProb + diff) * staminaFactor));
  
  const success = Math.random() < prob;
  const pts = success ? (isThree ? 3 : 2) : 0;
  
  const log = `[${shooter.team}] ${shooter.name} の ${isThree ? '3pt' : '2pt'} シュート... ${success ? '成功！ (+' + pts + ')' : '失敗'}`;
  
  return { pts, log };
};

const weightedRandom = (weights: number[]): number => {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    if (r < weights[i]) return i;
    r -= weights[i];
  }
  return 0;
};
