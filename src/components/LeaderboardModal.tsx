import React, { useState } from 'react';
import { LeaderboardRecord } from '../types/ecosystem';
import {
  Trophy,
  X,
  FileSpreadsheet,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCw,
  Award,
  ExternalLink,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface LeaderboardModalProps {
  records: LeaderboardRecord[];
  user: User | null;
  sheetUrl?: string;
  fromSheet: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onLogin: () => void;
  onDeleteRecord: (record: LeaderboardRecord) => Promise<{ success: boolean; message: string }>;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  records,
  user,
  sheetUrl,
  fromSheet,
  onClose,
  onRefresh,
  onLogin,
  onDeleteRecord,
}) => {
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [adminPin, setAdminPin] = useState<string>('');
  const [showPinInput, setShowPinInput] = useState<boolean>(false);
  const [deletingRecord, setDeletingRecord] = useState<LeaderboardRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteStatusMessage, setDeleteStatusMessage] = useState<string | null>(null);

  const handleAdminToggle = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
      setShowPinInput(false);
    } else {
      setShowPinInput(true);
    }
  };

  const handleVerifyAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default teacher PIN is 1234 or teacher email
    if (adminPin === '1234' || adminPin === 'admin' || user?.email) {
      setIsAdminMode(true);
      setShowPinInput(false);
      setAdminPin('');
    } else {
      alert('관리자 비밀번호가 일치하지 않습니다. (기본 비밀번호: 1234)');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRecord || isDeleting) return;

    setIsDeleting(true);
    setDeleteStatusMessage(null);
    try {
      const result = await onDeleteRecord(deletingRecord);
      setDeleteStatusMessage(result.message);
      setDeletingRecord(null);
    } catch (err: any) {
      setDeleteStatusMessage(`삭제 실패: ${err.message || '오류 발생'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 relative overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-2xs text-2xl">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  생태계 평형 명예의 전당
                </h3>
                {fromSheet ? (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    구글 시트 연동됨
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    로컬 기록 모드
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                생태계를 가장 오래 안정적으로 유지한 탐구자들의 순위표입니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              title="새로고침"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {sheetUrl && (
              <a
                href={sheetUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>구글 시트 열기</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Admin Bar & Google Auth Prompt */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleAdminToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                isAdminMode
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
              }`}
            >
              {isAdminMode ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{isAdminMode ? '관리자 모드 켜짐' : '선생님 / 관리자 모드'}</span>
            </button>

            {showPinInput && !isAdminMode && (
              <form onSubmit={handleVerifyAdmin} className="flex items-center gap-1.5">
                <input
                  type="password"
                  placeholder="관리자 암호 (1234)"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs w-32 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 cursor-pointer"
                >
                  확인
                </button>
              </form>
            )}

            {isAdminMode && (
              <span className="text-[11px] text-rose-700 font-semibold">
                ⚠️ 관리자 모드: 각 행의 삭제 버튼으로 부적절한 기록을 구글 시트에서 직접 삭제할 수 있습니다.
              </span>
            )}
          </div>

          {!user && (
            <button
              onClick={onLogin}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Google 로그인으로 시트 자동 동기화</span>
            </button>
          )}
        </div>

        {/* Delete Toast Message */}
        {deleteStatusMessage && (
          <div className="px-6 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-bold text-center">
            {deleteStatusMessage}
          </div>
        )}

        {/* Records Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {records.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-40 text-amber-500" />
              <p className="text-sm font-bold text-slate-600">아직 등록된 기록이 없습니다.</p>
              <p className="text-xs text-slate-400 mt-1">시뮬레이션을 시작하여 첫 번째 기록을 달성해보세요!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold text-xs uppercase tracking-wider">
                    <th className="pb-3 pl-2">순위</th>
                    <th className="pb-3">플레이어</th>
                    <th className="pb-3">모드</th>
                    <th className="pb-3">유지 기록 (스톱워치)</th>
                    <th className="pb-3">평형도</th>
                    <th className="pb-3">구성 생물</th>
                    <th className="pb-3">일시</th>
                    {isAdminMode && <th className="pb-3 text-right pr-2">관리</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((rec, index) => {
                    const isTop1 = index === 0;
                    const isTop2 = index === 1;
                    const isTop3 = index === 2;

                    return (
                      <tr
                        key={rec.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isTop1 ? 'bg-amber-50/40 font-semibold' : ''
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-3.5 pl-2">
                          {isTop1 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs shadow-2xs">
                              1
                            </span>
                          ) : isTop2 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-black text-xs">
                              2
                            </span>
                          ) : isTop3 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/60 text-white font-black text-xs">
                              3
                            </span>
                          ) : (
                            <span className="font-mono text-slate-400 pl-2">{index + 1}</span>
                          )}
                        </td>

                        {/* Player Name */}
                        <td className="py-3.5 font-bold text-slate-900">
                          {rec.playerName}
                        </td>

                        {/* Mode */}
                        <td className="py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                              rec.mode === 'food_web'
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {rec.modeKorean}
                          </span>
                        </td>

                        {/* Survival Time */}
                        <td className="py-3.5 font-mono font-black text-emerald-800 text-sm">
                          {rec.formattedTime}
                        </td>

                        {/* Balance Score */}
                        <td className="py-3.5 font-bold text-slate-700">
                          {rec.balanceScore}%
                        </td>

                        {/* Organisms */}
                        <td className="py-3.5 text-xs text-slate-500 max-w-[200px] truncate" title={rec.organismsSummary}>
                          {rec.organismsSummary}
                        </td>

                        {/* Date */}
                        <td className="py-3.5 text-[11px] text-slate-400 font-mono">
                          {rec.createdAt}
                        </td>

                        {/* Admin Action */}
                        {isAdminMode && (
                          <td className="py-3.5 text-right pr-2">
                            <button
                              onClick={() => setDeletingRecord(rec)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="기록 삭제 (구글 시트 반영)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Workspace Integration Mandatory Explicit Confirmation Modal for Destructive Delete */}
        {deletingRecord && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-2xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h4 className="text-lg font-black text-slate-900 text-center">
                구글 시트 기록 삭제 확인
              </h4>

              <p className="text-xs text-slate-600 mt-2 leading-relaxed text-center">
                플레이어 <strong>"{deletingRecord.playerName}"</strong>의 기록(기록: {deletingRecord.formattedTime})을
                영구 삭제하시겠습니까?
              </p>

              <div className="my-3 p-3 bg-rose-50 rounded-xl border border-rose-100 text-[11px] text-rose-800">
                ⚠️ 이 작업은 연동된 구글 스프레드시트(<strong>{deletingRecord.sheetRowIndex ? `${deletingRecord.sheetRowIndex}번째 행` : '로컬 기록'}</strong>)에서
                데이터를 영구히 삭제하며 실행 후 되돌릴 수 없습니다.
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeletingRecord(null)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  취소
                </button>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-500 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  {isDeleting ? (
                    <span>시트에서 삭제 중...</span>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>확인 (삭제)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
