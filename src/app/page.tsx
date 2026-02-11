'use client';

import { useState, useEffect, useCallback } from 'react';
import playersData from '@/data/players.json';
import { Player, createPlayer, simulatePossession } from '@/lib/gameEngine';

export default function GamePage() {
  const [homeRoster, setHomeRoster] = useState<Player[]>(playersData.kyoto.map(createPlayer));
  const [awayRoster, setAwayRoster] = useState<Player[]>(playersData.rival.map(createPlayer));
  
  const [homeOnCourt, setHomeOnCourt] = useState<Player[]>(homeRoster.slice(0, 5));
  const [awayOnCourt, setAwayOnCourt] = useState<Player[]>(awayRoster.slice(0, 5));
  
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [time, setTime] = useState(600); // 10 minutes
  const [quarter, setQuarter] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const nextTurn = useCallback(() => {
    if (time <= 0) {
      setIsPlaying(false);
      return;
    }

    const possessionTime = Math.floor(Math.random() * 10) + 15;
    setTime(prev => Math.max(0, prev - possessionTime));

    const isHomeOffense = Math.random() > 0.5;
    const { pts, log } = simulatePossession(
      isHomeOffense ? homeOnCourt : awayOnCourt,
      isHomeOffense ? awayOnCourt : homeOnCourt
    );

    if (isHomeOffense) setHomeScore(s => s + pts);
    else setAwayScore(s => s + pts);

    setLogs(prev => [log, ...prev].slice(0, 10));

    // Stamina drain
    const drain = (p: Player) => ({ ...p, currentStamina: Math.max(0, p.currentStamina - 0.5) });
    setHomeOnCourt(prev => prev.map(drain));
    setAwayOnCourt(prev => prev.map(drain));
  }, [time, homeOnCourt, awayOnCourt]);

  useEffect(() => {
    let interval: any;
    if (isPlaying && time > 0) {
      interval = setInterval(() => {
        nextTurn();
      }, 500); // UI Tick (every 0.5s in real life = 1 possession in game)
    }
    return () => clearInterval(interval);
  }, [isPlaying, time, nextTurn]);

  return (
    <main className="min-h-screen bg-slate-900 text-white p-4 font-mono">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header / Scoreboard */}
        <div className="bg-slate-800 rounded-xl p-6 border-4 border-slate-700 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center relative z-10">
            <div className="text-center w-1/3">
              <h2 className="text-xl font-bold text-blue-400">KYOTO</h2>
              <div className="text-6xl font-black">{homeScore}</div>
            </div>
            
            <div className="text-center w-1/3">
              <div className="bg-black/50 rounded-lg py-2 px-4 inline-block">
                <div className="text-sm text-slate-400">QUARTER {quarter}</div>
                <div className="text-4xl font-bold text-yellow-400">{formatTime(time)}</div>
              </div>
              <div className="mt-4">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-6 py-2 rounded-full font-bold transition-all ${
                    isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {isPlaying ? 'PAUSE' : 'START GAME'}
                </button>
              </div>
            </div>

            <div className="text-center w-1/3">
              <h2 className="text-xl font-bold text-red-400">RIVAL</h2>
              <div className="text-6xl font-black">{awayScore}</div>
            </div>
          </div>
        </div>

        {/* Court / Logs Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[400px]">
          {/* Home Bench */}
          <div className="bg-slate-800 p-4 rounded-lg overflow-y-auto border border-slate-700">
            <h3 className="font-bold border-b border-slate-700 mb-2 pb-1 text-blue-400 text-sm">HOME ON COURT</h3>
            <div className="space-y-2">
              {homeOnCourt.map(p => (
                <div key={p.id} className="text-xs bg-slate-700/50 p-2 rounded flex justify-between items-center">
                  <span>{p.name} <span className="text-slate-500">[{p.pos}]</span></span>
                  <span className={p.currentStamina < 30 ? 'text-red-500' : 'text-green-400'}>
                    ⚡{Math.round(p.currentStamina)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Visualization Area */}
          <div className="bg-slate-950 rounded-lg border-2 border-slate-700 flex flex-col items-center justify-center p-4 relative overflow-hidden">
             {/* Mock Court */}
             <div className="w-full h-full border border-slate-800 rounded relative">
                <div className="absolute top-1/2 left-0 right-0 border-t border-slate-800"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-slate-800 rounded-full"></div>
                
                {/* Simplified Player Dots */}
                <div className="absolute top-1/4 left-1/2 w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-red-500 rounded-full animate-bounce shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-slate-800 text-4xl font-bold uppercase opacity-20">B-LEAGUE SIM</span>
                </div>
             </div>
          </div>

          {/* Game Logs */}
          <div className="bg-slate-800 p-4 rounded-lg overflow-y-auto border border-slate-700">
            <h3 className="font-bold border-b border-slate-700 mb-2 pb-1 text-yellow-400 text-sm">PLAY BY PLAY</h3>
            <div className="space-y-2">
              {logs.map((log, i) => (
                <div key={i} className={`text-[10px] p-2 rounded ${
                  i === 0 ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'
                }`}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[10px] text-slate-500 mt-8">
          Developed by Crow Assistant x Manager obi
        </div>
      </div>
    </main>
  );
}
