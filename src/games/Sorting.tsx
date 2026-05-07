/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  RotateCcw, 
  Play, 
  Pause, 
  Zap,
  Swords,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { bubbleSort, quickSort, SortStep } from '../logic/sorting';

const ALGORITHMS = [
  { id: 'bubble', name: 'Bubble Sort', complexity: 'O(n²)' },
  { id: 'quick', name: 'Quick Sort', complexity: 'O(n log n)' },
];

import { useAudio } from '../contexts/AudioContext';

export default function SortingRace() {
  const { speak, isSpeaking } = useAudio();
  const [algo, setAlgo] = useState('bubble');
  const [arraySize, setArraySize] = useState(25);
  const [array, setArray] = useState<number[]>([]);
  const [step, setStep] = useState<SortStep | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(50);
  const [isPaused, setIsPaused] = useState(false);
  const [isSorting, setIsSorting] = useState(false);

  const handleTutorAdvice = () => {
    const currentAlgo = ALGORITHMS.find(a => a.id === algo)?.name;
    const desc = isSorting 
      ? `Currently sorting using ${currentAlgo}. ${step?.swapping.length ? 'A swap operation is occurring.' : 'Comparing elements.'} ${step?.sortedIndices.size} elements are already in their final position.`
      : `Ready to begin ${currentAlgo} on an array of ${arraySize} elements. The complexity is ${ALGORITHMS.find(a => a.id === algo)?.complexity}.`;
    speak("Sorting Warriors", desc);
  };

  const solverRef = useRef<Generator<SortStep> | null>(null);
  const intervalRef = useRef<number | null>(null);

  const [customInput, setCustomInput] = useState('');

  useEffect(() => { generateArray(); }, [arraySize]);

  const generateArray = () => {
    stopSorting();
    const newArr = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 90) + 10);
    setArray(newArr);
    setCustomInput(newArr.join(', '));
    setStep(null);
    setIsSorting(false);
    setIsPaused(false);
  };

  const handleCustomInput = (val: string) => {
    setCustomInput(val);
    const parsed = val.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    if (parsed.length > 0) {
      stopSorting();
      setArray(parsed);
      setStep(null);
      setIsSorting(false);
    }
  };

  const stopSorting = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
    solverRef.current = null;
  };

  const startSorting = () => {
    stopSorting();
    setIsSorting(true);
    setIsPaused(false);
    const generator = algo === 'bubble' ? bubbleSort(array) : quickSort(array);
    solverRef.current = generator;
    resumeSorting();
  };

  const resumeSorting = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = window.setInterval(() => {
      if (!solverRef.current) return;
      const { value, done } = solverRef.current.next();
      if (done) {
        stopSorting();
        setIsSorting(false);
        return;
      }
      setStep(value);
      setArray(value.array);
    }, playbackSpeed);
  }, [playbackSpeed]);

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      resumeSorting();
    } else {
      setIsPaused(true);
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (isSorting && !isPaused) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      resumeSorting();
    }
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [playbackSpeed, isPaused, resumeSorting, isSorting]);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
      <aside className="w-full md:w-80 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col gap-6 shrink-0 z-10 overflow-y-auto font-sans">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Swords className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight uppercase text-white">Sorting Warriors</h1>
          </div>
          <p className="text-xs text-slate-500 font-mono tracking-widest uppercase italic border-l-2 border-blue-500 pl-2 ml-1">Complexity Battle</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Pattern Selection</h3>
            <div className="flex flex-col gap-2">
              {ALGORITHMS.map((a) => (
                <button key={a.id} onClick={() => setAlgo(a.id)} className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all border ${algo === a.id ? 'bg-blue-500/10 border-blue-400 text-blue-400 font-bold shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'}`} disabled={isSorting}>
                  <span>{a.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-950 rounded font-mono border border-slate-700">{a.complexity}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Custom Data Matrix</h3>
            <input 
              type="text" 
              value={customInput}
              onChange={(e) => handleCustomInput(e.target.value)}
              placeholder="e.g. 10, 50, 30, 25"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-blue-400 focus:border-blue-500 outline-none"
              disabled={isSorting}
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Array Scale</h3>
            <div className="flex items-center gap-3">
              <input type="range" min="10" max="100" value={arraySize} onChange={(e) => setArraySize(parseInt(e.target.value))} className="flex-1 accent-blue-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" disabled={isSorting} />
              <span className="text-xs font-mono text-blue-400 w-8">{arraySize}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {!isSorting ? (
              <button onClick={startSorting} className="flex items-center justify-center gap-2 w-full py-4 bg-blue-500 hover:bg-blue-400 text-slate-950 font-black rounded-lg transition-all active:scale-95 shadow-lg shadow-blue-500/20 uppercase tracking-tighter"><Play className="w-5 h-5 fill-current" /> Begin Sort Sequence</button>
            ) : (
                <button onClick={togglePause} className="flex items-center justify-center gap-2 w-full py-4 bg-amber-500 text-slate-950 font-black rounded-lg transition-all uppercase tracking-tighter shadow-lg shadow-amber-500/20">{isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}{isPaused ? 'Resume Sync' : 'Halt Sync'}</button>
            )}
            <button 
              onClick={handleTutorAdvice} 
              disabled={isSpeaking}
              className={`flex items-center justify-center gap-2 w-full py-3 bg-slate-900 border border-emerald-500/30 text-emerald-400 font-bold rounded-lg transition-all uppercase text-[10px] tracking-widest ${isSpeaking ? 'opacity-50 animate-pulse' : 'hover:bg-emerald-500/10'}`}
            >
              <Zap className={`w-3.5 h-3.5 ${isSpeaking ? 'fill-emerald-400' : ''}`} /> 
              {isSpeaking ? 'Analyzing Stream...' : 'AI Tactical Brief'}
            </button>
            <button onClick={generateArray} className="flex items-center justify-center gap-2 w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg border border-slate-700 transition-all uppercase text-xs"><RotateCcw className="w-4 h-4" /> Reset Data</button>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Processing Rate</h3>
            <input type="range" min="5" max="500" step="5" value={505 - playbackSpeed} onChange={(e) => setPlaybackSpeed(505 - parseInt(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase tracking-widest font-bold"><span>Slow</span><span>Fast</span></div>
          </div>
          
          <div className="flex flex-col gap-2 p-4 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono"><div className="w-3 h-3 bg-amber-400 rounded-sm" /><span>COMPARING</span></div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono"><div className="w-3 h-3 bg-rose-500 rounded-sm" /><span>SWAPPING</span></div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono"><div className="w-3 h-3 bg-blue-500 rounded-sm" /><span>VIRTUAL PIVOT</span></div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono"><div className="w-3 h-3 bg-emerald-500 rounded-sm" /><span>LOCKED (SORTED)</span></div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-h-0 bg-slate-950 p-6 md:p-12 relative flex items-end justify-center gap-1 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-blue-900/10 blur-[120px] pointer-events-none" />

        {array.map((val, idx) => {
          const isComparing = step?.comparing.includes(idx);
          const isSwapping = step?.swapping.includes(idx);
          const isPivot = step?.pivots.includes(idx);
          const isSorted = step?.sortedIndices.has(idx);

          const color = isSwapping ? 'bg-rose-500' : 
                        isComparing ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 
                        isPivot ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse' : 
                        isSorted ? 'bg-emerald-500' : 'bg-slate-700';

          return (
            <motion.div
              layout
              key={`bar-${idx}`}
              className={`flex-1 rounded-t-sm transition-colors duration-150 relative flex items-end justify-center group/bar ${color}`}
              style={{ height: `${val}%`, minWidth: '12px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <span className={`absolute -top-6 text-[10px] font-mono font-bold transition-opacity whitespace-nowrap ${isComparing || isSwapping ? 'opacity-100 text-white' : 'opacity-0 group-hover/bar:opacity-100 text-slate-500'}`}>
                {val}
              </span>
            </motion.div>
          );
        })}
      </main>
    </div>
  );
}
