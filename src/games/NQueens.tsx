/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, 
  RotateCcw, 
  Play, 
  Pause, 
  Settings2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { isSafe, solveNQueensGenerator, SolverStep } from '../logic/nqueens';

import { useAudio } from '../contexts/AudioContext';

type GameStatus = 'idle' | 'playing' | 'solving' | 'won' | 'lost';

export default function NQueens() {
  const { speak, isSpeaking } = useAudio();
  const [boardSize, setBoardSize] = useState(8);

  const handleTutorAdvice = () => {
    const desc = status === 'won'
      ? `Configuration secured. All ${boardSize} queens have been placed such that no two attack each other. The backtracking logic successfully explored the state space and pruned invalid branches.`
      : status === 'solving'
      ? `Backtracking solver is active. It places a queen and recursively attempts to solve the remaining board. If it hits a conflict, it 'backtracks' to the previous state to try a different configuration.`
      : `N-Queens defense active. Place towers on the ${boardSize} by ${boardSize} grid. No two towers can share a row, column, or diagonal. Use the trace feature to see the algorithm solve it step-by-step.`;
    speak("N-Queens Defense", desc);
  };
  const [queens, setQueens] = useState<number[]>(Array(8).fill(-1));
  const [status, setStatus] = useState<GameStatus>('idle');
  const [solverStep, setSolverStep] = useState<SolverStep | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(200);
  const [isPaused, setIsPaused] = useState(false);
  const [conflicts, setConflicts] = useState<{ row: number; col: number }[]>([]);

  const solverRef = useRef<Generator<SolverStep> | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const initialQueens = Array(boardSize).fill(-1);
    setQueens(initialQueens);
    setStatus('idle');
    setSolverStep(null);
    setConflicts([]);
    stopSolving();
  }, [boardSize]);

  const stopSolving = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    solverRef.current = null;
  };

  const resetGame = () => {
    stopSolving();
    setQueens(Array(boardSize).fill(-1));
    setStatus('idle');
    setSolverStep(null);
    setConflicts([]);
    setIsPaused(false);
  };

  const handleSquareClick = (row: number, col: number) => {
    if (status === 'solving' || status === 'won') return;
    const newQueens = [...queens];
    if (newQueens[row] === col) newQueens[row] = -1;
    else newQueens[row] = col;
    setQueens(newQueens);
    checkStatus(newQueens);
  };

  const checkStatus = (currentBoard: number[]) => {
    const newConflicts: { row: number; col: number }[] = [];
    let placedCount = 0;
    for (let i = 0; i < boardSize; i++) {
        const col = currentBoard[i];
        if (col !== -1) {
            placedCount++;
            if (!isSafe(currentBoard, i, col)) newConflicts.push({ row: i, col });
        }
    }
    setConflicts(newConflicts);
    if (placedCount === boardSize && newConflicts.length === 0) setStatus('won');
    else if (placedCount > 0) setStatus('playing');
    else setStatus('idle');
  };

  const resumeSolving = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = window.setInterval(() => {
      if (!solverRef.current) return;
      const { value, done } = solverRef.current.next();
      if (done) {
        stopSolving();
        setStatus('won');
        return;
      }
      setSolverStep(value);
      setQueens(value.board);
    }, playbackSpeed);
  }, [boardSize, playbackSpeed]);

  const startSolving = () => {
    resetGame();
    setTimeout(() => {
      setStatus('solving');
      solverRef.current = solveNQueensGenerator(boardSize);
      resumeSolving();
    }, 100);
  };

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      resumeSolving();
    } else {
      setIsPaused(true);
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (status === 'solving' && !isPaused) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      resumeSolving();
    }
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [playbackSpeed, isPaused, resumeSolving, status]);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
      <aside className="w-full md:w-80 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col gap-6 shrink-0 z-10 overflow-y-auto">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight uppercase text-white">N-Queens Defense</h1>
          </div>
          <p className="text-xs text-slate-500 font-mono tracking-widest uppercase italic border-l-2 border-emerald-500 pl-2 ml-1">Backtracking Algorithm</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Board Size</h3>
            <div className="flex flex-wrap gap-2">
              {[4, 5, 8, 10, 12].map((n) => (
                <button key={n} onClick={() => setBoardSize(n)} className={`flex-1 min-w-[50px] px-3 py-2 rounded-md text-xs font-mono transition-all border ${boardSize === n ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-700'}`} disabled={status === 'solving'}>{n}x{n}</button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {status !== 'solving' ? (
              <button onClick={startSolving} className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg transition-all active:scale-95 shadow-lg shadow-emerald-500/20 uppercase tracking-tighter"><Play className="w-5 h-5 fill-current" /> Run Logic Trace</button>
            ) : (
                <button onClick={togglePause} className={`flex items-center justify-center gap-2 w-full py-4 font-black rounded-lg transition-all uppercase tracking-tighter ${isPaused ? 'bg-blue-500 text-slate-950 shadow-blue-500/20' : 'bg-amber-500 text-slate-950 shadow-amber-500/20'}`}>{isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}{isPaused ? 'Resume Trace' : 'Pause Trace'}</button>
            )}
            <button onClick={resetGame} className="flex items-center justify-center gap-2 w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg border border-slate-700 transition-all uppercase text-xs"><RotateCcw className="w-4 h-4" /> Reset Grid</button>
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
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Trace Frequency</h3>
            <input type="range" min="20" max="1000" step="20" value={1020 - playbackSpeed} onChange={(e) => setPlaybackSpeed(1020 - parseInt(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
            <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase tracking-widest font-bold"><span>Slow</span><span>Fast</span></div>
          </div>

          <div className="mt-auto grid grid-cols-1 gap-2 p-4 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono"><div className="w-3 h-3 bg-emerald-500 border border-emerald-400 rounded-sm" /><span>VALID POSITION</span></div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono"><div className="w-3 h-3 bg-rose-500 border border-rose-400 rounded-sm" /><span>LOGIC ERROR</span></div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono"><div className="w-3 h-3 bg-blue-500/40 border border-blue-400 rounded-sm" /><span>SCANNING ROW</span></div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-h-0 relative flex items-center justify-center p-6 md:p-12 bg-slate-950 overflow-auto">
        <div className="absolute inset-0 bg-[#0f172a] opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[800px] max-h-[800px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative shadow-2xl border-[12px] border-slate-800 rounded-xl overflow-hidden bg-slate-900 ring-1 ring-white/10">
          <div className="grid" style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`, width: 'min(85vw, 600px)', height: 'min(85vw, 600px)' }}>
            {Array.from({ length: boardSize * boardSize }).map((_, idx) => {
              const row = Math.floor(idx / boardSize);
              const col = idx % boardSize;
              const isBlack = (row + col) % 2 === 1;
              const hasQueen = queens[row] === col;
              const isCheckingRow = solverStep?.currentRow === row;
              const isScanningCell = isCheckingRow && solverStep?.currentCol === col;
              const isFailedScan = isScanningCell && !solverStep?.isSafe;
              const isConflict = conflicts.some(c => c.row === row && c.col === col);

              return (
                <button key={idx} onClick={() => handleSquareClick(row, col)} className={`relative transition-colors duration-150 aspect-square flex items-center justify-center ${isBlack ? 'bg-slate-800' : 'bg-slate-700/50'} ${isCheckingRow && !isScanningCell ? 'bg-blue-500/5' : ''} ${isScanningCell ? (isFailedScan ? 'bg-rose-500/30' : 'bg-emerald-500/30') : ''} border-[0.5px] border-white/5`}>
                  <AnimatePresence mode="popLayout">
                    {hasQueen && (
                      <motion.div initial={{ scale: 0, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0, opacity: 0 }} key={`queen-${row}-${col}`} className="w-4/5 h-4/5 flex items-center justify-center">
                        <div className={`w-full h-full rounded-md flex items-center justify-center shadow-xl relative ${isConflict || (isScanningCell && isFailedScan) ? 'bg-rose-500 text-white' : 'bg-emerald-400 text-slate-950'}`}>
                          <Crown className="w-1/2 h-1/2" strokeWidth={2.5} />
                          <div className="absolute inset-0 rounded-md bg-white/10 blur-[1px]" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {isScanningCell && <motion.div layoutId="scanner" className={`absolute inset-0 z-10 border-2 ${isFailedScan ? 'border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} initial={false} />}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {status === 'won' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md">
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-emerald-500 p-1 rounded-2xl shadow-2xl">
                  <div className="bg-slate-950 px-10 py-8 rounded-[14px] flex flex-col items-center gap-4 text-center border border-white/10">
                    <div className="p-4 bg-emerald-500/20 rounded-full border border-emerald-500/50">
                      <ShieldCheck className="w-12 h-12 text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tight text-white">Grid Secured</h2>
                    <button onClick={resetGame} className="w-full py-4 bg-emerald-500 text-slate-950 font-black rounded-lg hover:bg-emerald-400 transition-colors uppercase tracking-tight shadow-lg shadow-emerald-500/20">Analyze New Grid</button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
