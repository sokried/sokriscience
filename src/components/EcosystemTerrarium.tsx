import React, { useState, useEffect, useRef } from 'react';
import { OrganismBio, FoodWebLink, SimulationState } from '../types/ecosystem';
import { ORGANISMS, LEVEL_INFO } from '../data/organisms';
import { simulateStep, formatSimulationTime } from '../engine/simulationEngine';
import {
  Timer,
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Activity,
  AlertTriangle,
  CloudRain,
  Sun,
  Sprout,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';

interface EcosystemTerrariumProps {
  selectedOrganismIds: string[];
  initialPopulations: Record<string, number>;
  links: FoodWebLink[];
  onGameOver: (finalSeconds: number, balanceScore: number, reason: string) => void;
  onReset: () => void;
}

interface AnimatedEntity {
  id: string;
  organismId: string;
  emoji: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  bubbleText?: string;
  bubbleTimer?: number;
}

export const EcosystemTerrarium: React.FC<EcosystemTerrariumProps> = ({
  selectedOrganismIds,
  initialPopulations,
  links,
  onGameOver,
  onReset,
}) => {
  const [populations, setPopulations] = useState<Record<string, number>>({ ...initialPopulations });
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [balanceScore, setBalanceScore] = useState<number>(100);
  const [logs, setLogs] = useState<Array<{ id: string; time: number; message: string; type: string }>>([
    {
      id: 'init-1',
      time: 0,
      message: '🌱 생태계 시뮬레이션이 시작되었습니다! 스톱워치가 가동 중입니다.',
      type: 'balance',
    },
  ]);
  const [environmentEffect, setEnvironmentEffect] = useState<string | null>(null);

  // Entities for visual simulation in terrarium
  const [entities, setEntities] = useState<AnimatedEntity[]>([]);

  // Refs for animation loop
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const populationsRef = useRef<Record<string, number>>({ ...initialPopulations });
  const elapsedRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);
  const speedRef = useRef<number>(1);

  // Keep refs synchronized
  populationsRef.current = populations;
  elapsedRef.current = elapsedSeconds;
  isPausedRef.current = isPaused;
  speedRef.current = speed;

  // Initialize visual roaming entities based on selected organisms
  useEffect(() => {
    const initialEntities: AnimatedEntity[] = [];
    selectedOrganismIds.forEach((id) => {
      const org = ORGANISMS[id];
      if (!org) return;

      // Spawn representative visual sprites (clamped to realistic visual density)
      const count = Math.min(8, Math.max(2, Math.floor((initialPopulations[id] || 50) / 40)));
      for (let i = 0; i < count; i++) {
        // Place plants mostly on ground; birds high; others roaming
        let yPos = 35 + Math.random() * 55;
        if (org.id === 'eagle') yPos = 10 + Math.random() * 25;
        if (org.level === 'producer') yPos = 60 + Math.random() * 32;

        initialEntities.push({
          id: `${id}-${i}-${Math.random()}`,
          organismId: id,
          emoji: org.emoji,
          x: 5 + Math.random() * 90,
          y: yPos,
          vx: org.level === 'producer' ? 0 : (Math.random() - 0.5) * 1.5,
          vy: org.level === 'producer' ? 0 : (Math.random() - 0.5) * 1.0,
        });
      }
    });

    setEntities(initialEntities);
  }, [selectedOrganismIds]);

  // Main simulation tick loop
  useEffect(() => {
    let accumulator = 0;

    const tick = (now: number) => {
      const deltaMs = now - lastTimeRef.current;
      lastTimeRef.current = now;

      if (!isPausedRef.current) {
        const deltaSec = (deltaMs / 1000) * speedRef.current;
        accumulator += deltaSec;

        // Step physics and biology roughly every 0.2s of simulation time
        const stepDt = 0.2;
        while (accumulator >= stepDt) {
          const currentElapsed = elapsedRef.current + stepDt;
          elapsedRef.current = currentElapsed;
          setElapsedSeconds(currentElapsed);

          const result = simulateStep(
            populationsRef.current,
            selectedOrganismIds,
            links,
            currentElapsed,
            stepDt
          );

          populationsRef.current = result.nextPopulations;
          setPopulations({ ...result.nextPopulations });
          setBalanceScore(result.balanceScore);

          if (result.newLogs.length > 0) {
            setLogs((prev) => [...result.newLogs, ...prev].slice(0, 30));
          }

          if (result.isGameOver) {
            onGameOver(currentElapsed, result.balanceScore, result.gameOverReason);
            return;
          }

          accumulator -= stepDt;
        }

        // Update roaming sprite positions
        setEntities((prevEntities) => {
          return prevEntities.map((ent) => {
            const org = ORGANISMS[ent.organismId];
            if (org?.level === 'producer') {
              // Producers stay rooted, occasional gentle sway
              return ent;
            }

            let newX = ent.x + ent.vx * (deltaMs / 100);
            let newY = ent.y + ent.vy * (deltaMs / 100);
            let newVx = ent.vx;
            let newVy = ent.vy;

            // Bounce off boundaries
            if (newX < 3 || newX > 94) newVx = -newVx;
            const minY = ent.organismId === 'eagle' ? 8 : 30;
            const maxY = 90;
            if (newY < minY || newY > maxY) newVy = -newVy;

            // Occasional random directional shift
            if (Math.random() < 0.03) {
              newVx = (Math.random() - 0.5) * 1.8;
              newVy = (Math.random() - 0.5) * 1.2;
            }

            // Occasional reaction bubble
            let bubble = ent.bubbleText;
            let timer = (ent.bubbleTimer || 0) - 1;
            if (timer <= 0) {
              bubble = undefined;
              if (Math.random() < 0.008) {
                const words = ['냠냠🌿', '번식중❤️', '경계중👀', '배고파요', '신선한 풀!'];
                bubble = words[Math.floor(Math.random() * words.length)];
                timer = 40;
              }
            }

            return {
              ...ent,
              x: Math.max(3, Math.min(94, newX)),
              y: Math.max(minY, Math.min(maxY, newY)),
              vx: newVx,
              vy: newVy,
              bubbleText: bubble,
              bubbleTimer: timer,
            };
          });
        });
      }

      requestRef.current = requestAnimationFrame(tick);
    };

    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(tick);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [selectedOrganismIds, links, onGameOver]);

  // Environment Interventions
  const triggerRain = () => {
    setEnvironmentEffect('rain');
    setLogs((prev) => [
      {
        id: `rain-${Date.now()}`,
        time: elapsedSeconds,
        message: '🌧️ 단비가 내립니다! 토양이 비옥해져 생산자(식물)들의 번식력이 일시적으로 증가합니다.',
        type: 'balance',
      },
      ...prev,
    ]);

    // Boost producers
    const next = { ...populationsRef.current };
    selectedOrganismIds.forEach((id) => {
      if (ORGANISMS[id]?.level === 'producer') {
        next[id] = Math.round((next[id] || 0) * 1.35);
      }
    });
    setPopulations(next);
    setTimeout(() => setEnvironmentEffect(null), 3000);
  };

  const triggerFertilizer = () => {
    setEnvironmentEffect('fertilizer');
    setLogs((prev) => [
      {
        id: `fert-${Date.now()}`,
        time: elapsedSeconds,
        message: '🌿 천연 영양 공급! 식물들이 더욱 튼튼해져 초식동물들에게 충분한 먹이가 됩니다.',
        type: 'balance',
      },
      ...prev,
    ]);
    const next = { ...populationsRef.current };
    selectedOrganismIds.forEach((id) => {
      if (ORGANISMS[id]?.level === 'producer') {
        next[id] = (next[id] || 0) + 120;
      }
    });
    setPopulations(next);
    setTimeout(() => setEnvironmentEffect(null), 2500);
  };

  const triggerDrought = () => {
    setEnvironmentEffect('drought');
    setLogs((prev) => [
      {
        id: `drought-${Date.now()}`,
        time: elapsedSeconds,
        message: '☀️ 가뭄 발생! 생산자의 수가 감소하여 생태계 평형 유지에 큰 시험이 닥쳤습니다!',
        type: 'alert',
      },
      ...prev,
    ]);
    const next = { ...populationsRef.current };
    selectedOrganismIds.forEach((id) => {
      if (ORGANISMS[id]?.level === 'producer') {
        next[id] = Math.max(10, Math.round((next[id] || 0) * 0.65));
      }
    });
    setPopulations(next);
    setTimeout(() => setEnvironmentEffect(null), 3000);
  };

  const activeOrganisms = selectedOrganismIds.map((id) => ORGANISMS[id]).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 space-y-5">
      {/* Top Stopwatch & Control Panel */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Stopwatch display */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md animate-pulse">
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              생태계 유지 스톱워치
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
              {formatSimulationTime(elapsedSeconds)}
            </div>
          </div>
        </div>

        {/* Balance Score Meter */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-500">생태계 평형도</div>
            <div className="text-2xl font-black text-emerald-700 font-mono">
              {balanceScore}%
            </div>
          </div>

          <div className="w-24 sm:w-32 bg-slate-100 rounded-full h-3 border border-slate-200 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                balanceScore > 75
                  ? 'bg-emerald-500'
                  : balanceScore > 40
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${balanceScore}%` }}
            />
          </div>
        </div>

        {/* Speed & Pause Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer ${
              isPaused
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4" />}
            <span>{isPaused ? '계속하기' : '일시정지'}</span>
          </button>

          <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  speed === s
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              const confirmReset = window.confirm('시뮬레이션을 중단하고 처음부터 다시 설정하시겠습니까?');
              if (confirmReset) onReset();
            }}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            title="실험 중단 및 초기화"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Terrarium Arena */}
      <div className="relative w-full h-[400px] sm:h-[460px] rounded-3xl overflow-hidden border-3 border-emerald-300 shadow-lg select-none">
        {/* Natural Background Environment */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-200">
          {/* Sun / Weather */}
          <div className="absolute top-5 right-8 text-4xl animate-spin" style={{ animationDuration: '40s' }}>
            ☀️
          </div>

          {/* Floating Clouds */}
          <div className="absolute top-8 left-12 text-3xl opacity-80 animate-pulse">☁️</div>
          <div className="absolute top-14 left-1/3 text-2xl opacity-70">☁️</div>

          {/* Distant Hills */}
          <div className="absolute bottom-28 left-0 right-0 h-28 bg-emerald-300/40 rounded-t-[100%] scale-x-125" />
          <div className="absolute bottom-20 left-0 right-0 h-32 bg-emerald-400/50 rounded-t-[100%] scale-x-110" />

          {/* Lush Grass Terrain */}
          <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-emerald-700 via-emerald-600 to-emerald-500 border-t-4 border-emerald-400">
            {/* Small pond feature on the right for frogs */}
            <div className="absolute bottom-2 right-12 w-32 h-14 bg-sky-400/70 rounded-full border-2 border-sky-300/80 shadow-inner flex items-center justify-center text-xs text-sky-900 font-bold">
              💧 연못
            </div>
          </div>
        </div>

        {/* Environmental Overlay Effects */}
        {environmentEffect === 'rain' && (
          <div className="absolute inset-0 bg-sky-900/20 backdrop-blur-2xs flex items-center justify-center pointer-events-none z-20">
            <div className="text-white font-extrabold text-lg sm:text-2xl flex items-center gap-2 bg-sky-950/70 px-6 py-3 rounded-2xl shadow-xl">
              <CloudRain className="w-8 h-8 animate-bounce text-sky-300" />
              <span>생명의 단비가 내립니다! 🌱</span>
            </div>
          </div>
        )}

        {environmentEffect === 'drought' && (
          <div className="absolute inset-0 bg-amber-600/20 flex items-center justify-center pointer-events-none z-20">
            <div className="text-white font-extrabold text-lg sm:text-2xl flex items-center gap-2 bg-amber-950/70 px-6 py-3 rounded-2xl shadow-xl">
              <Sun className="w-8 h-8 text-amber-400 animate-spin" />
              <span>가뭄이 발생했습니다! 식물 주의 ⚠️</span>
            </div>
          </div>
        )}

        {environmentEffect === 'fertilizer' && (
          <div className="absolute inset-0 bg-emerald-600/15 flex items-center justify-center pointer-events-none z-20">
            <div className="text-white font-extrabold text-lg sm:text-2xl flex items-center gap-2 bg-emerald-950/70 px-6 py-3 rounded-2xl shadow-xl">
              <Sprout className="w-8 h-8 text-emerald-300 animate-bounce" />
              <span>영양 비료 공급으로 식물이 번성합니다!</span>
            </div>
          </div>
        )}

        {/* Living Animated Sprites in Habitat */}
        {entities.map((entity) => {
          const org = ORGANISMS[entity.organismId];
          const currentCount = populations[entity.organismId] || 0;
          if (currentCount <= 0) return null; // extinct

          return (
            <div
              key={entity.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 flex flex-col items-center pointer-events-none"
              style={{
                left: `${entity.x}%`,
                top: `${entity.y}%`,
              }}
            >
              {/* Reaction Speech Bubble */}
              {entity.bubbleText && (
                <div className="text-[10px] font-bold bg-white text-slate-800 px-1.5 py-0.5 rounded-md shadow-md border border-slate-200 mb-0.5 whitespace-nowrap animate-bounce">
                  {entity.bubbleText}
                </div>
              )}

              {/* Emoji Sprite */}
              <div
                className={`text-2xl sm:text-3xl select-none ${
                  entity.vx < 0 ? 'scale-x-[-1]' : ''
                }`}
              >
                {entity.emoji}
              </div>
            </div>
          );
        })}

        {/* In-Habitat HUD / Mini Stats Overlay */}
        <div className="absolute bottom-3 left-4 z-10 flex flex-wrap gap-2 pointer-events-auto">
          {activeOrganisms.map((org) => {
            const count = Math.round(populations[org.id] || 0);
            const isDanger = count < (initialPopulations[org.id] || 50) * 0.25;

            return (
              <div
                key={org.id}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold backdrop-blur-md shadow-xs border transition-colors ${
                  count <= 0
                    ? 'bg-rose-900/80 text-rose-200 border-rose-700'
                    : isDanger
                    ? 'bg-amber-900/80 text-amber-200 border-amber-600 animate-pulse'
                    : 'bg-white/90 text-slate-800 border-white/80'
                }`}
              >
                <span>{org.emoji}</span>
                <span>{org.name.split(' ')[0]}:</span>
                <span className="font-mono">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Split: Live Population Meters & Event Log & Environmental Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Population Real-time Meters (8 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>실시간 생물 개체 수 변화</span>
            </h3>
            <span className="text-xs text-slate-400">기준: 초기 개체 수 대비</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeOrganisms.map((org) => {
              const current = Math.round(populations[org.id] || 0);
              const initial = initialPopulations[org.id] || org.defaultInitialCount;
              const ratio = initial > 0 ? (current / initial) * 100 : 0;
              const isExtinct = current <= 0;

              return (
                <div
                  key={org.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isExtinct
                      ? 'bg-rose-50 border-rose-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{org.emoji}</span>
                      <span>{org.name.split(' ')[0]}</span>
                    </span>
                    <span className="font-mono font-black text-slate-900">
                      {current} / {initial}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isExtinct
                          ? 'bg-rose-600'
                          : ratio < 35
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, ratio)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                    <span>{org.levelKorean.split(' ')[0]}</span>
                    <span className={ratio > 100 ? 'text-emerald-600 font-bold' : ratio < 50 ? 'text-rose-600 font-bold' : ''}>
                      {ratio.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Student Environment Intervention Tools */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-600">환경 변화 실험 도구:</span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={triggerRain}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer"
                title="단비를 내려 식물 성장을 촉진합니다"
              >
                <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                <span>단비 내리기</span>
              </button>
              <button
                onClick={triggerFertilizer}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                title="식물에 영양분을 보충합니다"
              >
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                <span>양분 공급</span>
              </button>
              <button
                onClick={triggerDrought}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                title="가뭄으로 인한 생태계 위기 실험"
              >
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                <span>가뭄 실험</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Event Feed (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-teal-600" />
                <span>생태계 관찰 일지</span>
              </h3>
              <span className="text-[11px] text-slate-400">실시간 기록</span>
            </div>

            <div className="h-56 overflow-y-auto space-y-2 pr-1 text-xs">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                    log.type === 'alert'
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : log.type === 'balance'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="font-mono text-[10px] text-slate-400 shrink-0 mt-0.5">
                    [{formatSimulationTime(log.time).split('.')[0]}]
                  </span>
                  <span className="leading-tight font-medium">{log.message}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            💡 <strong>교과서 팁:</strong> 생물 중 어느 하나가 전멸하면 먹이 관계가 끊어져 생태계 평형이 완전히 파괴됩니다!
          </div>
        </div>
      </div>
    </div>
  );
};
