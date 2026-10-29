import React from 'react';
import { OrganismBio, TrophicLevel } from '../types/ecosystem';
import { ORGANISMS, LEVEL_INFO } from '../data/organisms';
import { Play, ArrowLeft, RotateCcw, AlertTriangle, CheckCircle, Flame } from 'lucide-react';

interface PopulationAdjusterProps {
  selectedOrganismIds: string[];
  populations: Record<string, number>;
  onChangePopulation: (id: string, count: number) => void;
  onResetToDefaults: () => void;
  onStartSimulation: () => void;
  onBack: () => void;
}

export const PopulationAdjuster: React.FC<PopulationAdjusterProps> = ({
  selectedOrganismIds,
  populations,
  onChangePopulation,
  onResetToDefaults,
  onStartSimulation,
  onBack,
}) => {
  const organisms = selectedOrganismIds.map((id) => ORGANISMS[id]).filter(Boolean);

  // Group by level
  const producers = organisms.filter((o) => o.level === 'producer');
  const primaries = organisms.filter((o) => o.level === 'primary');
  const secondaries = organisms.filter((o) => o.level === 'secondary');
  const tertiaries = organisms.filter((o) => o.level === 'tertiary');

  const totalProducers = producers.reduce((sum, o) => sum + (populations[o.id] || 0), 0);
  const totalPrimaries = primaries.reduce((sum, o) => sum + (populations[o.id] || 0), 0);
  const totalSecondaries = secondaries.reduce((sum, o) => sum + (populations[o.id] || 0), 0);
  const totalTertiaries = tertiaries.reduce((sum, o) => sum + (populations[o.id] || 0), 0);

  // Analyze pyramid shape
  const isHealthyProducers = totalProducers >= totalPrimaries * 2.5;
  const isHealthyPrimaries = totalPrimaries >= totalSecondaries * 2.0;
  const isHealthySecondaries =
    tertiaries.length === 0 || totalSecondaries >= totalTertiaries * 2.0;

  const isPyramidHealthy = isHealthyProducers && isHealthyPrimaries && isHealthySecondaries;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center mb-6">
        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          Step 4 • 초기 개체 수 조절 & 생태 피라미드 검토
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          각 생물의 초기 개체 수를 조절하세요!
        </h2>
        <p className="mt-1 text-sm text-slate-600 max-w-2xl mx-auto">
          초등학교 4학년 교과서의 <strong>생태 피라미드</strong> 원리에 따라,
          아래쪽(생산자)이 가장 많고 위쪽(소비자)으로 갈수록 줄어들어야 평형이 오래 유지됩니다!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Left: Sliders */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="text-base font-extrabold text-slate-800">
              생물별 개체 수 조절바
            </h3>
            <button
              onClick={onResetToDefaults}
              className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>권장 수치로 재설정</span>
            </button>
          </div>

          {/* Grouped Organism Sliders */}
          <div className="space-y-4">
            {organisms.map((org) => {
              const count = populations[org.id] || org.defaultInitialCount;

              return (
                <div
                  key={org.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{org.emoji}</span>
                      <div>
                        <div className="text-sm font-extrabold text-slate-800">
                          {org.name}
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${org.badgeBg}`}>
                          {org.levelKorean}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-slate-800 font-mono">
                        {count.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">개체</span>
                    </div>
                  </div>

                  {/* Slider & Quick Buttons */}
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={org.minCount}
                      max={org.maxCount}
                      step={org.level === 'tertiary' ? 1 : org.level === 'secondary' ? 5 : 10}
                      value={count}
                      onChange={(e) => onChangePopulation(org.id, Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                    <span>최소 {org.minCount}</span>
                    <span>권장 {org.defaultInitialCount}</span>
                    <span>최대 {org.maxCount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Ecological Pyramid & Health Diagnostic */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-800 mb-3 flex items-center gap-2">
              <span>📐 실시간 생태 피라미드 점검</span>
            </h3>

            {/* Pyramid Visual */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col items-center justify-center gap-2 mb-4">
              {tertiaries.length > 0 && (
                <div
                  className="bg-orange-500 text-white rounded-md h-8 flex items-center justify-center font-bold text-xs shadow-2xs transition-all duration-300"
                  style={{
                    width: `${Math.max(20, Math.min(95, (totalTertiaries / Math.max(1, totalProducers)) * 180 + 20))}%`,
                  }}
                >
                  3차 소비자: {totalTertiaries}
                </div>
              )}

              <div
                className="bg-purple-500 text-white rounded-md h-9 flex items-center justify-center font-bold text-xs shadow-2xs transition-all duration-300"
                style={{
                  width: `${Math.max(30, Math.min(95, (totalSecondaries / Math.max(1, totalProducers)) * 140 + 25))}%`,
                }}
              >
                2차 소비자: {totalSecondaries}
              </div>

              <div
                className="bg-sky-500 text-white rounded-md h-10 flex items-center justify-center font-bold text-xs shadow-2xs transition-all duration-300"
                style={{
                  width: `${Math.max(45, Math.min(95, (totalPrimaries / Math.max(1, totalProducers)) * 100 + 35))}%`,
                }}
              >
                1차 소비자: {totalPrimaries}
              </div>

              <div
                className="bg-emerald-600 text-white rounded-md h-12 w-[98%] flex items-center justify-center font-bold text-xs shadow-2xs transition-all duration-300"
              >
                생산자 (기저부): {totalProducers}
              </div>
            </div>

            {/* Diagnosis Feedback */}
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed font-semibold flex items-start gap-2 ${
                isPyramidHealthy
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              {isPyramidHealthy ? (
                <>
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-emerald-900 mb-0.5">
                      안정적인 피라미드 형태입니다! 👍
                    </strong>
                    생산자가 충분하고 상위 소비자로 갈수록 개체 수가 적절히 줄어들어
                    생태계가 오래 평형을 유지할 수 있는 이상적인 비율입니다.
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-amber-900 mb-0.5">
                      피라미드 균형 주의! ⚠️
                    </strong>
                    {!isHealthyProducers && '1차 소비자에 비해 생산자가 부족하여 식물이 금방 고갈될 수 있습니다. '}
                    {!isHealthyPrimaries && '2차 소비자에 비해 1차 소비자가 부족합니다. '}
                    {!isHealthySecondaries && '3차 소비자가 너무 많아 하위 소비자가 전멸할 수 있습니다. '}
                    이 상태로도 도전할 수 있지만 생태계가 금방 무너질 수 있어요!
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Curriculum Tip */}
          <div className="bg-teal-50 rounded-2xl p-4 border border-teal-200 text-xs text-teal-900">
            <h4 className="font-extrabold flex items-center gap-1.5 mb-1.5 text-teal-950">
              <Flame className="w-4 h-4 text-teal-600" />
              <span>초등 4학년 과학: 생태계 평형 실험 목표</span>
            </h4>
            <p className="leading-relaxed">
              [시작 버튼]을 누르면 <strong>스톱워치가 즉시 작동</strong>합니다!
              생물들이 먹고 번식하면서 살아남는 시간을 최대한 길게 유지하여 명예의 전당에
              기록을 세워보세요!
            </p>
          </div>
        </div>
      </div>

      {/* Navigation & Launch */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>이전 단계</span>
        </button>

        <button
          onClick={onStartSimulation}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-base text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 shadow-lg hover:shadow-xl transition-all duration-150 transform hover:scale-[1.02] active:scale-98 cursor-pointer ring-4 ring-emerald-300/30"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>시뮬레이션 시작 (스톱워치 가동) ▶</span>
        </button>
      </div>
    </div>
  );
};
