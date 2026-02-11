'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import playersData from '@/data/players.json';
import { Player, createPlayer, simulatePossession, handleRebound } from '@/lib/gameEngine';

type GamePhase = 'PRE_GAME' | 'PLAYING' | 'PAUSED' | 'QUARTER_BREAK' | 'GAME_OVER';

export default function GamePage() {
  // Game Configuration
  const SPEED_MULTIPLIER = 5; 
  const TICK_MS = 1000 / SPEED_MULTIPLIER; // 1 game second = 200ms real time
  const Q_LENGTH = 600; // 10 mins

  // State: Rosters
  const [homeTeamKey] = useState('kyoto');
  const [awayTeamKey] = useState('tokyo');
  const [homeRoster, setHomeRoster] = useState<Player[]>([]);
  const [awayRoster, setAwayRoster] = useState<Player[]>([]);
  
  // State: On Court
  const [homeOnCourt, setHomeOnCourt] = useState<Player[]>([]);
  const [awayOnCourt, setAwayOnCourt] = useState<Player[]>([]);
  
  // State: Game Stats
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [gameTime, setGameTime] = useState(Q_LENGTH);
  const [quarter, setQuarter] = useState(1);
  const [phase, setPhase] = useState<GamePhase>('PRE_GAME');
  const [logs, setLogs] = useState<string[]>([]);
  const [isHomePossession, setIsHomePossession] = useState(true);

  // Initialize rosters
  useEffect(() => {
    const h = (playersData.teams as any)[homeTeamKey];
    const a = (playersData.teams as any)[awayTeamKey];
    const hRoster = h.roster.map((p: any) => createPlayer(p, h.name));
    const aRoster = a.roster.map((p: any) => createPlayer(p, a.name));
    setHomeRoster(hRoster);
    setAwayRoster(aRoster);
    setHomeOnCourt(hRoster.slice(0, 5));
    setAwayOnCourt(aRoster.slice(0, 5));
  }, [homeTeamKey, awayTeamKey]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubstitution = (side: 'home' | 'away', onCourtId: string, benchId: string) => {
    if (side === 'home') {
      const newBench = homeRoster.find(p => p.id === benchId);
      const newOnCourt = homeOnCourt.map(p => p.id === onCourtId ? newBench! : p);
      setHomeOnCourt(newOnCourt);
    } else {
      const newBench = awayRoster.find(p => p.id === benchId);
      const newOnCourt = awayOnCourt.map(p => p.id === onCourtId ? newBench! : p);
      setAwayOnCourt(newOnCourt);
    }
    setLogs(prev => [`交代完了`, ...prev].slice(0, 10));
  };

  const processTick = useCallback(() => {
    if (gameTime <= 0) {
      if (quarter < 4) {
        setPhase('QUARTER_BREAK');
      } else {
        setPhase('GAME_OVER');
      }
      return;
    }

    // 1 tick = 1 second in game time
    setGameTime(prev => prev - 1);

    // Every ~20 seconds a possession happens
    if (gameTime % 20 === 0) {
      const offense = isHomePossession ? homeOnCourt : awayOnCourt;
      const defense = isHomePossession ? awayOnCourt : homeOnCourt;
      
      const { pts, log } = simulatePossession(offense, defense, isHomePossession);
      
      if (pts > 0) {
        if (isHomePossession) setHomeScore(s => s + pts);
        else setAwayScore(s => s + pts);
        setIsHomePossession(!isHomePossession);
      } else {
        // Rebound
        const { isOffensive, player } = handleRebound(offense, defense);
        const rebLog = ` >> [${player.team}] ${player.name} がリバウンド奪取！ (${isOffensive ? '攻撃継続' : '攻守交代'})`;
        setLogs(prev => [rebLog, ...prev].slice(0, 10));
        if (!isOffensive) setIsHomePossession(!isHomePossession);
      }
      setLogs(prev => [log, ...prev].slice(0, 10));
    }

    // Stamina drain (on court only)
    const drain = (p: Player) => ({ ...p, currentStamina: Math.max(0, p.currentStamina - 0.05) });
    setHomeOnCourt(prev => prev.map(drain));
    setAwayOnCourt(prev => prev.map(drain));
    
    // Stamina recovery (on bench)
    setHomeRoster(prev => prev.map(p => {
      if (homeOnCourt.find(oc => oc.id === p.id)) return p;
      return { ...p, currentStamina: Math.min(p.params.stamina, p.currentStamina + 0.1) };
    }));
  }, [gameTime, quarter, isHomePossession, homeOnCourt, awayOnCourt, homeRoster]);

  useEffect(() => {
    let interval: any;
    if (phase === 'PLAYING') {
      interval = setInterval(processTick, TICK_MS);
    }
    return () => clearInterval(interval);
  }, [phase, processTick, TICK_MS]);

  const startNextQuarter = () => {
    setQuarter(q => q + 1);
    setGameTime(Q_LENGTH);
    setPhase('PLAYING');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans select-none">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar: Home Management */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900 border border-blue-900/50 rounded-xl p-4 shadow-lg">
            <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              KYOTO HC PANEL
            </h3>
            <div className="space-y-2">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">On Court</div>
              {homeOnCourt.map(p => (
                <div key={p.id} className="bg-slate-800 p-2 rounded border border-slate-700 flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold">{p.name}</span>
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
          {/* Scoreboard */}
          <div className="bg-slate-900 rounded-2xl p-8 border-b-4 border-blue-600 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-white to-red-600 opacity-50"></div>
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="text-sm font-bold text-blue-400 mb-1">HOME</div>
                <div className="text-7xl font-black tabular-nums tracking-tighter text-white">{homeScore}</div>
              </div>
              
              <div className="text-center flex flex-col items-center">
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-6 py-2 mb-4">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Q{quarter}</div>
                  <div className={`text-5xl font-mono font-bold tabular-nums ${gameTime < 60 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
                    {formatTime(gameTime)}
                  </div>
                </div>
                
                {phase === 'PRE_GAME' && (
                  <button onClick={() => setPhase('PLAYING')} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-black text-lg transition-transform active:scale-95 shadow-xl">
                    TIP OFF
                  </button>
                )}
                {phase === 'PLAYING' && (
                  <button onClick={() => setPhase('PAUSED')} className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-full font-bold text-sm">
                    TIMEOUT
                  </button>
                )}
                {phase === 'PAUSED' && (
                  <button onClick={() => setPhase('PLAYING')} className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-full font-black text-lg">
                    RESUME
                  </button>
                )}
                {phase === 'QUARTER_BREAK' && (
                  <button onClick={startNextQuarter} className="bg-yellow-600 hover:bg-yellow-500 text-white px-8 py-3 rounded-full font-black text-lg">
                    START Q{quarter + 1}
                  </button>
                )}
              </div>

              <div className="text-center">
                <div className="text-sm font-bold text-red-400 mb-1">AWAY</div>
                <div className="text-7xl font-black tabular-nums tracking-tighter text-white">{awayScore}</div>
              </div>
            </div>
          </div>

          {/* Court Visualization */}
          <div className="aspect-[16/9] bg-slate-900 rounded-2xl border-2 border-slate-800 relative overflow-hidden shadow-inner">
             {/* Simple Canvas Area */}
             <div className="absolute inset-4 border-2 border-slate-800/50 rounded-sm">
                <div className="absolute top-0 bottom-0 left-1/2 border-l border-slate-800/50"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-slate-800/50 rounded-full"></div>
                
                {/* Score Indicators */}
                <div className={`absolute top-1/2 left-1/4 -translate-y-1/2 transition-opacity duration-300 ${isHomePossession ? 'opacity-100' : 'opacity-20'}`}>
                  <div className="w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,1)]"></div>
                </div>
                <div className={`absolute top-1/2 right-1/4 -translate-y-1/2 transition-opacity duration-300 ${!isHomePossession ? 'opacity-100' : 'opacity-20'}`}>
                  <div className="w-4 h-4 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,1)]"></div>
                </div>
             </div>
             
             {phase === 'QUARTER_BREAK' && (
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                 <div className="text-center">
                   <h2 className="text-3xl font-black text-yellow-400 mb-2">QUARTER END</h2>
                   <p className="text-slate-300">インターバル：選手交代を検討してください</p>
                 </div>
               </div>
             )}
          </div>

          {/* Logs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-48 overflow-y-auto scrollbar-hide">
            <div className="space-y-2">
              {logs.map((log, i) => (
                <div key={i} className={`text-xs p-2 rounded flex items-center gap-3 ${i === 0 ? 'bg-slate-800 border-l-4 border-yellow-500' : 'opacity-50'}`}>
                  <span className="text-[10px] font-mono text-slate-500">POSS</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Game Info / Standings */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-3">Game Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                   <span className="text-xs text-slate-500">Possession</span>
                   <span className={`text-sm font-bold ${isHomePossession ? 'text-blue-400' : 'text-red-400'}`}>
                     {isHomePossession ? 'KYOTO' : 'TOKYO'}
                   </span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="h-full bg-blue-500 transition-all" style={{ width: `${(homeScore/(homeScore+awayScore || 1))*100}%` }}></div>
                  <div className="h-full bg-red-500 transition-all" style={{ width: `${(awayScore/(homeScore+awayScore || 1))*100}%` }}></div>
                </div>
              </div>
           </div>

           <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
             <p className="text-[10px] text-slate-500 mb-2">Simulation Mode: v0.2</p>
             <p className="text-xs text-slate-400 leading-relaxed italic">「能力の詳細は秘密。HCの直感と選手の体力、そして試合の流れを信じろ。」</p>
           </div>
        </div>
      </div>

      {phase === 'GAME_OVER' && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50">
          <div className="text-center scale-110">
            <h1 className="text-6xl font-black mb-4">GAME OVER</h1>
            <div className="text-4xl font-bold mb-8">
              <span className="text-blue-400">KYOTO {homeScore}</span> - <span className="text-red-400">{awayScore} TOKYO</span>
            </div>
            <button onClick={() => window.location.reload()} className="bg-white text-black px-12 py-4 rounded-full font-black text-xl hover:bg-slate-200 transition-colors">
              REMATCH
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
