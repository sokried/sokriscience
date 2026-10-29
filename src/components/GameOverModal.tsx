import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { formatSimulationTime } from '../engine/simulationEngine';
import { EcosystemMode } from '../types/ecosystem';
import { Trophy, Timer, Award, CheckCircle2, RotateCcw, ArrowRight, FileSpreadsheet } from 'lucide-react';

interface GameOverModalProps {
  survivalSeconds: number;
  balanceScore: number;
  reason: string;
  mode: EcosystemMode;
  organismsSummary: string;
  onSaveRecord: (playerName: string) => Promise<{ syncedToSheets: boolean; sheetUrl?: string }>;
  onViewLeaderboard: () => void;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  survivalSeconds,
  balanceScore,
  reason,
  mode,
  organismsSummary,
  onSaveRecord,
  onViewLeaderboard,
  onRestart,
}) => {
  const [playerName, setPlayerName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ synced: boolean; sheetUrl?: string } | null>(null);

  // Trigger celebration confetti
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // non-critical
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const res = await onSaveRecord(playerName.trim());
      setIsSaved(true);
      setSyncStatus({ synced: res.syncedToSheets, sheetUrl: res.sheetUrl });

      try {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
        });
      } catch {}
    } catch (err) {
      console.error('Save record error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />

        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">
          🏆
        </div>

        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          생태계 시뮬레이션 종료!
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          {mode === 'food_chain' ? '[먹이사슬 모드]' : '[먹이그물 모드]'} 탐구 결과
        </p>

        {/* Survival Time Hero Card */}
        <div className="my-5 bg-gradient-to-tr from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-4 shadow-2xs">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
            <Timer className="w-4 h-4 text-emerald-600" />
            <span>생태계 유지 기록</span>
          </div>
          <div className="text-4xl sm:text-5xl font-black text-emerald-900 font-mono tracking-tight">
            {formatSimulationTime(survivalSeconds)}
          </div>
          <div className="text-xs font-bold text-teal-700 mt-1">
            평균 평형 유지도: {balanceScore}%
          </div>
        </div>

        {/* Scientific Reason Feedback */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-left mb-5">
          <span className="font-bold text-slate-800 block mb-1">
            🔬 과학 교과서 탐구 분석 (평형이 깨진 이유):
          </span>
          <p className="text-slate-600 leading-relaxed">{reason}</p>
        </div>

        {/* Save Form */}
        {!isSaved ? (
          <form onSubmit={handleSave} className="space-y-3">
            <div className="text-left">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                플레이어 이름 또는 학급 (예: 4학년 2반 김민준)
              </label>
              <input
                type="text"
                required
                maxLength={30}
                placeholder="이름을 입력하세요"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving || !playerName.trim()}
              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md hover:shadow-lg transition-all duration-150 disabled:opacity-50 cursor-pointer text-sm flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <span>기록 저장 및 구글시트 반영 중...</span>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>명예의 전당 등록 & 구글시트 저장</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>기록이 명예의 전당 리스트에 성공적으로 등록되었습니다!</span>
            </div>

            {syncStatus?.synced && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 flex items-center justify-between">
                <span className="font-medium">구글 시트에 실시간 반영되었습니다! 📊</span>
                {syncStatus.sheetUrl && (
                  <a
                    href={syncStatus.sheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold underline text-teal-900"
                  >
                    시트 열기
                  </a>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={onViewLeaderboard}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>명예의 전당 보기</span>
              </button>

              <button
                onClick={onRestart}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>다시 도전하기</span>
              </button>
            </div>
          </div>
        )}

        {!isSaved && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={onRestart}
              className="text-xs text-slate-400 hover:text-slate-600 underline font-medium cursor-pointer"
            >
              기록 저장 없이 다시 시작하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
