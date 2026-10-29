import { OrganismBio, FoodWebLink, SimulationState } from '../types/ecosystem';
import { ORGANISMS } from '../data/organisms';

export interface StepResult {
  nextPopulations: Record<string, number>;
  newLogs: Array<{
    id: string;
    time: number;
    message: string;
    type: 'birth' | 'death' | 'predation' | 'alert' | 'balance';
  }>;
  balanceScore: number;
  isGameOver: boolean;
  gameOverReason: string;
}

/**
 * Calculates one simulation step (dt in seconds, e.g. 0.1s or 0.2s).
 */
export function simulateStep(
  currentPopulations: Record<string, number>,
  selectedOrganismIds: string[],
  activeLinks: FoodWebLink[],
  elapsedSeconds: number,
  dt: number
): StepResult {
  const nextPopulations: Record<string, number> = { ...currentPopulations };
  const newLogs: StepResult['newLogs'] = [];

  // Group active organisms by trophic level
  const activeOrganisms = selectedOrganismIds.map((id) => ORGANISMS[id]).filter(Boolean);
  const producers = activeOrganisms.filter((o) => o.level === 'producer');
  const primaries = activeOrganisms.filter((o) => o.level === 'primary');
  const secondaries = activeOrganisms.filter((o) => o.level === 'secondary');
  const tertiaries = activeOrganisms.filter((o) => o.level === 'tertiary');

  // Total biomass per level
  const totalProducerPop = producers.reduce((acc, o) => acc + (currentPopulations[o.id] || 0), 0);
  const totalPrimaryPop = primaries.reduce((acc, o) => acc + (currentPopulations[o.id] || 0), 0);
  const totalSecondaryPop = secondaries.reduce((acc, o) => acc + (currentPopulations[o.id] || 0), 0);
  const totalTertiaryPop = tertiaries.reduce((acc, o) => acc + (currentPopulations[o.id] || 0), 0);

  // 1. Process Producers (Plants)
  // Logistic carrying capacity (sunlight and space limit)
  const maxProducerCapacity = 1600;
  for (const p of producers) {
    const pop = currentPopulations[p.id] || 0;
    if (pop <= 0) {
      nextPopulations[p.id] = 0;
      continue;
    }

    // Growth rate slows as capacity fills
    const spaceFactor = Math.max(0, 1 - totalProducerPop / maxProducerCapacity);
    const growth = pop * p.reproductionFactor * spaceFactor * dt * 0.8;
    const naturalDeath = pop * p.deathRateFactor * dt * 0.5;

    let updated = pop + growth - naturalDeath;
    nextPopulations[p.id] = Math.max(0, updated);
  }

  // Helper: Find valid preys for an organism
  const getPreysFor = (predatorId: string) => {
    return activeLinks.filter((link) => link.toId === predatorId).map((link) => link.fromId);
  };

  // 2. Process Primary Consumers (Herbivores)
  for (const pri of primaries) {
    const pop = currentPopulations[pri.id] || 0;
    if (pop <= 0) {
      nextPopulations[pri.id] = 0;
      continue;
    }

    const preyIds = getPreysFor(pri.id);
    let totalFoodAvailable = 0;
    for (const preyId of preyIds) {
      totalFoodAvailable += currentPopulations[preyId] || 0;
    }

    // Required food per second (scaled for gentle real-time simulation)
    const foodNeeded = pop * pri.consumptionPerTick * dt * 0.18;
    const foodSatisfaction = totalFoodAvailable > 0 ? Math.min(1.4, totalFoodAvailable / Math.max(1, foodNeeded * 6)) : 0;

    // Eat from preys proportionally
    if (totalFoodAvailable > 0 && foodNeeded > 0) {
      for (const preyId of preyIds) {
        const preyPop = currentPopulations[preyId] || 0;
        const proportion = preyPop / totalFoodAvailable;
        const eaten = Math.min(preyPop, foodNeeded * proportion * 0.85);
        nextPopulations[preyId] = Math.max(0, (nextPopulations[preyId] || 0) - eaten);
      }
    }

    // Births and deaths based on food satisfaction
    let birthRate = pri.reproductionFactor * (foodSatisfaction > 0.8 ? 0.75 : foodSatisfaction * 0.5);
    let deathRate = pri.deathRateFactor * 0.5;
    if (foodSatisfaction < 0.4) {
      // Gradual starvation
      deathRate += (0.4 - foodSatisfaction) * 0.2;
    }

    const births = pop * birthRate * dt * 0.5;
    const deaths = pop * deathRate * dt * 0.45;
    nextPopulations[pri.id] = Math.max(0, pop + births - deaths);

    if (foodSatisfaction < 0.25 && Math.random() < 0.04) {
      newLogs.push({
        id: `${pri.id}-starve-${Date.now()}`,
        time: elapsedSeconds,
        message: `${pri.name}의 먹이가 부족하여 개체 수가 감소하고 있습니다!`,
        type: 'alert',
      });
    }
  }

  // 3. Process Secondary Consumers (Carnivores / Insectivores)
  for (const sec of secondaries) {
    const pop = currentPopulations[sec.id] || 0;
    if (pop <= 0) {
      nextPopulations[sec.id] = 0;
      continue;
    }

    const preyIds = getPreysFor(sec.id);
    let totalFoodAvailable = 0;
    for (const preyId of preyIds) {
      totalFoodAvailable += currentPopulations[preyId] || 0;
    }

    const foodNeeded = pop * sec.consumptionPerTick * dt * 0.12;
    const foodSatisfaction = totalFoodAvailable > 0 ? Math.min(1.3, totalFoodAvailable / Math.max(1, foodNeeded * 4)) : 0;

    if (totalFoodAvailable > 0 && foodNeeded > 0) {
      for (const preyId of preyIds) {
        const preyPop = currentPopulations[preyId] || 0;
        const proportion = preyPop / totalFoodAvailable;
        const eaten = Math.min(preyPop, foodNeeded * proportion * 0.35);
        nextPopulations[preyId] = Math.max(0, (nextPopulations[preyId] || 0) - eaten);
      }
    }

    let birthRate = sec.reproductionFactor * (foodSatisfaction > 0.7 ? 0.65 : foodSatisfaction * 0.4);
    let deathRate = sec.deathRateFactor * 0.45;
    if (foodSatisfaction < 0.35) {
      deathRate += (0.35 - foodSatisfaction) * 0.25;
    }

    const births = pop * birthRate * dt * 0.45;
    const deaths = pop * deathRate * dt * 0.4;
    nextPopulations[sec.id] = Math.max(0, pop + births - deaths);
  }

  // 4. Process Tertiary Consumers (Apex Predators - if any)
  for (const ter of tertiaries) {
    const pop = currentPopulations[ter.id] || 0;
    if (pop <= 0) {
      nextPopulations[ter.id] = 0;
      continue;
    }

    const preyIds = getPreysFor(ter.id);
    let totalFoodAvailable = 0;
    for (const preyId of preyIds) {
      totalFoodAvailable += currentPopulations[preyId] || 0;
    }

    const foodNeeded = pop * ter.consumptionPerTick * dt * 0.08;
    const foodSatisfaction = totalFoodAvailable > 0 ? Math.min(1.3, totalFoodAvailable / Math.max(1, foodNeeded * 3)) : 0;

    if (totalFoodAvailable > 0 && foodNeeded > 0) {
      for (const preyId of preyIds) {
        const preyPop = currentPopulations[preyId] || 0;
        const proportion = preyPop / totalFoodAvailable;
        const eaten = Math.min(preyPop, foodNeeded * proportion * 0.2);
        nextPopulations[preyId] = Math.max(0, (nextPopulations[preyId] || 0) - eaten);
      }
    }

    let birthRate = ter.reproductionFactor * (foodSatisfaction > 0.6 ? 0.55 : foodSatisfaction * 0.3);
    let deathRate = ter.deathRateFactor * 0.4;
    if (foodSatisfaction < 0.35) {
      deathRate += (0.35 - foodSatisfaction) * 0.2;
    }

    const births = pop * birthRate * dt * 0.4;
    const deaths = pop * deathRate * dt * 0.35;
    nextPopulations[ter.id] = Math.max(0, pop + births - deaths);
  }

  // 5. Check Extinction and Game Over conditions
  // In Grade 4 science, ecosystem balance collapses if any mandatory trophic tier is extinguished.
  let isGameOver = false;
  let gameOverReason = '';

  const finalProducerTotal = producers.reduce((acc, o) => acc + nextPopulations[o.id], 0);
  const finalPrimaryTotal = primaries.reduce((acc, o) => acc + nextPopulations[o.id], 0);
  const finalSecondaryTotal = secondaries.reduce((acc, o) => acc + nextPopulations[o.id], 0);
  const finalTertiaryTotal = tertiaries.reduce((acc, o) => acc + nextPopulations[o.id], 0);

  if (producers.length > 0 && finalProducerTotal < 1) {
    isGameOver = true;
    gameOverReason = '생산자(식물)가 모두 고갈되어 1차 소비자가 굶주리게 되면서 생태계 평형이 완전히 파괴되었습니다.';
  } else if (primaries.length > 0 && finalPrimaryTotal < 1) {
    isGameOver = true;
    gameOverReason = '1차 소비자(초식동물)가 전멸하여 2차 소비자의 먹이가 사라지고, 생산자만 과잉 번식하여 생태계 균형이 깨졌습니다.';
  } else if (secondaries.length > 0 && finalSecondaryTotal < 1) {
    isGameOver = true;
    gameOverReason = '2차 소비자가 멸종하여 1차 소비자의 천적이 사라졌고, 초식동물이 급증하여 식물이 남아나지 않게 되었습니다.';
  } else if (tertiaries.length > 0 && finalTertiaryTotal < 0.5) {
    isGameOver = true;
    gameOverReason = '최상위 3차 소비자가 멸종하여 상위 조절자가 사라지고 생태계 질서가 무너졌습니다.';
  }

  // 6. Calculate Balance Score (0~100)
  // According to 4th grade science ecological pyramid:
  // Ideal ratio is roughly Producer (~65-75%) > Primary (~20-25%) > Secondary (~5-10%) > Tertiary (~1-3%)
  const grandTotal = finalProducerTotal + finalPrimaryTotal + finalSecondaryTotal + finalTertiaryTotal;
  let balanceScore = 0;

  if (grandTotal > 0 && !isGameOver) {
    const prodRatio = finalProducerTotal / grandTotal;
    const primRatio = finalPrimaryTotal / grandTotal;
    const secRatio = finalSecondaryTotal / grandTotal;
    const terRatio = finalTertiaryTotal / grandTotal;

    // Pyramid structure check: Producers > Primaries > Secondaries > Tertiaries
    let penalty = 0;
    if (finalProducerTotal <= finalPrimaryTotal) penalty += 35;
    if (finalPrimaryTotal <= finalSecondaryTotal) penalty += 30;
    if (tertiaries.length > 0 && finalSecondaryTotal <= finalTertiaryTotal) penalty += 25;

    // Ideal proportion penalties
    if (prodRatio < 0.45) penalty += 20;
    if (primRatio > 0.45) penalty += 20;

    balanceScore = Math.max(10, Math.min(100, Math.round(100 - penalty)));
  }

  return {
    nextPopulations,
    newLogs,
    balanceScore,
    isGameOver,
    gameOverReason,
  };
}

/**
 * Formats elapsed seconds to MM:SS.SS
 */
export function formatSimulationTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  const millis = Math.floor((totalSeconds % 1) * 100);

  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  const ms = String(millis).padStart(2, '0');

  return `${mm}:${ss}.${ms}`;
}
