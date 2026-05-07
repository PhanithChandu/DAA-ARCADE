/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, 
  RotateCcw, 
  Cpu,
  Globe,
  Zap
} from 'lucide-react';
import { primsGenerator, Edge } from '../logic/mst';
import { useAudio } from '../contexts/AudioContext';

const NODES_COUNT = 8;
const GRID_SIZE = 600;

interface NodePos {
  id: number;
  x: number;
  y: number;
}

export default function MSTBuilder() {
  const { speak, isSpeaking } = useAudio();
  const [nodes, setNodes] = useState<NodePos[]>([]);

  const handleTutorAdvice = () => {
    const desc = mstResult 
      ? `Analysis complete. Your network used ${userWeight} units of cable. The optimal MST backbone requires ${mstWeight} units. Efficiency rating is ${efficiency} percent.`
      : `Network seeding complete. You have established ${userEdges.length} connections. To achieve optimal routing, ensure every city is reachable via the individual path of least resistance. Currently, ${nodes.filter(n => !userEdges.some(e => e.u === n.id || e.v === n.id)).length} nodes remain isolated.`;
    speak("Prime Network", desc);
  };
  const [edges, setEdges] = useState<Edge[]>([]);
  const [userEdges, setUserEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [mstResult, setMstResult] = useState<Edge[] | null>(null);

  useEffect(() => { generateNetwork(); }, []);

  const generateNetwork = () => {
    const newNodes: NodePos[] = [];
    const padding = 100;
    for (let i = 0; i < NODES_COUNT; i++) {
      newNodes.push({
        id: i,
        x: padding + Math.random() * (GRID_SIZE - padding * 2),
        y: padding + Math.random() * (GRID_SIZE - padding * 2),
      });
    }

    const newEdges: Edge[] = [];
    for (let i = 0; i < NODES_COUNT; i++) {
      for (let j = i + 1; j < NODES_COUNT; j++) {
        const dist = Math.sqrt(Math.pow(newNodes[i].x - newNodes[j].x, 2) + Math.pow(newNodes[i].y - newNodes[j].y, 2));
        newEdges.push({ u: i, v: j, weight: Math.round(dist / 10) });
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
    setUserEdges([]);
    setSelectedNode(null);
    setMstResult(null);
  };

  const handleNodeClick = (id: number) => {
    if (mstResult) return;
    if (selectedNode === null) {
      setSelectedNode(id);
    } else {
      if (selectedNode !== id) {
        // Toggle edge
        const u = Math.min(selectedNode, id);
        const v = Math.max(selectedNode, id);
        const exists = userEdges.find(e => e.u === u && e.v === v);
        
        if (exists) {
          setUserEdges(userEdges.filter(e => e !== exists));
        } else {
          const edge = edges.find(e => e.u === u && e.v === v);
          if (edge) setUserEdges([...userEdges, edge]);
        }
      }
      setSelectedNode(null);
    }
  };

  const calculateOptimal = () => {
    const gen = primsGenerator(NODES_COUNT, edges);
    let last: any = null;
    for (const s of gen) {
      last = s;
    }
    setMstResult(last.mst);
  };

  const userWeight = userEdges.reduce((acc, e) => acc + e.weight, 0);
  const mstWeight = edges.length > 0 ? (() => {
     // Quickly compute MST weight
     const gen = primsGenerator(NODES_COUNT, edges);
     let w = 0;
     for (const s of gen) w = s.totalWeight;
     return w;
  })() : 0;

  const efficiency = mstWeight > 0 ? Math.round((mstWeight / Math.max(userWeight, mstWeight)) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
      <aside className="w-full md:w-80 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col gap-6 shrink-0 z-10 overflow-y-auto">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Network className="w-5 h-5 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight uppercase text-white">Prime Network</h1>
          </div>
          <p className="text-xs text-slate-500 font-mono tracking-widest uppercase italic border-l-2 border-emerald-500 pl-2 ml-1">MST Strategy Game</p>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-2 font-mono">
            <div className="flex justify-between text-[10px] text-slate-500 uppercase">
              <span>Your Cost:</span>
              <span className={userWeight > mstWeight ? "text-rose-400" : "text-emerald-400"}>{userWeight}u</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 uppercase">
              <span>MST Target:</span>
              <span className="text-white font-bold">{mstWeight || 0}u</span>
            </div>
            {mstResult && (
              <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center">
                 <span className="text-[10px] text-slate-500 uppercase">Efficiency:</span>
                 <span className={`text-xs font-black ${efficiency >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>{efficiency}%</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {!mstResult ? (
              <button onClick={calculateOptimal} className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg transition-all active:scale-95 shadow-lg shadow-emerald-500/20 uppercase tracking-tighter"><Cpu className="w-5 h-5" /> Analyze Optimal Links</button>
            ) : (
              <button disabled className="flex items-center justify-center gap-2 w-full py-4 bg-slate-800 text-slate-500 font-black rounded-lg uppercase tracking-tighter">Simulation Complete</button>
            )}
            <button 
              onClick={handleTutorAdvice} 
              disabled={isSpeaking}
              className={`flex items-center justify-center gap-2 w-full py-3 bg-slate-900 border border-emerald-500/30 text-emerald-400 font-bold rounded-lg transition-all uppercase text-[10px] tracking-widest ${isSpeaking ? 'opacity-50 animate-pulse' : 'hover:bg-emerald-500/10'}`}
            >
              <Zap className={`w-3.5 h-3.5 ${isSpeaking ? 'fill-emerald-400' : ''}`} /> 
              {isSpeaking ? 'Analyzing Stream...' : 'AI Tactical Brief'}
            </button>
            <button onClick={generateNetwork} className="flex items-center justify-center gap-2 w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg border border-slate-700 transition-all uppercase text-xs"><RotateCcw className="w-4 h-4" /> Re-seed Nodes</button>
          </div>
          
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
             <div className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Tactical Brief:</div>
             <p className="text-[11px] text-slate-400 leading-relaxed uppercase font-medium">Click two cities to establish a connection. Build a fully connected network using the minimum cable possible. Compare against the AI MST Analysis.</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0f172a] opacity-30" />
        <svg width={GRID_SIZE} height={GRID_SIZE} viewBox={`0 0 ${GRID_SIZE} ${GRID_SIZE}`} className="relative z-10 overflow-visible max-w-[90vw] max-h-[85vh]">
          {/* User Edges */}
          {userEdges.map((e, idx) => {
            const uPos = nodes[e.u];
            const vPos = nodes[e.v];
            const isMstEdge = mstResult?.some(me => me.u === e.u && me.v === e.v);
            
            return (
              <motion.line
                key={`u-edge-${idx}`}
                x1={uPos.x} y1={uPos.y} x2={vPos.x} y2={vPos.y}
                stroke={mstResult ? (isMstEdge ? '#10b981' : '#f43f5e') : '#10b981'}
                strokeWidth={4}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            );
          })}

          {/* MST Optimal Edges (Visible only after calculation) */}
          {mstResult && mstResult.map((e, idx) => {
             const uPos = nodes[e.u];
             const vPos = nodes[e.v];
             const isUserOwned = userEdges.some(ue => ue.u === e.u && ue.v === e.v);
             if (isUserOwned) return null; // Already drawn as green/red above
             
             return (
               <line
                 key={`mst-edge-${idx}`}
                 x1={uPos.x} y1={uPos.y} x2={vPos.x} y2={vPos.y}
                 stroke="#10b981"
                 strokeWidth={1}
                 strokeDasharray="4 4"
                 opacity={0.3}
               />
             );
          })}

          {/* Connect Preview */}
          {selectedNode !== null && nodes.map(n => {
            if (n.id === selectedNode) return null;
            return (
               <line 
                 key={`preview-${n.id}`}
                 x1={nodes[selectedNode].x} y1={nodes[selectedNode].y}
                 x2={n.x} y2={n.y}
                 stroke="#334155" strokeWidth={1} strokeDasharray="2 2"
               />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNode === node.id;
            const isConnected = userEdges.some(e => e.u === node.id || e.v === node.id);

            return (
               <g key={`node-${node.id}`} onClick={() => handleNodeClick(node.id)} className="cursor-pointer group">
                 <motion.circle
                   cx={node.x} cy={node.y}
                   r={isSelected ? 16 : 10}
                   fill={isConnected ? '#1e293b' : '#0f172a'}
                   stroke={isSelected ? '#10b981' : (isConnected ? '#10b981' : '#334155')}
                   strokeWidth={2}
                   whileHover={{ scale: 1.2 }}
                 />
                 <text x={node.x} y={node.y} textAnchor="middle" dy=".3em" fontSize="10" 
                    fill={isSelected ? '#10b981' : 'white'} className="font-mono pointer-events-none select-none font-bold">
                    {node.id}
                 </text>
               </g>
            );
          })}
        </svg>

        {/* Tactical UI Decals */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
           <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-mono text-emerald-400">
             <Globe className="w-3 h-3" />
             <span>GEO_LOC: [ ACTIVE ]</span>
           </div>
        </div>
      </main>
    </div>
  );
}
