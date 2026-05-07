/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft,
  Navigation,
  ShoppingBag,
  Swords,
  Network,
  FileArchive,
  Crown,
  LayoutGrid,
  Menu,
  Terminal,
  Cpu,
  Binary,
  AudioLines,
  Square
} from 'lucide-react';

// Game Components
import Pathfinding from './games/Pathfinding';
import KnapsackShopkeeper from './games/Knapsack';
import SortingRace from './games/Sorting';
import MSTBuilder from './games/MST';
import HuffmanCoding from './games/Huffman';
import NQueens from './games/NQueens.tsx';

type GameId = 'pathfinding' | 'knapsack' | 'sorting' | 'mst' | 'huffman' | 'nqueens' | null;

interface GameModule {
  id: GameId;
  name: string;
  concept: string;
  description: string;
  icon: any;
  color: string;
  component: React.FC;
}

const MODULES: GameModule[] = [
  {
    id: 'pathfinding',
    name: 'Shortest Path Maze',
    concept: "Dijkstra's Algorithm",
    description: 'Construct mazes and witness the search for the optimal path through weighted terrain.',
    icon: Navigation,
    color: 'indigo',
    component: Pathfinding
  },
  {
    id: 'knapsack',
    name: 'Knapsack Ops',
    concept: 'Dynamic Programming',
    description: 'Maximize cargo profit within weight limits using zero-one DP logic.',
    icon: ShoppingBag,
    color: 'amber',
    component: KnapsackShopkeeper
  },
  {
    id: 'sorting',
    name: 'Sorting Warriors',
    concept: 'Algorithm Complexity',
    description: 'Visualize the efficiency of Bubble Sort vs Quick Sort in real-time.',
    icon: Swords,
    color: 'blue',
    component: SortingRace
  },
  {
    id: 'mst',
    name: 'Prime Network',
    concept: "Prim's Algorithm (MST)",
    description: 'Design the most cost-efficient minimal network to connect all regional nodes.',
    icon: Network,
    color: 'emerald',
    component: MSTBuilder
  },
  {
    id: 'huffman',
    name: 'Huffman Morse',
    concept: 'Greedy Encoding',
    description: 'Master binary compression tactics by building optimal coding trees.',
    icon: FileArchive,
    color: 'rose',
    component: HuffmanCoding
  },
  {
    id: 'nqueens',
    name: 'The N-Queens Defense',
    concept: 'Backtracking Logic',
    description: 'Deploy defensive units so no two share the same line of fire.',
    icon: Crown,
    color: 'emerald',
    component: NQueens
  }
];

import { AudioProvider, useAudio } from './contexts/AudioContext';
import AudioTutor from './components/AudioTutor';
import ChatBot from './components/ChatBot';

export default function App() {
  return (
    <AudioProvider>
      <AppContent />
      <ChatBot />
    </AudioProvider>
  );
}

