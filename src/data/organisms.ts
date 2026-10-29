import { OrganismBio, TrophicLevel } from '../types/ecosystem';

export const ORGANISMS: Record<string, OrganismBio> = {
  // === 생산자 (Producers) ===
  grass: {
    id: 'grass',
    name: '풀 (잔디·토끼풀)',
    scientificName: 'Trifolium repens / Poaceae',
    level: 'producer',
    levelKorean: '생산자',
    emoji: '🌱',
    color: '#22c55e',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    avgLifespanMonths: 12,
    lifespanDisplay: '약 1~2년 (계절 순환 다년생)',
    reproductionRate: '연중 광합성 및 땅속줄기·씨앗 번식 (매우 빠름)',
    reproductionFactor: 0.22,
    deathRateFactor: 0.05,
    dietDescription: '햇빛(태양 에너지), 물, 이산화탄소를 이용한 광합성',
    dailyIntakeDisplay: '광합성으로 유기물(양분) 스스로 합성',
    habitat: '초원, 들판, 숲 가장자리',
    curriculumFact: '햇빛을 받아 스스로 양분을 만드는 생물로, 모든 먹이 피라미드의 든든한 밑바탕이 됩니다.',
    defaultInitialCount: 500,
    minCount: 50,
    maxCount: 1500,
    consumptionPerTick: 0,
    biomassValue: 1.0,
  },
  fruit_tree: {
    id: 'fruit_tree',
    name: '과일나무 (사과·도토리)',
    scientificName: 'Malus domestica / Quercus',
    level: 'producer',
    levelKorean: '생산자',
    emoji: '🌳',
    color: '#16a34a',
    badgeBg: 'bg-green-100 text-green-800 border-green-300',
    avgLifespanMonths: 360,
    lifespanDisplay: '약 25~40년 (장수 목본류)',
    reproductionRate: '봄 개화 후 가을 열매 결실 및 씨앗 번식 (안정적)',
    reproductionFactor: 0.16,
    deathRateFactor: 0.03,
    dietDescription: '깊은 뿌리로 수분 흡수 및 광합성',
    dailyIntakeDisplay: '태양광을 흡수하여 잎과 열매 영양분 생산',
    habitat: '온대 산림, 과수원',
    curriculumFact: '줄기와 뿌리에 영양분을 비축하며 다람쥐 등에게 풍부한 열매와 보금자리를 제공합니다.',
    defaultInitialCount: 400,
    minCount: 50,
    maxCount: 1200,
    consumptionPerTick: 0,
    biomassValue: 1.4,
  },
  bamboo: {
    id: 'bamboo',
    name: '대나무',
    scientificName: 'Phyllostachys bambusoides',
    level: 'producer',
    levelKorean: '생산자',
    emoji: '🎋',
    color: '#059669',
    badgeBg: 'bg-teal-100 text-teal-800 border-teal-300',
    avgLifespanMonths: 120,
    lifespanDisplay: '약 10~15년 (지하경 번식)',
    reproductionRate: '지하경(땅속줄기)으로 죽순이 하루 최대 50cm씩 성장 (폭발적 증식)',
    reproductionFactor: 0.25,
    deathRateFactor: 0.04,
    dietDescription: '강한 뿌리계와 높은 광합성 효율',
    dailyIntakeDisplay: '일조량과 강수량으로 빠른 신진대사 유지',
    habitat: '아열대 및 온대 대나무 숲',
    curriculumFact: '지하경을 통해 넓은 면적으로 퍼져나가며 우수한 바이오매스를 자랑합니다.',
    defaultInitialCount: 450,
    minCount: 50,
    maxCount: 1400,
    consumptionPerTick: 0,
    biomassValue: 1.1,
  },

  // === 1차 소비자 (Primary Consumers) ===
  rabbit: {
    id: 'rabbit',
    name: '토끼 (멧토끼)',
    scientificName: 'Lepus coreanus',
    level: 'primary',
    levelKorean: '1차 소비자 (초식)',
    emoji: '🐇',
    color: '#38bdf8',
    badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
    avgLifespanMonths: 72,
    lifespanDisplay: '야생 약 4~7년',
    reproductionRate: '임신기간 약 30일, 연 4~6회 번식 (1회당 4~8마리 출산)',
    reproductionFactor: 0.20,
    deathRateFactor: 0.08,
    dietDescription: '풀의 부드러운 잎, 줄기, 뿌리, 어린 나뭇가지',
    dailyIntakeDisplay: '하루 체중의 약 15~20% 분량의 풀 섭취',
    habitat: '들판, 야산, 풀숲 은신처',
    curriculumFact: '대표적인 1차 소비자로 번식력이 매우 뛰어나 육식 동물들의 주된 먹이가 됩니다.',
    defaultInitialCount: 120,
    minCount: 10,
    maxCount: 400,
    consumptionPerTick: 1.6,
    biomassValue: 3.5,
  },
  grasshopper: {
    id: 'grasshopper',
    name: '메뚜기 (풀무치)',
    scientificName: 'Locusta migratoria',
    level: 'primary',
    levelKorean: '1차 소비자 (초식 곤충)',
    emoji: '🦗',
    color: '#84cc16',
    badgeBg: 'bg-lime-100 text-lime-800 border-lime-300',
    avgLifespanMonths: 6,
    lifespanDisplay: '약 4~6개월 (성충 2~3개월)',
    reproductionRate: '가을에 땅속에 100~200개 알 산란 (높은 증식 잠재력)',
    reproductionFactor: 0.28,
    deathRateFactor: 0.14,
    dietDescription: '벼과 식물의 잎과 줄기를 왕성하게 갉아먹음',
    dailyIntakeDisplay: '자기 몸무게만큼의 신선한 풀을 매일 섭취',
    habitat: '논둑, 초원, 풀밭',
    curriculumFact: '개체 수가 급증하면 풀을 순식간에 고갈시킬 수 있어 개구리 등의 천적이 꼭 필요합니다.',
    defaultInitialCount: 180,
    minCount: 10,
    maxCount: 600,
    consumptionPerTick: 0.9,
    biomassValue: 1.5,
  },
  squirrel: {
    id: 'squirrel',
    name: '다람쥐 (청설모)',
    scientificName: 'Tamias sibiricus',
    level: 'primary',
    levelKorean: '1차 소비자 (열매·씨앗 채식)',
    emoji: '🐿️',
    color: '#f97316',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    avgLifespanMonths: 60,
    lifespanDisplay: '야생 약 4~6년',
    reproductionRate: '연 1~2회 번식 (1회당 3~5마리 출산)',
    reproductionFactor: 0.15,
    deathRateFactor: 0.07,
    dietDescription: '도토리, 밤, 식물의 씨앗, 나무 열매, 어린 싹',
    dailyIntakeDisplay: '하루에 씨앗·도토리 약 50~100g 섭취 및 은닉',
    habitat: '활엽수림 및 침엽수림 활엽 혼효림',
    curriculumFact: '도토리를 땅에 묻어 숨겨두는 습성이 있어 숲의 나무가 널리 번식하는 데도 기여합니다.',
    defaultInitialCount: 100,
    minCount: 10,
    maxCount: 350,
    consumptionPerTick: 1.3,
    biomassValue: 3.2,
  },

  // === 2차 소비자 (Secondary Consumers) ===
  frog: {
    id: 'frog',
    name: '개구리 (참개구리)',
    scientificName: 'Pelophylax nigromaculatus',
    level: 'secondary',
    levelKorean: '2차 소비자 (식충성)',
    emoji: '🐸',
    color: '#10b981',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    avgLifespanMonths: 60,
    lifespanDisplay: '야생 약 4~6년',
    reproductionRate: '봄철 물가에 1,000~2,000개 알 산란 (올챙이 생존율 보통)',
    reproductionFactor: 0.16,
    deathRateFactor: 0.08,
    dietDescription: '살아있는 메뚜기, 파리, 나방, 딱정벌레 등 소형 곤충',
    dailyIntakeDisplay: '하루에 소형 곤충 약 10~20마리 사냥',
    habitat: '습지, 논, 물가 풀숲',
    curriculumFact: '해충 곤충의 개체 수를 적절하게 조절해 주며, 뱀과 왜가리 등의 먹이가 되는 중간 다리입니다.',
    defaultInitialCount: 45,
    minCount: 5,
    maxCount: 150,
    consumptionPerTick: 1.8,
    biomassValue: 5.0,
  },
  mantis: {
    id: 'mantis',
    name: '사마귀 (왕사마귀)',
    scientificName: 'Tenodera angustipennis',
    level: 'secondary',
    levelKorean: '2차 소비자 (육식 곤충)',
    emoji: '🦗',
    color: '#84cc16',
    badgeBg: 'bg-lime-100 text-lime-800 border-lime-300',
    avgLifespanMonths: 8,
    lifespanDisplay: '약 7~9개월 (1년생 곤충)',
    reproductionRate: '가을에 알집(난낭) 하나에 200~400개 알 산란',
    reproductionFactor: 0.20,
    deathRateFactor: 0.13,
    dietDescription: '앞다리 가시로 메뚜기, 나비, 귀뚜라미 등 포식',
    dailyIntakeDisplay: '이틀에 중형 곤충 1~2마리 섭식',
    habitat: '햇볕이 잘 드는 풀밭의 잎 위',
    curriculumFact: '풀밭의 최상위 곤충 포식자로 초식 곤충의 급증을 억제하는 중요한 역할을 합니다.',
    defaultInitialCount: 50,
    minCount: 5,
    maxCount: 160,
    consumptionPerTick: 1.4,
    biomassValue: 3.8,
  },
  snake: {
    id: 'snake',
    name: '뱀 (누룩뱀)',
    scientificName: 'Elaphe dione',
    level: 'secondary',
    levelKorean: '2차 소비자 (소형 육식 파충류)',
    emoji: '🐍',
    color: '#a855f7',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
    avgLifespanMonths: 144,
    lifespanDisplay: '야생 약 10~15년',
    reproductionRate: '초여름 10~20개 알 산란 (부화율 높음)',
    reproductionFactor: 0.11,
    deathRateFactor: 0.05,
    dietDescription: '개구리, 소형 설치류(쥐, 어린 다람쥐), 도마뱀',
    dailyIntakeDisplay: '주 1~2회 개구리나 쥐 등 통째로 소화',
    habitat: '야산, 덤불, 돌무더기, 농경지 주변',
    curriculumFact: '개구리와 쥐의 수를 안정적으로 통제하며, 독수리와 맹수들의 훌륭한 단백질 공급원입니다.',
    defaultInitialCount: 30,
    minCount: 3,
    maxCount: 100,
    consumptionPerTick: 1.6,
    biomassValue: 8.0,
  },

  // === 3차 소비자 (Tertiary Consumers / Apex) ===
  wolf: {
    id: 'wolf',
    name: '늑대',
    scientificName: 'Canis lupus',
    level: 'tertiary',
    levelKorean: '3차 소비자 (최상위 육식 포유류)',
    emoji: '🐺',
    color: '#64748b',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    avgLifespanMonths: 120,
    lifespanDisplay: '야생 약 8~12년',
    reproductionRate: '연 1회 번식 (무리 우두머리 암컷이 4~6마리 출산)',
    reproductionFactor: 0.08,
    deathRateFactor: 0.04,
    dietDescription: '토끼, 중대형 초식동물, 뱀 등',
    dailyIntakeDisplay: '하루 체중의 5~10%에 달하는 육류 섭취',
    habitat: '광활한 숲, 산악 지대, 툰드라',
    curriculumFact: '무리 지어 초식동물의 병약한 개체를 사냥하여 초식동물 무리를 건강하게 유지시킵니다.',
    defaultInitialCount: 8,
    minCount: 1,
    maxCount: 30,
    consumptionPerTick: 2.2,
    biomassValue: 15.0,
  },
  lion: {
    id: 'lion',
    name: '사자',
    scientificName: 'Panthera leo',
    level: 'tertiary',
    levelKorean: '3차 소비자 (사바나 맹수)',
    emoji: '🦁',
    color: '#eab308',
    badgeBg: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    avgLifespanMonths: 144,
    lifespanDisplay: '야생 약 10~14년',
    reproductionRate: '약 2년에 1회 번식 (1회당 2~4마리 출산)',
    reproductionFactor: 0.06,
    deathRateFactor: 0.035,
    dietDescription: '중대형 초식동물, 토끼류, 멧돼지 등',
    dailyIntakeDisplay: '하루 평균 약 5~7kg의 고기 섭취',
    habitat: '사바나 초원, 열린 관목 숲',
    curriculumFact: '먹이 피라미드의 맨 꼭대기(정점)에 위치하여 하위 소비자의 수가 지나치게 늘지 않도록 조절합니다.',
    defaultInitialCount: 6,
    minCount: 1,
    maxCount: 25,
    consumptionPerTick: 2.5,
    biomassValue: 18.0,
  },
  eagle: {
    id: 'eagle',
    name: '독수리 (검독수리)',
    scientificName: 'Aquila chrysaetos',
    level: 'tertiary',
    levelKorean: '3차 소비자 (맹금류)',
    emoji: '🦅',
    color: '#78716c',
    badgeBg: 'bg-stone-100 text-stone-800 border-stone-300',
    avgLifespanMonths: 300,
    lifespanDisplay: '야생 약 20~30년 (장수 맹금류)',
    reproductionRate: '연 1회 1~2개의 알 산란 (육추 성공률 낮음)',
    reproductionFactor: 0.05,
    deathRateFactor: 0.025,
    dietDescription: '토끼, 다람쥐, 뱀, 개구리 등 소형 척추동물',
    dailyIntakeDisplay: '하루 300~500g의 소형 동물 포식',
    habitat: '산악 절벽, 고지대 상공',
    curriculumFact: '뛰어난 시력으로 하늘에서 사냥하며, 번식률이 낮고 수명이 길어 환경 변화에 민감합니다.',
    defaultInitialCount: 8,
    minCount: 1,
    maxCount: 30,
    consumptionPerTick: 2.0,
    biomassValue: 12.0,
  },
};

