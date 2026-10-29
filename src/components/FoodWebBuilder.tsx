import React, { useState } from 'react';
import { FoodWebLink, OrganismBio, TrophicLevel } from '../types/ecosystem';
import { ORGANISMS, isValidTrophicLink, LEVEL_INFO } from '../data/organisms';
import {
  ArrowRight,
  ArrowLeft,
  Share2,
  Trash2,
  Wand2,
  AlertCircle,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';

interface FoodWebBuilderProps {
  selectedOrganismIds: string[];
  links: FoodWebLink[];
  onSetLinks: (links: FoodWebLink[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const FoodWebBuilder: React.FC<FoodWebBuilderProps> = ({
  selectedOrganismIds,
  links,
  onSetLinks,
  onNext,
  onBack,
}) => {
  const [selectedPreyId, setSelectedPreyId] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const organisms = selectedOrganismIds.map((id) => ORGANISMS[id]).filter(Boolean);

  // Group by level
  const producers = organisms.filter((o) => o.level === 'producer');
  const primaries = organisms.filter((o) => o.level === 'primary');
  const secondaries = organisms.filter((o) => o.level === 'secondary');
  const tertiaries = organisms.filter((o) => o.level === 'tertiary');

  // Handle organism click
  const handleOrganismClick = (org: OrganismBio) => {
    setErrorToast(null);

    // If no prey selected yet
    if (!selectedPreyId) {
      if (org.level === 'tertiary') {
        // Tertiary organisms are apex predators and cannot be eaten by anyone
        setErrorToast(`⚠️ ${org.name}은(는) 최상위 포식자이므로 다른 생물의 '먹이(피식자)'가 될 수 없습니다. 먼저 하위 계층의 먹이를 선택해주세요!`);
        return;
      }
      setSelectedPreyId(org.id);
      return;
    }

    // If clicking the same organism again, deselect
    if (selectedPreyId === org.id) {
      setSelectedPreyId(null);
      return;
    }

    const prey = ORGANISMS[selectedPreyId];
    const predator = org;

    // Validate trophic connection per 4th grade science
    if (!isValidTrophicLink(prey.id, predator.id)) {
      let reason = `⚠️ [계층 규칙 오류] ${prey.name}과(와) ${predator.name} 사이에는 먹이 관계를 맺을 수 없습니다.`;
      if (prey.level === predator.level) {
        reason = `⚠️ 같은 ${prey.levelKorean}끼리는 포식 관계를 형성할 수 없습니다!`;
      } else if (predator.level === 'producer') {
        reason = `⚠️ 생산자(${predator.name})는 광합성으로 양분을 만들므로 다른 동물을 먹을 수 없습니다!`;
      } else {
        reason = `⚠️ 피라미드 계층 규칙 위반! ${predator.name}은(는) ${prey.name}을(를) 먹이로 섭취하지 않습니다. 올바른 포식자를 선택해주세요!`;
      }
      setErrorToast(reason);
      setSelectedPreyId(null);
      return;
    }

    // Check if link already exists
    const exists = links.some((l) => l.fromId === prey.id && l.toId === predator.id);
    if (exists) {
      // Toggle off / remove
      onSetLinks(links.filter((l) => !(l.fromId === prey.id && l.toId === predator.id)));
    } else {
      // Add link
      onSetLinks([...links, { fromId: prey.id, toId: predator.id }]);
    }

    setSelectedPreyId(null);
  };

  const handleAutoConnect = () => {
    const autoLinks: FoodWebLink[] = [];
    for (const prey of organisms) {
      for (const pred of organisms) {
        if (isValidTrophicLink(prey.id, pred.id)) {
          autoLinks.push({ fromId: prey.id, toId: pred.id });
        }
      }
    }
    onSetLinks(autoLinks);
    setErrorToast(null);
  };

  const handleClearLinks = () => {
    onSetLinks([]);
    setSelectedPreyId(null);
    setErrorToast(null);
  };

  const handleRemoveLink = (fromId: string, toId: string) => {
    onSetLinks(links.filter((l) => !(l.fromId === fromId && l.toId === toId)));
  };

  // Check if every consumer has at least one food source
  const consumers = organisms.filter((o) => o.level !== 'producer');
  const starvedConsumers = consumers.filter(
    (c) => !links.some((l) => l.toId === c.id)
  );

  const canProceed = links.length >= consumers.length && starvedConsumers.length === 0;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      {/* Header Info */}
      <div className="text-center mb-6">
        <span className="inline-block px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          Step 3 • 먹이그물 관계도 설계
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          누가 누구를 먹는지 먹이 관계도를 연결하세요!
        </h2>
        <p className="mt-1 text-sm text-slate-600 max-w-2xl mx-auto">
          먼저 <strong>먹이(피식자)</strong>를 누르고, 그 다음 이를 먹는 <strong>포식자</strong>를 차례대로 클릭하세요.
          초등학교 4학년 교과서 원리에 따라 화살표는 먹이에서 포식자로 향합니다.
        </p>
      </div>

      {/* Guide Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-amber-900">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            <strong>연결 규칙:</strong> 1차 소비자는 생산자만, 2차 소비자는 1차 소비자를 섭식합니다.
            엉뚱한 계층(예: 풀이 호랑이를 먹는 등)은 장난식 연결을 방지하기 위해 선택되지 않습니다!
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoConnect}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-teal-600 hover:bg-teal-500 text-white shadow-2xs transition-colors cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>자연 먹이관계 자동 연결</span>
          </button>
          <button
            onClick={handleClearLinks}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>초기화</span>
          </button>
        </div>
      </div>

      {/* Error Toast */}
      {errorToast && (
        <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-bounce">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Selection prompt status */}
      <div className="mb-4 text-center">
        {selectedPreyId ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 text-white font-bold text-sm shadow-md animate-pulse">
            <span>먹이: {ORGANISMS[selectedPreyId]?.name} 선택됨</span>
            <ArrowRight className="w-4 h-4" />
            <span>이 생물을 먹을 '포식자'를 클릭하세요!</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-300">
            <span>1단계: 먹이가 될 생물을 먼저 클릭하세요.</span>
          </div>
        )}
      </div>

      {/* Food Web Visual Canvas / Levels */}
      <div className="bg-gradient-to-b from-sky-50/50 via-emerald-50/30 to-amber-50/40 rounded-2xl border-2 border-slate-200 p-6 shadow-inner mb-6 space-y-6">
        {/* Tier 3: 3차 소비자 */}
        {tertiaries.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-orange-500 text-white">
                3차 소비자 (최상위)
              </span>
              <span className="text-xs text-slate-500 font-medium">먹이그물의 꼭대기</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {tertiaries.map((org) => renderOrganismButton(org))}
            </div>
          </div>
        )}

        {/* Tier 2: 2차 소비자 */}
        {secondaries.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-500 text-white">
                2차 소비자
              </span>
              <span className="text-xs text-slate-500 font-medium">초식동물이나 곤충을 먹음</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {secondaries.map((org) => renderOrganismButton(org))}
            </div>
          </div>
        )}

        {/* Tier 1: 1차 소비자 */}
        {primaries.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-sky-500 text-white">
                1차 소비자
              </span>
              <span className="text-xs text-slate-500 font-medium">식물을 먹는 초식동물</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {primaries.map((org) => renderOrganismButton(org))}
            </div>
          </div>
        )}

        {/* Tier 0: 생산자 */}
        {producers.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-500 text-white">
                생산자
              </span>
              <span className="text-xs text-slate-500 font-medium">광합성으로 스스로 양분 생산</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {producers.map((org) => renderOrganismButton(org))}
            </div>
          </div>
        )}
      </div>



      {/* Established Food Links Pills */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-teal-600" />
            <h4 className="text-sm font-extrabold text-slate-800">
              현재 구성된 먹이 관계 목록 ({links.length}개)
            </h4>
          </div>
          <span className="text-xs text-slate-500">클릭하면 해당 관계를 삭제합니다.</span>
        </div>

        {links.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 font-medium">
            아직 연결된 먹이 관계가 없습니다. 위 생물들을 클릭하여 연결하거나 [자연 먹이관계 자동 연결]을 눌러보세요!
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {links.map((link) => {
              const prey = ORGANISMS[link.fromId];
              const pred = ORGANISMS[link.toId];
              if (!prey || !pred) return null;

              return (
                <button
                  key={`${link.fromId}->${link.toId}`}
                  onClick={() => handleRemoveLink(link.fromId, link.toId)}
                  className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-300 transition-colors shadow-2xs cursor-pointer"
                  title="클릭하여 관계 삭제"
                >
                  <span>{prey.emoji} {prey.name.split(' ')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-teal-600 group-hover:text-rose-500" />
                  <span>{pred.emoji} {pred.name.split(' ')[0]}</span>
                  <span className="ml-1 text-slate-400 group-hover:text-rose-500 font-normal">×</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Validation warning */}
        {starvedConsumers.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 font-medium">
            ⚠️ <strong>먹이가 연결되지 않은 소비자: </strong>
            {starvedConsumers.map((c) => `${c.emoji} ${c.name}`).join(', ')}
            <br />
            소비자가 굶어 죽지 않도록 먹이를 최소 1개 이상 연결해야 시작할 수 있습니다!
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>이전 (생물 다시 고르기)</span>
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
          <span>개체 수 조절하러 가기</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  function renderOrganismButton(org: OrganismBio) {
    const isSelectedAsPrey = selectedPreyId === org.id;
    // Count incoming food links
    const incomingPreys = links.filter((l) => l.toId === org.id).length;
    // Count outgoing food links
    const outgoingPreds = links.filter((l) => l.fromId === org.id).length;

    return (
      <button
        key={org.id}
        data-testid={`web-node-${org.id}`}
        onClick={() => handleOrganismClick(org)}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all duration-150 cursor-pointer text-left shadow-2xs ${
          isSelectedAsPrey
            ? 'border-emerald-500 bg-emerald-100 ring-4 ring-emerald-300/40 scale-105'
            : 'border-white bg-white hover:border-slate-300 hover:shadow-sm'
        }`}
      >
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-2xl shadow-2xs">
          {org.emoji}
        </div>
        <div>
          <div className="font-extrabold text-sm text-slate-800 leading-tight">
            {org.name.split(' ')[0]}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
            {org.level !== 'producer' && (
              <span className={incomingPreys > 0 ? 'text-teal-600 font-bold' : 'text-rose-500 font-bold'}>
                먹이 {incomingPreys}개
              </span>
            )}
            {org.level !== 'tertiary' && (
              <span className="text-slate-500">
                천적 {outgoingPreds}개
              </span>
            )}
          </div>
        </div>
      </button>
    );
  }
};
