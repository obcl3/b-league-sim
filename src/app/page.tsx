'use client';

import { useState, useEffect, useCallback } from 'react';
import playersData from '@/data/players.json';
import { Player, createPlayer, simulatePossession, handleRebound, checkOnTheCourtRule } from '@/lib/gameEngine';

type GamePhase = 'TEAM_SELECT' | 'STORY_INTRO' | 'PRE_GAME' | 'PLAYING' | 'PAUSED' | 'QUARTER_BREAK' | 'GAME_OVER';

export default function GamePage() {
  const SPEED_MULTIPLIER = 5; 
  const TICK_MS = 1000 / SPEED_MULTIPLIER;
  const Q_LENGTH = 600;

  // Game Progress
  const [phase, setPhase] = useState<GamePhase>('TEAM_SELECT');
  const [selectedTeamKey, setSelectedTeamKey] = useState<string>('');
  const [opponentTeamKey] = useState('tokyo');

  // Rosters
  const [homeRoster, setHomeRoster] = useState<Player[]>([]);
  const [awayRoster, setAwayRoster] = useState<Player[]>([]);
  const [homeOnCourt, setHomeOnCourt] = useState<Player[]>([]);
  const [awayOnCourt, setAwayOnCourt] = useState<Player[]>([]);
  
  // Stats
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [gameTime, setGameTime] = useState(Q_LENGTH);
  const [quarter, setQuarter] = useState(1);
  const [logs, setLogs] = useState<string[]>([]);
  const [isHomePossession, setIsHomePossession] = useState(true);

  // Initialize rosters based on selection
  useEffect(() => {
    if (!selectedTeamKey) return;
    const h = (playersData.teams as any)[selectedTeamKey];
    const a = (playersData.teams as any)[opponentTeamKey];
    const hRoster = h.roster.map((p: any) => createPlayer(p, h.name));
    const aRoster = a.roster.map((p: any) => createPlayer(p, a.name));
    setHomeRoster(hRoster);
    setAwayRoster(aRoster);
    setHomeOnCourt(hRoster.slice(0, 5));
    setAwayOnCourt(aRoster.slice(0, 5));
  }, [selectedTeamKey, opponentTeamKey]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubstitution = (side: 'home' | 'away', onCourtId: string, benchId: string) => {
    if (side === 'home') {
      const newBench = homeRoster.find(p => p.id === benchId);
      const testOnCourt = homeOnCourt.map(p => p.id === onCourtId ? newBench! : p);
      
      if (!checkOnTheCourtRule(testOnCourt)) {
        alert("外国籍選手は同時に2人までしかコートに立てません！");
        return;
      }
      setHomeOnCourt(testOnCourt);
    } else {
      const newBench = awayRoster.find(p => p.id === benchId);
      const testOnCourt = awayOnCourt.map(p => p.id === onCourtId ? newBench! : p);
      if (!checkOnTheCourtRule(testOnCourt)) return;
      setAwayOnCourt(testOnCourt);
    }
  };

  const processTick = useCallback(() => {
    if (gameTime <= 0) {
      // Recovery at end of quarter
      const recover = (p: Player) => ({ ...p, currentStamina: Math.min(p.params.stamina, p.currentStamina + 10) });
      setHomeRoster(prev => prev.map(recover));
      setHomeOnCourt(prev => prev.map(recover));
      
      if (quarter < 4) setPhase('QUARTER_BREAK');
      else setPhase('GAME_OVER');
      return;
    }

    setGameTime(prev => prev - 1);

    if (gameTime % 20 === 0) {
      const offense = isHomePossession ? homeOnCourt : awayOnCourt;
      const defense = isHomePossession ? awayOnCourt : homeOnCourt;
      const { pts, log } = simulatePossession(offense, defense, isHomePossession);
      if (pts > 0) {
        if (isHomePossession) setHomeScore(s => s + pts);
        else setAwayScore(s => s + pts);
        setIsHomePossession(!isHomePossession);
      } else {
        const { isOffensive, player } = handleRebound(offense, defense);
        if (!isOffensive) setIsHomePossession(!isHomePossession);
      }
      setLogs(prev => [log, ...prev].slice(0, 10));
    }

    // Stamina drain/recovery
    setHomeOnCourt(prev => prev.map(p => ({ ...p, currentStamina: Math.max(0, p.currentStamina - 0.05) })));
    setHomeRoster(prev => prev.map(p => {
      const isOnCourt = homeOnCourt.find(oc => oc.id === p.id);
      if (isOnCourt) return isOnCourt;
      return { ...p, currentStamina: Math.min(p.params.stamina, p.currentStamina + 0.15) };
    }));
  }, [gameTime, quarter, isHomePossession, homeOnCourt, awayOnCourt, homeRoster]);

  useEffect(() => {
    let interval: any;
    if (phase === 'PLAYING') interval = setInterval(processTick, TICK_MS);
    return () => clearInterval(interval);
  }, [phase, processTick, TICK_MS]);

  if (phase === 'TEAM_SELECT') {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl">
          <h1 className="text-3xl font-black mb-6 text-center tracking-tighter">B.LEAGUE SIM 25-26</h1>
          <p className="text-slate-400 text-sm mb-8 text-center">指揮を執るチームを選択してください。</p>
          <div className="space-y-3">
            {Object.entries(playersData.teams).map(([key, team]: [string, any]) => (
              <button 
                key={key}
                onClick={() => { setSelectedTeamKey(key); setPhase('STORY_INTRO'); }}
                className="w-full bg-slate-800 hover:bg-blue-600 p-4 rounded-xl font-bold transition-all text-left flex justify-between items-center group"
              >
                {team.name}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (phase === 'STORY_INTRO') {
    const teamName = (playersData.teams as any)[selectedTeamKey].name;
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans">
        <div className="max-w-xl w-full bg-slate-900 p-10 rounded-3xl border-t-4 border-blue-600 shadow-2xl">
          <h2 className="text-xl font-bold text-blue-400 mb-4 uppercase tracking-widest">New Appointment</h2>
          <p className="text-2xl font-black mb-6 leading-tight text-slate-100">
            「今日から君が、{teamName}の新たなヘッドコーチだ。」
          </p>
          <div className="space-y-4 text-slate-400 leading-relaxed mb-10">
            <p>2025-26シーズン、B1の舞台はかつてない激戦を迎えている。</p>
            <p>ファンの期待、フロントのプレッシャー。すべては君の采配にかかっている。全60試合の長い戦いが、今ここから始まる。</p>
          </div>
          <button 
            onClick={() => setPhase('PRE_GAME')}
            className="w-full bg-white text-black py-4 rounded-full font-black text-lg hover:bg-slate-200 transition-colors shadow-lg"
          >
            初戦に挑む
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans select-none">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar: Home Management */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900 border border-blue-900/50 rounded-xl p-4 shadow-lg">
            <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              HC PANEL
            </h3>
            <div className="space-y-2">
              {homeOnCourt.map(p => (
                <div key={p.id} className="bg-slate-800 p-2 rounded border border-slate-700 flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold">{p.name} {p.isForeign && <span className="text-[8px] bg-slate-600 px-1 rounded ml-1">外</span>}</span>
                    <span className="text-[10px] opacity-60">{p.pos}</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${p.currentStamina < 30 ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${(p.currentStamina / p.params.stamina) * 100}%` }}
                    ></div>
                  </div>
                  <select 
                    className="mt-1 bg-slate-950 text-[10px] border border-slate-700 rounded p-1"
                    onChange={(e) => handleSubstitution('home', p.id, e.target.value)}
                    value=""
                  >
                    <option value="" disabled>選手交代...</option>
                    {homeRoster.filter(r => !homeOnCourt.find(oc => oc.id === r.id)).map(bench => (
                      <option key={bench.id} value={bench.id}>{bench.name} (⚡{Math.round(bench.currentStamina)})</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Main Game Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-2xl p-8 border-b-4 border-blue-600 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="text-sm font-bold text-blue-400 mb-1">HOME</div>
                <div className="text-7xl font-black tabular-nums tracking-tighter text-white">{homeScore}</div>
              </div>
              <div className="text-center flex flex-col items-center">
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-6 py-2 mb-4">
                  <div className="text-xs text-slate-500 font-bold tracking-widest">Q{quarter}</div>
                  <div className={`text-5xl font-mono font-bold tabular-nums ${gameTime < 60 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
                    {formatTime(gameTime)}
                  </div>
                </div>
                {phase === 'PRE_GAME' && <button onClick={() => setPhase('PLAYING')} className="bg-blue-600 text-white px-8 py-3 rounded-full font-black shadow-xl">TIP OFF</button>}
                {phase === 'PLAYING' && <button onClick={() => setPhase('PAUSED')} className="bg-slate-700 text-white px-6 py-2 rounded-full font-bold text-sm">TIMEOUT</button>}
                {phase === 'PAUSED' && <button onClick={() => setPhase('PLAYING')} className="bg-green-600 text-white px-8 py-3 rounded-full font-black text-lg">RESUME</button>}
                {phase === 'QUARTER_BREAK' && <button onClick={() => { setQuarter(q => q + 1); setGameTime(Q_LENGTH); setPhase('PLAYING'); }} className="bg-yellow-600 text-white px-8 py-3 rounded-full font-black text-lg">START Q{quarter + 1}</button>}
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-red-400 mb-1">AWAY</div>
                <div className="text-7xl font-black tabular-nums tracking-tighter text-white">{awayScore}</div>
              </div>
            </div>
          </div>
          <div className="aspect-[16/9] bg-slate-900 rounded-2xl border-2 border-slate-800 relative overflow-hidden">
             <div className="absolute inset-4 border-2 border-slate-800/50 rounded-sm">
                <div className="absolute top-0 bottom-0 left-1/2 border-l border-slate-800/50"></div>
                <div className={`absolute top-1/2 left-1/4 -translate-y-1/2 ${isHomePossession ? 'opacity-100' : 'opacity-20'}`}><div className="w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,1)]"></div></div>
                <div className={`absolute top-1/2 right-1/4 -translate-y-1/2 ${!isHomePossession ? 'opacity-100' : 'opacity-20'}`}><div className="w-4 h-4 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,1)]"></div></div>
             </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-48 overflow-y-auto">
            <div className="space-y-2">
              {logs.map((log, i) => (
                <div key={i} className={`text-xs p-2 rounded ${i === 0 ? 'bg-slate-800 border-l-4 border-yellow-500' : 'opacity-50'}`}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
           <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
             <p className="text-[10px] text-slate-500 mb-2">Manager obi Mode</p>
             <p className="text-xs text-slate-400 italic">「外国籍選手は2人まで。スタミナを温存しろ。」</p>
           </div>
        </div>
      </div>
      {phase === 'GAME_OVER' && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50">
          <div className="text-center">
            <h1 className="text-6xl font-black mb-4">GAME OVER</h1>
            <div className="text-4xl font-bold mb-8">KYOTO {homeScore} - {awayScore} TOKYO</div>
            <button onClick={() => window.location.reload()} className="bg-white text-black px-12 py-4 rounded-full font-black text-xl">NEW CAREER</button>
          </div>
        </div>
      )}
    </main>
  );
}