export const LEVEL_ORDER: TrophicLevel[] = ['producer', 'primary', 'secondary', 'tertiary'];

export const LEVEL_INFO: Record<TrophicLevel, { name: string; description: string; color: string; badge: string }> = {
  producer: {
    name: '생산자',
    description: '햇빛과 물로 스스로 양분을 만드는 생물 (풀, 나무 등)',
    color: '#22c55e',
    badge: 'bg-emerald-500 text-white',
  },
  primary: {
    name: '1차 소비자',
    description: '생산자를 먹고 살아가는 초식 동물 (토끼, 메뚜기 등)',
    color: '#0284c7',
    badge: 'bg-sky-500 text-white',
  },
  secondary: {
    name: '2차 소비자',
    description: '1차 소비자를 먹고 살아가는 육식·식충 동물 (개구리, 사마귀, 뱀)',
    color: '#9333ea',
    badge: 'bg-purple-500 text-white',
  },
  tertiary: {
    name: '3차 소비자 (선택)',
    description: '2차 소비자를 먹거나 먹이사슬의 정점에 있는 동물 (늑대, 사자, 독수리)',
    color: '#ea580c',
    badge: 'bg-orange-500 text-white',
  },
};

export const ORGANISMS_BY_LEVEL: Record<TrophicLevel, OrganismBio[]> = {
  producer: Object.values(ORGANISMS).filter((o) => o.level === 'producer'),
  primary: Object.values(ORGANISMS).filter((o) => o.level === 'primary'),
  secondary: Object.values(ORGANISMS).filter((o) => o.level === 'secondary'),
  tertiary: Object.values(ORGANISMS).filter((o) => o.level === 'tertiary'),
};

