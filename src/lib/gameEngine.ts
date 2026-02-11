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

export interface PossessionResult {
  pts: number;
  log: string;
  shooterId: string;
  isHome: boolean;
}

export const createPlayer = (data: any, teamName: string): Player => ({
  ...data,
  team: teamName,
  currentStamina: data.params.stamina,
});

export const simulatePossession = (
  offense: Player[],
  defense: Player[],
  isHomeOffense: boolean
): PossessionResult => {
  // Select shooter based on scoring power and current stamina
  const shooterIndex = weightedRandom(offense.map(p => 
    p.params.scoring * (0.5 + 0.5 * (p.currentStamina / p.params.stamina))
  ));
  const shooter = offense[shooterIndex];
  
  // Select defender
  const defender = defense[Math.floor(Math.random() * defense.length)];
  
  // Decide 2pt or 3pt (based on pos for now)
  const isThree = shooter.pos.includes('G') ? Math.random() < 0.45 : Math.random() < 0.15;
  const baseProb = isThree ? 0.35 : 0.48;
  
  // Success probability logic
  const staminaFactor = 0.8 + 0.2 * (shooter.currentStamina / shooter.params.stamina);
  const diff = (shooter.params.scoring - defender.params.defense) * 0.004;
  const prob = Math.max(0.15, Math.min(0.75, (baseProb + diff) * staminaFactor));
  
  const success = Math.random() < prob;
  const pts = success ? (isThree ? 3 : 2) : 0;
  
  const log = `[${shooter.team}] ${shooter.name} の ${isThree ? '3pt' : '2pt'} シュート... ${success ? '成功！ (+' + pts + ')' : '外れた'}`;
  
  return { pts, log, shooterId: shooter.id, isHome: isHomeOffense };
};

export const handleRebound = (
  offense: Player[],
  defense: Player[]
): { isOffensive: boolean; player: Player } => {
  // Simple rebound logic: higher defense param = better rebounder
  const offenseWeights = offense.map(p => p.params.defense * 0.3);
  const defenseWeights = defense.map(p => p.params.defense * 0.7);
  
  const totalOffense = offenseWeights.reduce((a, b) => a + b, 0);
  const totalDefense = defenseWeights.reduce((a, b) => a + b, 0);
  
  const isOffensive = Math.random() < (totalOffense / (totalOffense + totalDefense));
  
  if (isOffensive) {
    const idx = weightedRandom(offenseWeights);
    return { isOffensive: true, player: offense[idx] };
  } else {
    const idx = weightedRandom(defenseWeights);
    return { isOffensive: false, player: defense[idx] };
  }
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
