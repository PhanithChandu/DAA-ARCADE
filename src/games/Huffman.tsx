/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileArchive, 
  RotateCcw, 
  Play, 
  Cpu,
  ChevronRight,
  Database,
  Search,
  CheckCircle2,
  Binary,
  Zap
} from 'lucide-react';
import { buildHuffmanTree, getHuffmanCodes, HuffmanNode } from '../logic/huffman';
import { useAudio } from '../contexts/AudioContext';

const DEFAULT_FREQ: Record<string, number> = {
  'A': 45,
  'B': 13,
  'C': 12,
  'D': 16,
  'E': 9,
  'F': 5
};

export default function HuffmanCoding() {
  const { speak, isSpeaking } = useAudio();
  const [frequencies, setFrequencies] = useState<Record<string, number>>(DEFAULT_FREQ);
  
  const handleTutorAdvice = () => {
    const desc = tree 
      ? `Coding tree established. The character '${Object.keys(frequencies).sort((a,b) => frequencies[b] - frequencies[a])[0]}' has the highest frequency and therefore the shortest binary path. Current decoding score is ${score}.`
      : `Frequency matrix initialized. Awaiting binary compilation. Adjust character weights to shift the optimal tree structure. Remember: greedy logic prioritizes the least frequent nodes first.`;
    speak("Huffman Morse", desc);
  };
  const [tree, setTree] = useState<HuffmanNode | null>(null);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [showTree, setShowTree] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [encoded, setEncoded] = useState('');
  const [challengeStr, setChallengeStr] = useState('');
  const [userDecode, setUserDecode] = useState('');
  const [score, setScore] = useState(0);

  const generateChallenge = () => {
    if (!tree) return;
    const chars = Object.keys(frequencies);
    let str = '';
    for(let i=0; i<4; i++) str += chars[Math.floor(Math.random() * chars.length)];
    setChallengeStr(str);
    setUserDecode('');
  };

  const checkDecode = (val: string) => {
    setUserDecode(val.toUpperCase());
    if (val.toUpperCase() === challengeStr) {
      setScore(prev => prev + 1);
      setTimeout(generateChallenge, 500);
    }
  };

  const generateTree = () => {
    const newTree = buildHuffmanTree(frequencies);
    const newCodes = getHuffmanCodes(newTree);
    setTree(newTree);
    setCodes(newCodes);
    setShowTree(true);
    generateChallenge();
  };

  useEffect(() => {
    if (tree) generateChallenge();
  }, [tree]);

  const handleFreqChange = (char: string, val: string) => {
    const num = parseInt(val) || 0;
    setFrequencies(prev => ({ ...prev, [char]: num }));
    setShowTree(false);
  };

  useEffect(() => {
    if (userInput) {
      let result = '';
      for (const char of userInput.toUpperCase()) {
        if (codes[char]) result += codes[char] + ' ';
      }
      setEncoded(result);
    } else {
      setEncoded('');
    }
  }, [userInput, codes]);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
      <aside className="w-full md:w-80 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col gap-6 shrink-0 z-10 overflow-y-auto">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <FileArchive className="w-5 h-5 text-rose-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight uppercase text-white">Huffman Morse</h1>
          </div>
          <p className="text-xs text-slate-500 font-mono tracking-widest uppercase italic border-l-2 border-rose-500 pl-2 ml-1">Greedy Compression</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Character Frequencies</h3>
             <div className="grid grid-cols-2 gap-2">
               {Object.entries(frequencies).map(([char, freq]) => (
                 <div key={char} className="flex gap-2">
                   <div className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded text-xs font-mono font-bold text-white border border-slate-700">{char}</div>
                   <input type="number" value={freq} onChange={(e) => handleFreqChange(char, e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 text-xs font-mono text-rose-400 focus:border-rose-500 outline-none" />
                 </div>
               ))}
             </div>
          </div>

          <button onClick={generateTree} className="flex items-center justify-center gap-2 w-full py-4 bg-rose-500 hover:bg-rose-400 text-slate-950 font-black rounded-lg transition-all active:scale-95 shadow-lg shadow-rose-500/20 uppercase tracking-tighter"><Cpu className="w-5 h-5" /> Compile Binary Matrix</button>

          <button 
            onClick={handleTutorAdvice} 
            disabled={isSpeaking}
            className={`flex items-center justify-center gap-2 w-full py-3 bg-slate-900 border border-emerald-500/30 text-emerald-400 font-bold rounded-lg transition-all uppercase text-[10px] tracking-widest ${isSpeaking ? 'opacity-50 animate-pulse' : 'hover:bg-emerald-500/10'}`}
          >
            <Zap className={`w-3.5 h-3.5 ${isSpeaking ? 'fill-emerald-400' : ''}`} /> 
            {isSpeaking ? 'Analyzing Stream...' : 'AI Tactical Brief'}
          </button>

          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Binary Dictionary</h3>
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col gap-2 max-h-[150px] overflow-y-auto">
              {Object.entries(codes).map(([char, code]) => (
                <div key={char} className="flex justify-between font-mono text-[10px]">
                  <span className="text-slate-500">{char}</span>
                  <span className="text-rose-400 font-bold">{code}</span>
                </div>
              ))}
              {Object.keys(codes).length === 0 && <span className="text-[9px] text-slate-600 italic">No matrix compiled...</span>}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 bg-slate-950 p-6 md:p-12 relative flex flex-col gap-8 overflow-auto">
        <div className="absolute inset-0 bg-[#0f172a] opacity-30" />
        
        {/* Decoding Challenge */}
        {tree && (
          <div className="relative z-10 w-full max-w-2xl mx-auto mb-4">
             <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 flex flex-col gap-6 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Binary className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-xl font-black uppercase tracking-tight text-white">Live Decoding Trap</h2>
                  </div>
                  <div className="px-3 py-1 bg-slate-950 rounded-full border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">Score: {score}</div>
                </div>

                <div className="space-y-4">
                   <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Binary Signal Stream</label>
                      <div className="p-6 bg-slate-950 rounded-xl border-l-4 border-emerald-500 text-3xl font-mono text-emerald-400/80 tracking-[0.2em] break-all leading-relaxed">
                        {challengeStr.split('').map(c => codes[c]).join(' ')}
                      </div>
                   </div>
                   
                   <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Decrypted Intent</label>
                      <input 
                        type="text" 
                        value={userDecode}
                        onChange={(e) => checkDecode(e.target.value)}
                        placeholder="DECODE ABOVE STREAM..."
                        className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl px-4 py-4 text-white font-mono text-2xl focus:border-emerald-500 outline-none tracking-widest uppercase text-center"
                      />
                   </div>
                </div>
                
                {userDecode === challengeStr && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center pointer-events-none">
                     <span className="text-4xl font-black text-emerald-400 uppercase tracking-tighter">Verified</span>
                  </motion.div>
                )}
             </div>
          </div>
        )}

        {/* Encoding Tester */}
        <div className="relative z-10 w-full max-w-2xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-rose-400" />
              <h2 className="text-xl font-black uppercase tracking-tight text-white">Message Encoder</h2>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Input Sequence</label>
              <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="ENTER TEXT TO COMPRESS..." className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl px-4 py-4 text-white font-mono text-lg focus:border-rose-500 outline-none tracking-widest uppercase" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Huffman Stream</label>
              <div className="w-full min-h-[100px] bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 break-all font-mono text-rose-400/80 leading-relaxed text-sm">
                {encoded || <span className="opacity-20 italic">Binary stream pending...</span>}
              </div>
            </div>

            {encoded && (
              <div className="flex justify-between items-center bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-tight flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> Compression Successful</span>
                <span className="text-[10px] font-mono text-rose-400">ENCODED_SIZE: {encoded.replace(/ /g, '').length} bits</span>
              </div>
            )}
          </div>
        </div>

        {/* Tree visualization would go here if complex; for now, a conceptual breakdown */}
        <div className="relative z-10 w-full max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
             <h4 className="text-xs font-black text-slate-300 uppercase mb-3 flex items-center gap-2"><Search className="w-3 h-3 text-rose-400" /> Algorithm Insight</h4>
             <p className="text-[11px] text-slate-500 leading-relaxed uppercase font-medium">Huffman coding uses a greedy strategy to assign shorter bit patterns to more frequent characters. It builds a terminal-weighted tree from the bottom-up.</p>
           </div>
           <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 font-mono text-[10px]">
             <div className="text-rose-400 mb-1 font-bold tracking-widest uppercase">Debug Logic:</div>
             <div className="text-slate-600">1. Sort by frequency.</div>
             <div className="text-slate-600">2. Combine 2 smallest nodes.</div>
             <div className="text-slate-600">3. Iterate until Root.</div>
             <div className="text-slate-600">4. Traversal: Left(0), Right(1).</div>
           </div>
        </div>
      </main>
    </div>
  );
}
