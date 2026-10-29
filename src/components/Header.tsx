import React, { useState } from 'react';
import {
  Sparkles,
  Trophy,
  BookOpen,
  RotateCcw,
  LogIn,
  LogOut,
  FileSpreadsheet,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { User } from 'firebase/auth';

const SHARED_APP_URL = 'https://ais-pre-tsi2qgyuvickr6boc5wdqa-347214925865.asia-east1.run.app';

interface HeaderProps {
  user: User | null;
  onOpenLeaderboard: () => void;
  onOpenGuide: () => void;
  onReset: () => void;
  onLogin: () => void;
  onLogout: () => void;
  isSimulating: boolean;
  sheetUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenLeaderboard,
  onOpenGuide,
  onReset,
  onLogin,
  onLogout,
  isSimulating,
  sheetUrl,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyShareLink = async () => {
    try {
      const urlToCopy = window.location.origin.includes('localhost')
        ? SHARED_APP_URL
        : window.location.href;
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      prompt('공유 링크를 복사하세요:', SHARED_APP_URL);
    }
  };
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Curriculum Badge */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-2xl shadow-sm text-white">
            🌿
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
                생태계 평형 시뮬레이터
              </h1>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                초등 4학년 과학
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              먹이사슬과 먹이그물로 배우는 생태계 균형 실험실
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            title="초등학교 4학년 생태계 교과서 핵심 개념"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>탐구 가이드</span>
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors shadow-2xs cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>명예의 전당</span>
            {sheetUrl && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="구글 시트 동기화 중" />
            )}
          </button>

          {/* Share Public Link Button */}
          <button
            onClick={handleCopyShareLink}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold border transition-all cursor-pointer shadow-2xs ${
              copied
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200'
            }`}
            title="학생 및 누구나 접속할 수 있는 공유 링크 복사"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>링크 복사완료!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-emerald-600" />
                <span>공유 링크</span>
              </>
            )}
          </button>

          {sheetUrl && (
            <a
              href={sheetUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              title="연동된 구글 스프레드시트 새 창에서 열기"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>구글시트 열기</span>
            </a>
          )}

          {isSimulating ? (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>실험 다시하기</span>
            </button>
          ) : null}

          {/* User Auth Section */}
          <div className="border-l border-slate-200 pl-2 sm:pl-3 flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || '사용자'}
                    className="w-7 h-7 rounded-full border border-emerald-300 shadow-2xs"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="hidden lg:inline text-xs font-semibold text-slate-700 truncate max-w-[100px]">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="로그아웃"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors shadow-2xs"
                title="Google 계정으로 로그인하여 기록을 구글시트에 영구 저장하세요"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="hidden sm:inline">Google 연동</span>
                <span className="sm:hidden">로그인</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
