import React, { useState } from 'react';
import { OrganismBio, TrophicLevel, EcosystemMode } from '../types/ecosystem';
import { ORGANISMS_BY_LEVEL, LEVEL_INFO, LEVEL_ORDER } from '../data/organisms';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Info,
  Calendar,
  Baby,
  Utensils,
  Sparkles,
  MapPin,
  XCircle,
} from 'lucide-react';

interface OrganismSelectorProps {
  mode: EcosystemMode;
  selectedOrganisms: string[]; // organism ids
  onToggleOrganism: (id: string, level: TrophicLevel) => void;
  onSelectSingleOrganism: (level: TrophicLevel, id: string | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export const OrganismSelector: React.FC<OrganismSelectorProps> = ({
  mode,
  selectedOrganisms,
  onToggleOrganism,
  onSelectSingleOrganism,
  onNext,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<TrophicLevel>('producer');
  const [inspectingBio, setInspectingBio] = useState<OrganismBio | null>(null);

  // Validation checks:
  const selectedProducerCount = selectedOrganisms.filter(
    (id) => ORGANISMS_BY_LEVEL.producer.some((o) => o.id === id)
  ).length;
  const selectedPrimaryCount = selectedOrganisms.filter(
    (id) => ORGANISMS_BY_LEVEL.primary.some((o) => o.id === id)
  ).length;
  const selectedSecondaryCount = selectedOrganisms.filter(
    (id) => ORGANISMS_BY_LEVEL.secondary.some((o) => o.id === id)
  ).length;
  const selectedTertiaryCount = selectedOrganisms.filter(
    (id) => ORGANISMS_BY_LEVEL.tertiary.some((o) => o.id === id)
  ).length;

  const isChainValid =
    selectedProducerCount === 1 &&
    selectedPrimaryCount === 1 &&
    selectedSecondaryCount === 1 &&
    selectedTertiaryCount <= 1;

  const isWebValid =
    selectedProducerCount >= 1 &&
    selectedPrimaryCount >= 1 &&
    selectedSecondaryCount >= 1;

  const canProceed = mode === 'food_chain' ? isChainValid : isWebValid;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      {/* Header Info */}
      <div className="text-center mb-6">
        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          Step 2 • 생물 선택 및 생태 정보 탐구
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {mode === 'food_chain' ? '먹이사슬을 구성할 생물 선택' : '먹이그물에 참여할 생물 선택'}
        </h2>
        <p className="mt-1 text-sm text-slate-600 max-w-2xl mx-auto">
          {mode === 'food_chain'
            ? '각 계층별로 1종류씩 선택하세요. (3차 소비자는 선택하지 않아도 시작할 수 있습니다!)'
            : '각 계층에서 다양한 생물을 1종 이상 선택해보세요. (3차 소비자는 선택 사항입니다)'}
        </p>
      </div>

      {/* Trophic Level Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto mb-6 gap-2">
        {LEVEL_ORDER.map((level) => {
          const info = LEVEL_INFO[level];
          const count = selectedOrganisms.filter(
            (id) => ORGANISMS_BY_LEVEL[level].some((o) => o.id === id)
          ).length;
          const isActive = activeTab === level;

          return (
            <button
              key={level}
              onClick={() => setActiveTab(level)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-sm whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <span>{info.name}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  count > 0
                    ? 'bg-emerald-600 text-white'
                    : level === 'tertiary'
                    ? 'bg-slate-200 text-slate-600'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {count}선택
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Description Banner */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-md text-xs font-extrabold ${LEVEL_INFO[activeTab].badge}`}>
            {LEVEL_INFO[activeTab].name}
          </span>
          <span className="text-sm font-medium text-slate-700">
            {LEVEL_INFO[activeTab].description}
          </span>
        </div>

        {activeTab === 'tertiary' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              💡 3차 소비자는 생태계에 넣지 않아도 시작할 수 있습니다.
            </span>
            {selectedTertiaryCount > 0 && (
              <button
                onClick={() => onSelectSingleOrganism('tertiary', null)}
                className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-rose-600 bg-white px-2 py-1 rounded-md border border-slate-200 cursor-pointer shadow-2xs"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>3차 소비자 제외</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {ORGANISMS_BY_LEVEL[activeTab].map((organism) => {
          const isSelected = selectedOrganisms.includes(organism.id);

          const handleClick = () => {
            if (mode === 'food_chain') {
              if (activeTab === 'tertiary' && isSelected) {
                onSelectSingleOrganism('tertiary', null);
              } else {
                onSelectSingleOrganism(activeTab, organism.id);
              }
            } else {
              onToggleOrganism(organism.id, activeTab);
            }
          };

          return (
            <div
              key={organism.id}
              onClick={handleClick}
              className={`relative rounded-2xl border-2 p-5 transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-400/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {/* Checkbox indicator */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-3xl shadow-2xs">
                    {organism.emoji}
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                      {organism.name}
                    </h4>
                    <span className="text-xs font-mono text-slate-400 italic">
                      {organism.scientificName}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>

              {/* Real Scientific Info Cards (Requirement: 각 개체는 번식률과 수명이 정해져 있어 실제 그 동물의 평균 정보대로 노출) */}
              <div className="space-y-2 text-xs bg-white/90 p-3 rounded-xl border border-slate-200/80 mb-3 shadow-2xs">
                <div className="flex items-start gap-1.5 text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">평균 수명: </span>
                    <span className="font-medium text-slate-600">{organism.lifespanDisplay}</span>
                  </div>
                </div>

                <div className="flex items-start gap-1.5 text-slate-700">
                  <Baby className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">번식률·주기: </span>
                    <span className="font-medium text-slate-600">{organism.reproductionRate}</span>
                  </div>
                </div>

                <div className="flex items-start gap-1.5 text-slate-700">
                  <Utensils className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">섭식·먹이: </span>
                    <span className="font-medium text-slate-600">{organism.dietDescription}</span>
                  </div>
                </div>

                <div className="flex items-start gap-1.5 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">주요 서식지: </span>
                    <span className="font-medium text-slate-600">{organism.habitat}</span>
                  </div>
                </div>
              </div>

              {/* 4th grade science curriculum note */}
              <div className="text-[11px] leading-relaxed text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>교과서 속 탐구:</strong> {organism.curriculumFact}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Summary Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-slate-500 mb-1">현재 선택된 생물 목록</div>
          <div className="flex flex-wrap items-center gap-2">
            {selectedOrganisms.length === 0 ? (
              <span className="text-xs text-slate-400 font-medium">선택된 생물이 없습니다.</span>
            ) : (
              selectedOrganisms.map((id) => {
                const org = ORGANISMS_BY_LEVEL.producer
                  .concat(ORGANISMS_BY_LEVEL.primary)
                  .concat(ORGANISMS_BY_LEVEL.secondary)
                  .concat(ORGANISMS_BY_LEVEL.tertiary)
                  .find((o) => o.id === id);
                if (!org) return null;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200"
                  >
                    <span>{org.emoji}</span>
                    <span>{org.name.split(' ')[0]}</span>
                    <span className="text-[10px] text-slate-500">({org.levelKorean.split(' ')[0]})</span>
                  </span>
                );
              })
            )}
          </div>
        </div>

        {/* Validation Status message */}
        <div className="text-xs font-medium">
          {mode === 'food_chain' ? (
            !canProceed ? (
              <span className="text-rose-600 font-bold">
                ⚠️ 생산자, 1차 소비자, 2차 소비자를 각각 1종류씩 필수로 선택해야 합니다.
              </span>
            ) : (
              <span className="text-emerald-600 font-bold">
                ✓ 먹이사슬 생물 선택 완료! 다음 단계로 이동할 수 있습니다.
              </span>
            )
          ) : !canProceed ? (
            <span className="text-rose-600 font-bold">
              ⚠️ 생산자, 1차 소비자, 2차 소비자를 최소 1종류 이상 선택해주세요.
            </span>
          ) : (
            <span className="text-emerald-600 font-bold">
              ✓ 먹이그물 생물 선택 완료! 다음 단계로 이동할 수 있습니다.
            </span>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>이전 (모드 변경)</span>
        </button>

        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm sm:text-base text-white transition-all duration-150 shadow-md ${
            canProceed
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 cursor-pointer hover:shadow-lg active:scale-98'
              : 'bg-slate-300 cursor-not-allowed opacity-70'
          }`}
        >
          <span>
            {mode === 'food_web' ? '먹이 관계도(그물) 연결하기' : '개체 수 조절하러 가기'}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
