import React from 'react';
import { EcosystemMode } from '../types/ecosystem';
import { ArrowRight, Network, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

interface ModeSelectorProps {
  selectedMode: EcosystemMode;
  onSelectMode: (mode: EcosystemMode) => void;
  onNext: () => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  selectedMode,
  onSelectMode,
  onNext,
}) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="text-center mb-8">
        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          Step 1 • 생태계 모드 선택
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          어떤 방식으로 생태계를 구성해볼까요?
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          초등학교 4학년 과학에서 배우는 두 가지 먹이 관계 중 하나를 선택하세요.
          생태계가 오래 유지될 수 있도록 생물의 균형을 맞춰보세요!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mode 1: 먹이사슬 (Food Chain) */}
        <div
          onClick={() => onSelectMode('food_chain')}
          className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-200 border-2 flex flex-col justify-between ${
            selectedMode === 'food_chain'
              ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-400/30'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          {selectedMode === 'food_chain' && (
            <div className="absolute top-4 right-4 text-emerald-600">
              <CheckCircle2 className="w-6 h-6 fill-emerald-100" />
            </div>
          )}

          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 shadow-2xs">
              <LinkIcon className="w-6 h-6" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-slate-900">먹이사슬 (Food Chain)</h3>
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-md">
                1:1 연결
              </span>
            </div>

            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              생산자부터 소비자까지 <strong>계층별로 생물이 한 가지만</strong> 선택되어 사슬처럼 일직선으로 연결됩니다.
              어느 한 계층이라도 무너지면 연쇄적으로 생태계가 파괴될 수 있습니다!
            </p>

            {/* Visual preview */}
            <div className="bg-white rounded-xl p-3 border border-slate-200/80 mb-4 shadow-2xs">
              <div className="text-xs font-bold text-slate-500 mb-2">사슬 연결 예시:</div>
              <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-slate-700">
                <span className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                  🌱 풀
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="flex items-center gap-1 bg-sky-50 px-2 py-1 rounded-md border border-sky-200">
                  🐇 토끼
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-md border border-purple-200">
                  🐍 뱀
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-md border border-orange-200">
                  🦅 독수리
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            💡 <strong>교과서 팁:</strong> 단순한 구조라 균형이 깨지기 쉽지만 규칙을 이해하기에 가장 좋습니다.
          </div>
        </div>

        {/* Mode 2: 먹이그물 (Food Web) */}
        <div
          onClick={() => onSelectMode('food_web')}
          className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-200 border-2 flex flex-col justify-between ${
            selectedMode === 'food_web'
              ? 'border-teal-500 bg-teal-50/50 shadow-md ring-2 ring-teal-400/30'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          {selectedMode === 'food_web' && (
            <div className="absolute top-4 right-4 text-teal-600">
              <CheckCircle2 className="w-6 h-6 fill-teal-100" />
            </div>
          )}

          <div>
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4 shadow-2xs">
              <Network className="w-6 h-6" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-slate-900">먹이그물 (Food Web)</h3>
              <span className="px-2 py-0.5 text-xs font-semibold bg-teal-100 text-teal-800 rounded-md">
                그물망 연결
              </span>
            </div>

            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              여러 생물이 그물처럼 복잡하게 얽혀 있는 관계입니다.
              <strong>먹이 관계도에서 어떤 생물이 포식자인지 직접 연결</strong>하며,
              다양한 대체 먹이가 존재하여 생태계가 더욱 튼튼하게 유지됩니다!
            </p>

            {/* Visual preview */}
            <div className="bg-white rounded-xl p-3 border border-slate-200/80 mb-4 shadow-2xs">
              <div className="text-xs font-bold text-slate-500 mb-2">그물 연결 예시:</div>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-700">
                <div className="bg-teal-50/60 p-2 rounded-lg border border-teal-100">
                  🌱 풀 → 🐇 토끼 & 🦗 메뚜기
                </div>
                <div className="bg-teal-50/60 p-2 rounded-lg border border-teal-100">
                  🦗 메뚜기 → 🐸 개구리 & 🦗 사마귀
                </div>
                <div className="bg-teal-50/60 p-2 rounded-lg border border-teal-100">
                  🐸 개구리 → 🐍 뱀
                </div>
                <div className="bg-teal-50/60 p-2 rounded-lg border border-teal-100">
                  🐇 토끼 & 🐍 뱀 → 🦅 독수리
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            💡 <strong>교과서 팁:</strong> 먹이그물이 복잡할수록 한 생물이 줄어도 다른 먹이로 버틸 수 있습니다!
          </div>
        </div>
      </div>

      {/* Next Step Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-base text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md hover:shadow-lg transition-all duration-150 transform active:scale-98 cursor-pointer"
        >
          <span>생물 선택하러 가기</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
