/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Navigation, 
  RotateCcw, 
  Play, 
  Map as MapIcon,
  Flag,
  Accessibility,
  Square,
  Zap
} from 'lucide-react';
import { dijkstraGenerator, Node, PathStep } from '../logic/shortestPath';

import { useAudio } from '../contexts/AudioContext';

const GRID_SIZE = 15;

export default function Pathfinding() {
  const { speak, isSpeaking } = useAudio();
  const [grid, setGrid] = useState<number[][]>(Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(1)));

  const handleTutorAdvice = () => {
    const desc = status === 'done'
      ? `Pathfinding sequence complete. Dijkstra's algorithm successfully navigated the grid. The highlighted amber nodes represent the optimal path based on calculated reachability costs.`
      : status === 'solving'
      ? `Search frontier expansion in progress. The algorithm is currently scanning neighboring nodes to find the shortest cumulative distance. Indigo nodes mark the current search perimeter.`
      : `Grid initialized. Use the mapping tools to place blockades or rough terrain. Dijkstra will find the absolute shortest path by evaluating the weight of every traversal choice.`;
    speak("Path Maze", desc);
  };
  const [start, setStart] = useState<Node>({ r: 2, c: 2 });
  const [end, setEnd] = useState<Node>({ r: 12, c: 12 });
  const [step, setStep] = useState<PathStep | null>(null);
  const [status, setStatus] = useState<'idle' | 'solving' | 'done'>('idle');
  const [playbackSpeed, setPlaybackSpeed] = useState(20);
  const [tool, setTool] = useState<'wall' | 'weight' | 'start' | 'end'>('wall');

  const solverRef = useRef<Generator<PathStep> | null>(null);
  const intervalRef = useRef<number | null>(null);

  const resetGrid = () => {
    stopSolving();
    setGrid(Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(1)));
    setStep(null);
    setStatus('idle');
  };

  const stopSolving = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
    solverRef.current = null;
  };

  const startSolving = () => {
    stopSolving();
    setStatus('solving');
    solverRef.current = dijkstraGenerator(grid, start, end);
    resumeSolving();
  };

  const resumeSolving = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = window.setInterval(() => {
      if (!solverRef.current) return;
      const { value, done } = solverRef.current.next();
      if (done) {
        stopSolving();
        setStep(value);
        setStatus('done');
        return;
      }
      setStep(value);
    }, playbackSpeed);
  }, [playbackSpeed]);

  useEffect(() => {
    if (status === 'solving') {
      stopSolving();
      resumeSolving();
    }
  }, [playbackSpeed, resumeSolving]);

  const handleCellClick = (r: number, c: number) => {
    if (status === 'solving') return;
    const newGrid = grid.map(row => [...row]);
    
    if (tool === 'start') {
      if (newGrid[r][c] !== -1) setStart({ r, c });
    } else if (tool === 'end') {
      if (newGrid[r][c] !== -1) setEnd({ r, c });
    } else if (tool === 'wall') {
      if ((r === start.r && c === start.c) || (r === end.r && c === end.c)) return;
      newGrid[r][c] = newGrid[r][c] === -1 ? 1 : -1;
      setGrid(newGrid);
    } else if (tool === 'weight') {
      if ((r === start.r && c === start.c) || (r === end.r && c === end.c)) return;
      if (newGrid[r][c] === -1) return;
      newGrid[r][c] = newGrid[r][c] === 5 ? 1 : 5;
      setGrid(newGrid);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
      <aside className="w-full md:w-80 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col gap-6 shrink-0 z-10 overflow-y-auto">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Navigation className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight uppercase text-white">Path Maze</h1>
          </div>
          <p className="text-xs text-slate-500 font-mono tracking-widest uppercase italic border-l-2 border-indigo-500 pl-2 ml-1">Dijkstra Simulation</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Mapping Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'wall', icon: Square, label: 'Blockade' },
                { id: 'weight', icon: Accessibility, label: 'Rough Terrain' },
                { id: 'start', icon: MapIcon, label: 'Source' },
                { id: 'end', icon: Flag, label: 'Dest' },
              ].map((t) => (
                <button key={t.id} onClick={() => setTool(t.id as any)} className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${tool === t.id ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                  <t.icon className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {status !== 'solving' ? (
              <button onClick={startSolving} className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black rounded-lg transition-all active:scale-95 shadow-lg shadow-indigo-500/20 uppercase tracking-tighter"><Play className="w-5 h-5 fill-current" /> Execute Search</button>
            ) : (
                <button onClick={stopSolving} className="flex items-center justify-center gap-2 w-full py-4 bg-rose-500 text-slate-950 font-black rounded-lg transition-all uppercase tracking-tighter shadow-lg shadow-rose-500/20">Abort Operation</button>
            )}
            <button onClick={resetGrid} className="flex items-center justify-center gap-2 w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg border border-slate-700 transition-all uppercase text-xs"><RotateCcw className="w-4 h-4" /> Wipe Layout</button>
            <button 
              onClick={handleTutorAdvice} 
              disabled={isSpeaking}
              className={`flex items-center justify-center gap-2 w-full py-3 bg-slate-900 border border-emerald-500/30 text-emerald-400 font-bold rounded-lg transition-all uppercase text-[10px] tracking-widest ${isSpeaking ? 'opacity-50 animate-pulse' : 'hover:bg-emerald-500/10'}`}
            >
              <Zap className={`w-3.5 h-3.5 ${isSpeaking ? 'fill-emerald-400' : ''}`} /> 
              {isSpeaking ? 'Analyzing Stream...' : 'AI Tactical Brief'}
            </button>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Search Intensity</h3>
            <input type="range" min="1" max="200" step="1" value={201 - playbackSpeed} onChange={(e) => setPlaybackSpeed(201 - parseInt(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
            <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase tracking-widest font-bold"><span>Slow</span><span>Fast</span></div>
          </div>
          
          <div className="flex flex-col gap-2 p-4 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono"><div className="w-3 h-3 bg-indigo-500 border border-indigo-400 rounded-sm" /><span>SEARCH FRONTIER</span></div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono"><div className="w-3 h-3 bg-slate-700 border border-slate-600 rounded-sm" /><span>EXPLORED NODES</span></div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono"><div className="w-3 h-3 bg-amber-400 border border-amber-300 rounded-sm" /><span>OPTIMAL PATH</span></div>
          </div>
        </div>
      </aside>

      <main className="flex-1 bg-slate-950 p-6 md:p-12 relative flex items-center justify-center overflow-auto">
        <div className="absolute inset-0 bg-[#0f172a] opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[800px] max-h-[800px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative shadow-2xl border-[10px] border-slate-800 rounded-lg overflow-hidden bg-slate-900 grid gap-px" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, width: 'min(90vw, 600px)', aspectRatio: '1/1' }}>
          {grid.map((rowArr, r) => rowArr.map((cell, c) => {
            const key = `${r},${c}`;
            const isStart = start.r === r && start.c === c;
            const isEnd = end.r === r && end.c === c;
            const isWall = cell === -1;
            const isWeight = cell === 5;
            const isPath = step?.path.some(n => n.r === r && n.c === c);
            const isVisited = step?.visited.has(key);
            const isFrontier = step?.frontier.has(key);
            const isCurrent = step?.currentNode?.r === r && step?.currentNode?.c === c;

            let bgColor = isWall ? 'bg-slate-950' : (isWeight ? 'bg-slate-800' : 'bg-slate-800/40');
            if (isVisited) bgColor = 'bg-slate-700/60';
            if (isFrontier) bgColor = 'bg-indigo-500/50';
            if (isPath) bgColor = 'bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)] z-10';
            if (isCurrent) bgColor = 'bg-indigo-300 animate-pulse z-20';

            return (
              <button key={key} onClick={() => handleCellClick(r, c)} className={`relative flex items-center justify-center transition-all ${bgColor} hover:brightness-125`}>
                {isStart && <MapIcon className="w-1/2 h-1/2 text-emerald-400 drop-shadow-lg z-30" />}
                {isEnd && <Flag className="w-1/2 h-1/2 text-rose-500 drop-shadow-lg z-30" />}
                {isWeight && !isPath && <Accessibility className="w-1/3 h-1/3 text-slate-600 opacity-50" />}
                {isWall && <Square className="w-1/2 h-1/2 text-slate-800" />}
                {isVisited && !isPath && !isStart && !isEnd && <div className="w-1.5 h-1.5 bg-indigo-500/20 rounded-full" />}
              </button>
            );
          }))}
        </div>
      </main>
    </div>
  );
}