/**
 * Validates whether a predator-prey relationship is ecologically legitimate
 * based on elementary 4th-grade science trophic hierarchy.
 * - Producers cannot be predators
 * - Primary consumers eat Producers
 * - Secondary consumers eat Primary consumers
 * - Tertiary consumers eat Secondary consumers (or certain Primary like rabbit/squirrel for apex predators)
 * - Cannot reverse (e.g., grass eating wolf, rabbit eating eagle)
 */
export function isValidTrophicLink(preyId: string, predatorId: string): boolean {
  const prey = ORGANISMS[preyId];
  const pred = ORGANISMS[predatorId];
  if (!prey || !pred) return false;

  // Cannot prey on same trophic level
  if (prey.level === pred.level) return false;

  // 1st consumer eats producer
  if (pred.level === 'primary' && prey.level === 'producer') {
    return true;
  }

  // 2nd consumer eats 1st consumer
  if (pred.level === 'secondary' && prey.level === 'primary') {
    // Specific biological sanity checks:
    // Frog eats grasshopper (yes)
    // Mantis eats grasshopper (yes)
    // Snake eats frog (secondary eats secondary? Snake is secondary/intermediate, can eat frog)
    return true;
  }

  // Snake can eat frog (cross 2nd)
  if (pred.id === 'snake' && prey.id === 'frog') {
    return true;
  }

  // 3rd consumer (wolf, lion, eagle)
  if (pred.level === 'tertiary') {
    // Wolf eats rabbit, squirrel
    // Lion eats rabbit
    // Eagle eats rabbit, snake, frog, squirrel
    if (prey.level === 'secondary') return true;
    if (prey.level === 'primary') return true;
  }

  return false;
}