function AppContent() {
  const [activeGame, setActiveGame] = useState<GameId>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const CurrentGame = activeGame ? MODULES.find(m => m.id === activeGame)?.component : null;
  const { isSpeaking, lastTranscript, spokenIndex, settings, stop } = useAudio();
  const [displayTranscript, setDisplayTranscript] = useState('');

  const exitModule = () => {
    stop();
    setActiveGame(null);
  };

  useEffect(() => {
    if (!settings.textFlow) {
      setDisplayTranscript(lastTranscript);
      return;
    }

    if (isSpeaking) {
      // Find the next space after spokenIndex to avoid cutting words in half
      const nextSpace = lastTranscript.indexOf(' ', spokenIndex + 1);
      const sliceEnd = nextSpace === -1 ? lastTranscript.length : nextSpace;
      setDisplayTranscript(lastTranscript.slice(0, sliceEnd));
    } else {
      setDisplayTranscript(lastTranscript);
    }
  }, [isSpeaking, lastTranscript, spokenIndex, settings.textFlow]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-emerald-500/30 flex flex-col overflow-hidden">
      {/* Top Header Navigation */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={exitModule}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-all">
              <Binary className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black uppercase tracking-tighter leading-none m-0 p-0">DAA Arcade</span>
              <span className="text-[9px] font-mono text-emerald-500/60 uppercase tracking-[0.2em]">Diagnostic Analytics Hub</span>
            </div>
          </button>

          {activeGame && (
            <button
              onClick={exitModule}
              className="hidden md:flex items-center gap-3 pl-6 border-l border-slate-800 hover:text-slate-200 transition-colors group"
              aria-label="Back to modules"
              title="Back to modules"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-200 transition-colors">
                System Profile: {MODULES.find(m => m.id === activeGame)?.name}
              </span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
           {activeGame && <AudioTutor />}
           <div className="hidden lg:flex items-center gap-6 mr-6">
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                <Terminal className="w-3 h-3" />
                <span>v1.0.4 - STABLE</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                <Cpu className="w-3 h-3" />
                <span>CPU_LOAD: 2.4%</span>
              </div>
           </div>
           
           {activeGame && (
             <button 
               onClick={exitModule}
               className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-tight border border-slate-700"
             >
               <ChevronLeft className="w-4 h-4" />
               Back
             </button>
           )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <AnimatePresence>
          {isSpeaking && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[60] w-full max-w-2xl px-6 pointer-events-none"
            >
              <div className="bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-6 shadow-2xl flex items-start gap-4">
                 <div className="p-2 bg-emerald-500/20 rounded-xl shrink-0">
                    <AudioLines className="w-5 h-5 text-emerald-400 animate-pulse" />
                 </div>
                 <div className="space-y-1">
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none">Tactical AI Stream</span>
                    <p className="text-sm font-medium text-slate-200 leading-relaxed italic">{displayTranscript}</p>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!activeGame ? (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 overflow-y-auto p-6 md:p-12 scrollbar-none"
            >
              <div className="max-w-6xl mx-auto space-y-12">
                <div className="space-y-2">
                   <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">Select Algorithm <span className="text-emerald-500">Node</span></h1>
                   <p className="text-slate-500 max-w-xl font-medium text-sm md:text-base">Comprehensive diagnostic environments for Design and Analysis of Algorithms. Select a module to begin simulation.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {MODULES.map((mod, idx) => (
                    <motion.button
                      key={mod.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveGame(mod.id)}
                      className="group relative flex flex-col text-left bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-emerald-500/50 transition-colors"
                    >
                      <div className={`h-2 w-full bg-${mod.color}-500/50`} />
                      <div className="p-8 space-y-4">
                        <div className={`p-3 w-fit bg-${mod.color}-500/10 rounded-xl`}>
                          <mod.icon className={`w-8 h-8 text-${mod.color}-400`} />
                         <button
                           onClick={stop}
                           className="pointer-events-auto shrink-0 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700 text-slate-200 transition-colors"
                           aria-label="Stop audio"
                           title="Stop audio"
                         >
                           <Square className="w-4 h-4" />
                         </button>
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-emerald-400 transition-colors">{mod.name}</h3>
                          <div className="text-[10px] font-mono text-emerald-500/60 uppercase tracking-[0.2em]">{mod.concept}</div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed uppercase font-bold tracking-tight opacity-70 group-hover:opacity-100 transition-opacity">{mod.description}</p>
                      </div>
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-30 transition-opacity">
                         <LayoutGrid className="w-12 h-12 text-white" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {CurrentGame && <CurrentGame />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistent Status Bar */}
      <footer className="h-10 border-t border-slate-800 bg-slate-950 px-6 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-6 text-[9px] font-mono text-slate-600 uppercase tracking-widest font-bold">
           <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span>SIGNAL_STRENGTH: 100%</span>
           </div>
           <div className="hidden sm:block">ENCRYPTION: AES-256_ACTIVE</div>
        </div>
        <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest font-bold">
           SESSION: {new Date().toLocaleTimeString()}
        </div>
      </footer>
    </div>
  );
}
