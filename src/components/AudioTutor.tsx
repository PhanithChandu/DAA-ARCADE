
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  User, 
  Gauge, 
  Type, 
  RefreshCcw,
  AudioLines,
  Square
} from 'lucide-react';

import { useAudio } from '../contexts/AudioContext';

export default function AudioTutor() {
  const { settings, updateSettings, stop, isSpeaking } = useAudio();
  const [isOpen, setIsOpen] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTutor = () => {
    const nextEnabled = !settings.isEnabled;
    updateSettings({ isEnabled: nextEnabled });
    // If the user disables audio while speaking, cancel immediately.
    if (!nextEnabled) stop();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
          isOpen 
          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-100'
        }`}
      >
        <AudioLines className={`w-4 h-4 ${settings.isEnabled ? 'animate-pulse' : ''}`} />
        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Audio Tutor</span>
        <ChevronRight className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute top-12 right-0 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-[100] overflow-hidden"
          >
            {/* Header / Main Toggle */}
            <div className="p-4 flex items-center justify-between border-b border-white/5">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white">Audio</h3>
                <p className="text-[10px] text-slate-500 font-medium leading-none">Plays as tutor messages are generated</p>
              </div>
              <button 
                onClick={toggleTutor}
                className={`w-10 h-5 rounded-full transition-colors relative ${settings.isEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <motion.div 
                  className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full"
                  animate={{ x: settings.isEnabled ? 20 : 0 }}
                />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-2 space-y-1">
              <div className="px-3 py-1 text-[9px] font-black text-slate-500 uppercase tracking-widest">Configuration</div>
              <MenuButton
                icon={Square}
                label="Stop Audio"
                value={isSpeaking ? 'Playing' : 'Idle'}
                onClick={() => stop()}
              />
              <MenuButton 
                icon={User} 
                label="Tutor Voice" 
                value={settings.voice} 
                onClick={() => {
                  const availableVoices = window.speechSynthesis.getVoices();
                  if (availableVoices.length === 0) return;
                  const index = availableVoices.findIndex(v => v.name === settings.voice);
                  const nextIndex = (index + 1) % availableVoices.length;
                  const nextVoice = availableVoices[nextIndex].name;
                  updateSettings({ voice: nextVoice });
                  
                  // Quick voice test
                  const tester = new SpeechSynthesisUtterance("Voice protocol updated.");
                  tester.voice = availableVoices[nextIndex];
                  tester.rate = settings.speed;
                  window.speechSynthesis.speak(tester);
                }} 
              />
              <MenuButton 
                icon={Gauge} 
                label="Audio Speed" 
                value={`${settings.speed}x`} 
                onClick={() => {
                  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
                  const currentIndex = speeds.indexOf(settings.speed);
                  const nextIndex = (currentIndex + 1) % speeds.length;
                  updateSettings({ speed: speeds[nextIndex] });
                }} 
              />
              <MenuButton 
                icon={Type} 
                label="Text Flow" 
                value={settings.textFlow ? "Active" : "Off"} 
                onClick={() => {
                  updateSettings({ textFlow: !settings.textFlow });
                }} 
              />
            </div>

            {/* Footer Toggle */}
            <div className="px-4 py-3 border-t border-white/5 bg-slate-950/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-800 rounded-lg">
                    <RefreshCcw className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-300">Auto Continue</span>
                    <p className="text-[9px] text-slate-600 leading-none">Continue to next message</p>
                  </div>
                </div>
                <button 
                  onClick={() => updateSettings({ autoContinue: !settings.autoContinue })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${settings.autoContinue ? 'bg-emerald-500' : 'bg-slate-800 border border-slate-700'}`}
                >
                  <motion.div 
                    className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full"
                    animate={{ x: settings.autoContinue ? 20 : 0 }}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuButton({ icon: Icon, label, value, onClick }: { icon: any, label: string, value: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors group"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
        <span className="text-[11px] font-medium text-slate-300">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-slate-500">{value}</span>
        <ChevronRight className="w-3 h-3 text-slate-700 group-hover:translate-x-0.5 transition-all" />
      </div>
    </button>
  );
}
