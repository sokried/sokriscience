import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  EcosystemMode,
  TrophicLevel,
  FoodWebLink,
  LeaderboardRecord,
} from './types/ecosystem';
import { ORGANISMS, ORGANISMS_BY_LEVEL, isValidTrophicLink } from './data/organisms';
import { initAuth, googleSignIn, logout } from './services/firebase';
import {
  saveRecord,
  fetchLeaderboard,
  deleteRecord,
  getOrCreateSpreadsheet,
} from './services/sheetsService';

import { Header } from './components/Header';
import { ModeSelector } from './components/ModeSelector';
import { OrganismSelector } from './components/OrganismSelector';
import { FoodWebBuilder } from './components/FoodWebBuilder';
import { PopulationAdjuster } from './components/PopulationAdjuster';
import { EcosystemTerrarium } from './components/EcosystemTerrarium';
import { GameOverModal } from './components/GameOverModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ScienceGuideModal } from './components/ScienceGuideModal';

type AppStep =
  | 'mode_selection'
  | 'organism_selection'
  | 'food_web_builder'
  | 'population_adjuster'
  | 'simulation';

export default function App() {
  // Navigation & Step State
  const [currentStep, setCurrentStep] = useState<AppStep>('mode_selection');
  const [mode, setMode] = useState<EcosystemMode>('food_chain');

  // Selected Organisms (Ids)
  // Default food chain start: grass, rabbit, snake
  const [selectedOrganismIds, setSelectedOrganismIds] = useState<string[]>([
    'grass',
    'rabbit',
    'snake',
  ]);

  // Food Web Links (Prey -> Predator)
  const [links, setLinks] = useState<FoodWebLink[]>([
    { fromId: 'grass', toId: 'rabbit' },
    { fromId: 'rabbit', toId: 'snake' },
  ]);

  // Initial populations set by sliders
  const [populations, setPopulations] = useState<Record<string, number>>({
    grass: 500,
    rabbit: 120,
    snake: 30,
  });

  // User Auth & Sheets
  const [user, setUser] = useState<User | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string | undefined>(undefined);
  const [leaderboardRecords, setLeaderboardRecords] = useState<LeaderboardRecord[]>([]);
  const [isLeaderboardFromSheet, setIsLeaderboardFromSheet] = useState<boolean>(false);

  // Modals
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [gameOverData, setGameOverData] = useState<{
    survivalSeconds: number;
    balanceScore: number;
    reason: string;
  } | null>(null);

  // Load Leaderboard data
  const loadLeaderboardData = useCallback(async () => {
    try {
      const res = await fetchLeaderboard();
      setLeaderboardRecords(res.records);
      setIsLeaderboardFromSheet(res.fromSheet);
      if (res.sheetUrl) {
        setSheetUrl(res.sheetUrl);
      }
    } catch (err) {
      console.warn('Failed to load leaderboard:', err);
    }
  }, []);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      async (authedUser) => {
        setUser(authedUser);
        try {
          const sheet = await getOrCreateSpreadsheet();
          setSheetUrl(sheet.url);
        } catch {}
        loadLeaderboardData();
      },
      () => {
        setUser(null);
        loadLeaderboardData();
      }
    );

    // Initial load of local or cached leaderboard
    loadLeaderboardData();

    return () => unsubscribe();
  }, [loadLeaderboardData]);

  // Sign-in handler
  const handleLogin = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        const sheet = await getOrCreateSpreadsheet();
        setSheetUrl(sheet.url);
        await loadLeaderboardData();
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    loadLeaderboardData();
  };

  // Step 1: Mode change
  const handleSelectMode = (newMode: EcosystemMode) => {
    setMode(newMode);
    if (newMode === 'food_chain') {
      // Set default 1 per level
      setSelectedOrganismIds(['grass', 'rabbit', 'snake']);
      setLinks([
        { fromId: 'grass', toId: 'rabbit' },
        { fromId: 'rabbit', toId: 'snake' },
      ]);
    } else {
      // Default food web with rich connections
      setSelectedOrganismIds(['grass', 'fruit_tree', 'rabbit', 'grasshopper', 'frog', 'snake', 'eagle']);
      setLinks([
        { fromId: 'grass', toId: 'rabbit' },
        { fromId: 'grass', toId: 'grasshopper' },
        { fromId: 'fruit_tree', toId: 'rabbit' },
        { fromId: 'grasshopper', toId: 'frog' },
        { fromId: 'frog', toId: 'snake' },
        { fromId: 'rabbit', toId: 'eagle' },
        { fromId: 'snake', toId: 'eagle' },
      ]);
    }
  };

  // Step 2: Organism selection handlers
  const handleToggleOrganism = (id: string, level: TrophicLevel) => {
    setSelectedOrganismIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectSingleOrganism = (level: TrophicLevel, id: string | null) => {
    // Used in Food Chain mode (replace organism of this level)
    const levelOrganisms = ORGANISMS_BY_LEVEL[level].map((o) => o.id);
    setSelectedOrganismIds((prev) => {
      const filtered = prev.filter((existingId) => !levelOrganisms.includes(existingId));
      return id ? [...filtered, id] : filtered;
    });
  };

  // Move from Organism selection to next step
  const handleProceedFromOrganisms = () => {
    // Sync populations for selected organisms
    setPopulations((prev) => {
      const next: Record<string, number> = {};
      selectedOrganismIds.forEach((id) => {
        next[id] = prev[id] || ORGANISMS[id]?.defaultInitialCount || 50;
      });
      return next;
    });

    if (mode === 'food_chain') {
      // In Food Chain mode, automatically establish linear links:
      // Producer -> Primary -> Secondary -> (Tertiary)
      const chainLinks: FoodWebLink[] = [];
      const prod = selectedOrganismIds.find((id) => ORGANISMS[id]?.level === 'producer');
      const pri = selectedOrganismIds.find((id) => ORGANISMS[id]?.level === 'primary');
      const sec = selectedOrganismIds.find((id) => ORGANISMS[id]?.level === 'secondary');
      const ter = selectedOrganismIds.find((id) => ORGANISMS[id]?.level === 'tertiary');

      if (prod && pri) chainLinks.push({ fromId: prod, toId: pri });
      if (pri && sec) chainLinks.push({ fromId: pri, toId: sec });
      if (sec && ter) chainLinks.push({ fromId: sec, toId: ter });

      setLinks(chainLinks);
      setCurrentStep('population_adjuster');
    } else {
      // In Food Web mode, proceed to FoodWebBuilder to configure predator-prey links
      // Generate default legitimate links
      const legitimateLinks: FoodWebLink[] = [];
      for (const p of selectedOrganismIds) {
        for (const q of selectedOrganismIds) {
          if (isValidTrophicLink(p, q)) {
            legitimateLinks.push({ fromId: p, toId: q });
          }
        }
      }
      setLinks(legitimateLinks);
      setCurrentStep('food_web_builder');
    }
  };

  // Step 4: Population change
  const handleChangePopulation = (id: string, count: number) => {
    setPopulations((prev) => ({
      ...prev,
      [id]: count,
    }));
  };

  const handleResetToDefaults = () => {
    const next: Record<string, number> = {};
    selectedOrganismIds.forEach((id) => {
      next[id] = ORGANISMS[id]?.defaultInitialCount || 50;
    });
    setPopulations(next);
  };

  // Step 5: Start Simulation!
  const handleStartSimulation = () => {
    setGameOverData(null);
    setCurrentStep('simulation');
  };

  // Game Over Trigger
  const handleGameOver = (finalSeconds: number, balanceScore: number, reason: string) => {
    setGameOverData({
      survivalSeconds: finalSeconds,
      balanceScore,
      reason,
    });
  };

  // Save Record
  const handleSaveRecord = async (playerName: string) => {
    if (!gameOverData) return { syncedToSheets: false };

    const organismsSummary = selectedOrganismIds
      .map((id) => ORGANISMS[id]?.name.split(' ')[0])
      .filter(Boolean)
      .join(', ');

    const newRecord: LeaderboardRecord = {
      id: `record-${Date.now()}`,
      playerName,
      mode,
      modeKorean: mode === 'food_web' ? '먹이그물' : '먹이사슬',
      organismsSummary,
      survivalSeconds: gameOverData.survivalSeconds,
      formattedTime: new Date(gameOverData.survivalSeconds * 1000).toISOString().substr(14, 8),
      balanceScore: gameOverData.balanceScore,
      createdAt: new Date().toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const res = await saveRecord(newRecord);
    await loadLeaderboardData();
    return res;
  };

  // Reset experimental lab
  const handleResetApp = () => {
    setGameOverData(null);
    setCurrentStep('mode_selection');
  };

  // Delete Record via Admin
  const handleDeleteRecord = async (record: LeaderboardRecord) => {
    const res = await deleteRecord(record);
    await loadLeaderboardData();
    return res;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased font-sans">
      {/* Top Header */}
      <Header
        user={user}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onOpenGuide={() => setShowGuide(true)}
        onReset={handleResetApp}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isSimulating={currentStep === 'simulation'}
        sheetUrl={sheetUrl}
      />

      {/* Main App Workspace */}
      <main className="flex-1 pb-16">
        {currentStep === 'mode_selection' && (
          <ModeSelector
            selectedMode={mode}
            onSelectMode={handleSelectMode}
            onNext={() => setCurrentStep('organism_selection')}
          />
        )}

        {currentStep === 'organism_selection' && (
          <OrganismSelector
            mode={mode}
            selectedOrganisms={selectedOrganismIds}
            onToggleOrganism={handleToggleOrganism}
            onSelectSingleOrganism={handleSelectSingleOrganism}
            onNext={handleProceedFromOrganisms}
            onBack={() => setCurrentStep('mode_selection')}
          />
        )}

        {currentStep === 'food_web_builder' && (
          <FoodWebBuilder
            selectedOrganismIds={selectedOrganismIds}
            links={links}
            onSetLinks={setLinks}
            onNext={() => setCurrentStep('population_adjuster')}
            onBack={() => setCurrentStep('organism_selection')}
          />
        )}

        {currentStep === 'population_adjuster' && (
          <PopulationAdjuster
            selectedOrganismIds={selectedOrganismIds}
            populations={populations}
            onChangePopulation={handleChangePopulation}
            onResetToDefaults={handleResetToDefaults}
            onStartSimulation={handleStartSimulation}
            onBack={() =>
              setCurrentStep(mode === 'food_web' ? 'food_web_builder' : 'organism_selection')
            }
          />
        )}

        {currentStep === 'simulation' && (
          <EcosystemTerrarium
            selectedOrganismIds={selectedOrganismIds}
            initialPopulations={populations}
            links={links}
            onGameOver={handleGameOver}
            onReset={handleResetApp}
          />
        )}
      </main>

      {/* Game Over Modal */}
      {gameOverData && (
        <GameOverModal
          survivalSeconds={gameOverData.survivalSeconds}
          balanceScore={gameOverData.balanceScore}
          reason={gameOverData.reason}
          mode={mode}
          organismsSummary={selectedOrganismIds
            .map((id) => ORGANISMS[id]?.name.split(' ')[0])
            .join(', ')}
          onSaveRecord={handleSaveRecord}
          onViewLeaderboard={() => {
            setGameOverData(null);
            setShowLeaderboard(true);
          }}
          onRestart={handleResetApp}
        />
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal
          records={leaderboardRecords}
          user={user}
          sheetUrl={sheetUrl}
          fromSheet={isLeaderboardFromSheet}
          onClose={() => setShowLeaderboard(false)}
          onRefresh={loadLeaderboardData}
          onLogin={handleLogin}
          onDeleteRecord={handleDeleteRecord}
        />
      )}

      {/* 4th Grade Science Guide Modal */}
      {showGuide && <ScienceGuideModal onClose={() => setShowGuide(false)} />}
    </div>
  );
}
