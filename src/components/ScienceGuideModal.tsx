import React from 'react';
import { X, BookOpen, Sprout, Network, Activity, HelpCircle } from 'lucide-react';

interface ScienceGuideModalProps {
  onClose: () => void;
}

export const ScienceGuideModal: React.FC<ScienceGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-emerald-50/60">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-2xs">
              📖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  초등 4학년 과학: 생태계 평형 탐구실
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-200 text-emerald-900">
                  교과서 연계
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                초등학교 4학년 2학기 과학 [생물과 환경] 단원 핵심 정리
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-700">
          {/* Concept 1 */}
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-2">
            <h4 className="font-extrabold text-emerald-900 flex items-center gap-2 text-base">
              <Sprout className="w-5 h-5 text-emerald-600" />
              <span>1. 생태계의 생물적 구성 요소</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mt-2">
              <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs">
                <span className="font-bold text-emerald-800 block mb-1">🌱 생산자</span>
                햇빛, 물, 이산화탄소를 이용해 광합성을 하여 스스로 양분을 만드는 생물 (풀, 나무 등)
              </div>
              <div className="bg-white p-3 rounded-xl border border-sky-200 shadow-2xs">
                <span className="font-bold text-sky-800 block mb-1">🐇 소비자</span>
                스스로 양분을 만들지 못하고 다른 생물을 먹이로 섭취하는 생물 (1차, 2차, 3차 소비자)
              </div>
              <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                <span className="font-bold text-amber-800 block mb-1">🍄 분해자</span>
                죽은 생물이나 배설물을 분해하여 흙으로 돌려보내는 생물 (버섯, 곰팡이, 세균 등)
              </div>
            </div>
          </div>

          {/* Concept 2 */}
          <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100 space-y-2">
            <h4 className="font-extrabold text-teal-900 flex items-center gap-2 text-base">
              <Network className="w-5 h-5 text-teal-600" />
              <span>2. 먹이사슬과 먹이그물의 차이점</span>
            </h4>
            <div className="space-y-2 text-xs sm:text-sm">
              <p className="leading-relaxed">
                <strong>먹이사슬(Food Chain):</strong> 생물들 사이의 먹고 먹히는 관계가 사슬처럼 <strong>한 줄</strong>로 연결된 것입니다.
                (예: 풀 → 토끼 → 뱀 → 독수리). 한 종류가 사라지면 곧바로 다른 계층도 멸종 위기에 처합니다.
              </p>
              <p className="leading-relaxed">
                <strong>먹이그물(Food Web):</strong> 여러 먹이사슬이 그물처럼 <strong>복잡하게 얽혀 있는</strong> 관계입니다.
                어떤 한 생물이 줄어들어도 다른 먹이를 대신 섭취할 수 있어, <strong>먹이그물이 복잡할수록 생태계 평형이 훨씬 더 오래 유지</strong>됩니다!
              </p>
            </div>
          </div>

          {/* Concept 3 */}
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 space-y-2">
            <h4 className="font-extrabold text-amber-900 flex items-center gap-2 text-base">
              <Activity className="w-5 h-5 text-amber-600" />
              <span>3. 생태 피라미드와 생태계 평형</span>
            </h4>
            <p className="text-xs sm:text-sm leading-relaxed">
              안정된 생태계에서는 생산자의 수와 양이 가장 많고, 1차 소비자, 2차 소비자, 3차 소비자로 갈수록 점점 줄어드는
              <strong>피라미드 모양</strong>을 이룹니다.
            </p>
            <div className="bg-white p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium">
              💡 <strong>평형의 회복 원리:</strong> 만약 1차 소비자가 일시적으로 늘어나면 식물이 줄어들고, 먹이가 부족해진 1차 소비자가 다시 줄어들며, 결국 원래의 균형을 되찾습니다. 하지만 어느 하나가 완전히 0(멸종)이 되면 평형은 영원히 파괴됩니다!
            </div>
          </div>

          {/* Game Tips */}
          <div className="bg-slate-100 p-4 rounded-2xl space-y-2">
            <h4 className="font-extrabold text-slate-800 flex items-center gap-2 text-base">
              <HelpCircle className="w-5 h-5 text-emerald-600" />
              <span>🏆 시뮬레이션 게임 생존 기록 세우는 팁!</span>
            </h4>
            <ul className="list-disc list-inside text-xs sm:text-sm space-y-1.5 text-slate-600 pl-1">
              <li>먹이사슬보다는 <strong>먹이그물</strong>을 선택하고 여러 먹이 경로를 연결하세요.</li>
              <li>초기 개체 수 설정 시, 생산자(풀/나무)를 최대로 올리고 최상위 포식자는 소수로 시작하세요.</li>
              <li>식물이 부족해지면 게임 화면의 <strong>[단비 내리기]</strong>나 <strong>[양분 공급]</strong> 도구를 적절히 활용해보세요!</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-xs"
          >
            이해했어요! 실험 시작하기
          </button>
        </div>
      </div>
    </div>
  );
};
