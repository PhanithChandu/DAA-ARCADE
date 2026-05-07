/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  RotateCcw, 
  Play, 
  Scale,
  Brain,
  Zap,
  Info,
  DollarSign
} from 'lucide-react';
import { solveKnapsack, Item } from '../logic/knapsack';

import { useAudio } from '../contexts/AudioContext';

const INITIAL_ITEMS: Item[] = [
  { id: 1, name: 'Relic A', weight: 4, value: 50 },
  { id: 2, name: 'Relic B', weight: 3, value: 40 },
  { id: 3, name: 'Relic C', weight: 2, value: 30 },
  { id: 4, name: 'Relic D', weight: 1, value: 15 },
  { id: 5, name: 'Relic E', weight: 5, value: 60 },
];

export default function KnapsackShopkeeper() {
  const { speak, isSpeaking } = useAudio();
  const [capacity, setCapacity] = useState(10);

  const handleTutorAdvice = () => {
    const desc = showResult
      ? `Optimal loadout calculated. Dynamic programming evaluated every possible sub-problem to find the absolute maximum value. Compare your manually selected ${currentValue} credits against the mathematical optimum of ${result?.table[items.length][capacity]}.`
      : `Inventory selection active. This is the 0/1 Knapsack problem. For every item, you must decide whether to include it or not. The goal is to maximize total value without exceeding the ${capacity}kg weight limit.`;
    speak("Knapsack Ops", desc);
  };
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<{ table: number[][]; selected: number[] } | null>(null);

  const currentWeight = items.filter(i => selectedIds.includes(i.id)).reduce((acc, i) => acc + i.weight, 0);
  const currentValue = items.filter(i => selectedIds.includes(i.id)).reduce((acc, i) => acc + i.value, 0);

  const toggleItem = (id: number) => {
    if (showResult) return;
    const item = items.find(i => i.id === id)!;
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(idx => idx !== id));
    } else {
      if (currentWeight + item.weight <= capacity) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const calculateOptimal = () => {
    const res = solveKnapsack(items, capacity);
    setResult(res);
    setShowResult(true);
  };

  const reset = () => {
    setSelectedIds([]);
    setShowResult(false);
    setResult(null);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
      <aside className="w-full md:w-80 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col gap-6 shrink-0 z-10 overflow-y-auto">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight uppercase text-white">Knapsack Ops</h1>
          </div>
          <p className="text-xs text-slate-500 font-mono tracking-widest uppercase italic border-l-2 border-amber-500 pl-2 ml-1">Dynamic Programming</p>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-3">
             <div className="flex justify-between items-center text-xs font-mono text-slate-400 uppercase">
               <span>LOAD CAP:</span>
               <span className="text-amber-400 font-bold">{capacity}kg</span>
             </div>
             <input type="range" min="5" max="25" value={capacity} onChange={(e) => { 
                setCapacity(parseInt(e.target.value));
                reset();
             }} className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500" disabled={showResult} />
          </div>

          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Current Payload</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${currentWeight > capacity ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300'}`}>{currentWeight} / {capacity}kg</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-end gap-1">
                <DollarSign className="w-4 h-4 text-emerald-400 mb-1" />
                <span className="text-3xl font-black tracking-tighter text-white">{currentValue}</span>
                <span className="text-xs font-mono text-slate-500 mb-1 uppercase tracking-tighter">Credits</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(currentWeight / capacity) * 100}%` }} className={`h-full ${currentWeight > capacity ? 'bg-rose-500' : 'bg-amber-400'}`} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {!showResult ? (
              <button onClick={calculateOptimal} className="flex items-center justify-center gap-2 w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg transition-all active:scale-95 shadow-lg shadow-amber-500/20 uppercase tracking-tighter"><Brain className="w-5 h-5" /> Calculate Optimum</button>
            ) : (
              <button onClick={reset} className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-500 text-slate-950 font-black rounded-lg transition-all uppercase tracking-tighter shadow-lg shadow-emerald-500/20"><RotateCcw className="w-5 h-5" /> New Loadout</button>
            )}
            <button 
              onClick={handleTutorAdvice} 
              disabled={isSpeaking}
              className={`flex items-center justify-center gap-2 w-full py-3 bg-slate-900 border border-emerald-500/30 text-emerald-400 font-bold rounded-lg transition-all uppercase text-[10px] tracking-widest ${isSpeaking ? 'opacity-50 animate-pulse' : 'hover:bg-emerald-500/10'}`}
            >
              <Zap className={`w-3.5 h-3.5 ${isSpeaking ? 'fill-emerald-400' : ''}`} /> 
              {isSpeaking ? 'Analyzing Stream...' : 'AI Tactical Brief'}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 bg-slate-950 p-6 md:p-12 overflow-auto">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const isOptimal = result?.selected.includes(item.id);
                const showOptimalIndicator = showResult && isOptimal;
                const showUserIncorrect = showResult && isSelected && !isOptimal;

                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleItem(item.id)}
                    className={`relative p-6 rounded-2xl border-2 transition-all flex flex-col gap-4 text-left ${isSelected ? 'bg-amber-400 border-amber-300 text-slate-950' : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-white/10 rounded-xl"><Scale className={`w-6 h-6 ${isSelected ? 'text-slate-950' : 'text-amber-500'}`} /></div>
                      <div className={`px-2 py-1 rounded font-mono text-[10px] font-bold ${isSelected ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>ID: {item.id}#</div>
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight leading-none">{item.name}</h3>
                      <div className="flex gap-4 mt-2 font-mono text-sm opacity-80 uppercase font-bold"><span>{item.weight}kg</span><span>{item.value}$</span></div>
                    </div>
                    <AnimatePresence>
                      {showOptimalIndicator && <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="absolute -top-3 -right-3 bg-emerald-500 text-slate-950 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg border border-emerald-300">Optimal Pick</motion.div>}
                      {showUserIncorrect && <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="absolute -top-3 -right-3 bg-rose-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg border border-rose-300">Non-Optimal</motion.div>}
                    </AnimatePresence>
                    {isSelected && <div className="absolute inset-0 bg-white/20 rounded-2xl pointer-events-none blur-sm" />}
                  </motion.button>
                );
              })}
           </div>

           {showResult && (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-3xl flex flex-col gap-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Algorithm Analysis</h2>
                    <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">DP Result Comparison</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                       <span className="block text-[8px] font-black text-slate-500 uppercase mb-1">User Score</span>
                       <span className="text-2xl font-black text-white">{currentValue}</span>
                    </div>
                    <div className="bg-emerald-500 p-4 rounded-xl shadow-lg shadow-emerald-500/20">
                       <span className="block text-[8px] font-black text-slate-950/60 uppercase mb-1">Optimal Score</span>
                       <span className="text-2xl font-black text-slate-950">{result?.table[items.length][capacity]}</span>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed max-w-2xl font-medium uppercase tracking-tight">
                  <span className="text-amber-400 font-bold block mb-1">Observation:</span> {currentValue === result?.table[items.length][capacity] ? "Perfect balance. Your heuristic matched the DP optimum." : `The DP algorithm yielded ${result!.table[items.length][capacity] - currentValue} more credits. Static selection logic outperformed manual heuristics.`}
                </div>
             </motion.div>
           )}
        </div>
      </main>
    </div>
  );
}
